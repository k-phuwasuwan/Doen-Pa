import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { updateSession } from "../src/lib/supabase/proxy";

const cookieName = "sb-session-test-auth-token";
const user = { id: "test-user", aud: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };

function session(expiresAt: number) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const accessToken = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: expiresAt, iat: expiresAt - 3600, aud: "authenticated" })}.dGVzdA`;
  return { access_token: accessToken, refresh_token: "test-refresh-token", expires_at: expiresAt,
    expires_in: 3600, token_type: "bearer", user };
}

function requestWithSession(value: ReturnType<typeof session>) {
  const encoded = `base64-${Buffer.from(JSON.stringify(value)).toString("base64url")}`;
  return new NextRequest("https://doen-pa.test/passport", {
    headers: { cookie: `${cookieName}=${encoded}` },
  });
}

test("session proxy forwards anonymous requests without calling Auth", async (t) => {
  const oldEnv = process.env;
  process.env = { ...oldEnv, NEXT_PUBLIC_SUPABASE_URL: "https://session-test.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" };
  t.after(() => { process.env = oldEnv; });
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Anonymous requests should not fetch Auth");
  });
  const response = await updateSession(new NextRequest("https://doen-pa.test/search"));
  assert.equal(response.status, 200);
  assert.equal(response.cookies.getAll().length, 0);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("expired sessions refresh cookies for both server rendering and the browser", async (t) => {
  const oldEnv = process.env;
  process.env = { ...oldEnv, NEXT_PUBLIC_SUPABASE_URL: "https://session-test.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" };
  t.after(() => { process.env = oldEnv; });
  const refreshed = session(Math.floor(Date.now() / 1000) + 3600);
  const calls: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("/token?grant_type=refresh_token")) return Response.json(refreshed);
    if (url.endsWith("/user")) return Response.json(user);
    throw new Error("Unexpected Auth endpoint in session test");
  });

  const request = requestWithSession(session(Math.floor(Date.now() / 1000) - 3600));
  const response = await updateSession(request);
  assert.ok(calls.some((url) => url.includes("/token?grant_type=refresh_token")));
  const cookie = response.cookies.get(cookieName);
  assert.ok(cookie);
  assert.equal(cookie.secure, true);
  assert.equal(cookie.sameSite, "lax");
  assert.equal(request.cookies.get(cookieName)?.value, cookie.value);
  assert.ok(response.headers.get("x-middleware-request-cookie")?.includes(cookie.value));
  assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/);
  assert.equal(response.headers.get("pragma"), "no-cache");
  assert.equal(response.headers.get("expires"), "0");
  const stored = JSON.parse(Buffer.from(cookie.value.slice("base64-".length), "base64url").toString());
  assert.equal(stored.access_token, refreshed.access_token);

  // A later request with the new cookie must not refresh again.
  calls.length = 0;
  await updateSession(new NextRequest(request.url, { headers: { cookie: `${cookieName}=${cookie.value}` } }));
  assert.ok(calls.every((url) => !url.includes("/token?")));
});

test("revoked refresh tokens clear the session cookie", async (t) => {
  const oldEnv = process.env;
  process.env = { ...oldEnv, NEXT_PUBLIC_SUPABASE_URL: "https://session-test.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" };
  t.after(() => { process.env = oldEnv; });
  t.mock.method(globalThis, "fetch", async () => Response.json(
    { code: "refresh_token_not_found", message: "Refresh token not found" },
    { status: 400 },
  ));
  const request = requestWithSession(session(Math.floor(Date.now() / 1000) - 3600));
  const response = await updateSession(request);
  assert.equal(response.cookies.get(cookieName)?.value, "");
  assert.equal(response.cookies.get(cookieName)?.maxAge, 0);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
});
