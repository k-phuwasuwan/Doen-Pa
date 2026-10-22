import assert from "node:assert/strict";
import { test } from "node:test";
import { safeAuthNext, loginHref, authBackHref, postAuthDestination } from "../src/lib/auth/redirects";

test("auth redirects accept only app destinations and preserve stamp intent", () => {
  for (const value of [null, undefined, "https://evil.example", "//evil.example", "/\\evil.example", "/login", "/auth/logout", "/%2f%2fevil.example", "/passport\n", "/passport/../login"]) {
    assert.equal(safeAuthNext(value), "/search");
  }
  assert.equal(safeAuthNext("/profile?view=guest#anything"), "/profile");
  assert.equal(safeAuthNext("/records/new?placeId=place-khao-yai&returnTo=search&evil=1"), "/records/new?placeId=place-khao-yai&returnTo=search");
  assert.equal(safeAuthNext("/records/new"), "/search");
  assert.equal(loginHref("/profile/edit"), "/login?next=%2Fprofile%2Fedit");
  assert.equal(authBackHref("stats"), "/stats");
  assert.equal(authBackHref("https://evil.example"), "/passport");
});

test("first sign-in opens profile setup and normal login defaults to Search", () => {
  assert.equal(postAuthDestination(undefined, false), "/search");
  assert.equal(postAuthDestination("/stats", false), "/stats");
  assert.equal(postAuthDestination("/stats", true), "/profile/edit?setup=1");
  const stamp = "/records/new?placeId=place-khao-yai&returnTo=search";
  assert.equal(postAuthDestination(stamp, true), "/profile/edit?setup=1");
  assert.equal(postAuthDestination(stamp, false), stamp);
  assert.equal(postAuthDestination("/profile/edit", true), "/profile/edit?setup=1");
  assert.equal(postAuthDestination("https://other.example", true), "/profile/edit?setup=1");
  assert.equal(postAuthDestination("/reset-password", true), "/reset-password");
});

test("Login Back uses the stamp origin independently of the post-login destination", () => {
  const stamp = "/records/new?placeId=place-doi-inthanon";
  assert.equal(authBackHref(undefined, stamp), "/places/place-doi-inthanon");
  assert.equal(authBackHref(undefined, `${stamp}&returnTo=search`), "/search");
  assert.equal(authBackHref("profile", stamp), "/profile");
  assert.equal(authBackHref(undefined, "/records/new"), "/passport");
  assert.equal(authBackHref(undefined, "https://evil.example/records/new?placeId=place-doi-inthanon"), "/passport");
  assert.equal(authBackHref(undefined, "/records/new?placeId=%2F%2Fevil.example"), "/places/%2F%2Fevil.example");
  assert.equal(postAuthDestination(stamp, false), stamp);
});
