import { test, expect, openPage, testAccounts, appOrigin, type TestAccount } from "./fixtures";
import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.use({ signedIn: false });

async function login(page: Page, account: TestAccount, next = "/profile") {
  await openPage(page, `/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("อีเมล", { exact: true }).fill(account.email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
}

test("guests see public places but cannot open personal forms or adopt legacy data", async ({ page }) => {
  await openPage(page, "/search");
  await page.evaluate(() => {
    localStorage.setItem("doen-pa-current-user-v2", JSON.stringify({ id: "local-user", name: "Legacy private name", username: "legacy" }));
    localStorage.setItem("doen-pa-travel-records-v2", "legacy-original-sentinel");
  });
  for (const route of ["/passport", "/profile", "/stats"]) {
    await openPage(page, route);
    await expect(page.getByRole("link", { name: "เข้าสู่ระบบ", exact: true }).last()).toBeVisible();
    await expect(page.getByText("Legacy private name")).toHaveCount(0);
  }
  await openPage(page, "/profile/edit");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile%2Fedit$/);
  await openPage(page, "/records/new?placeId=place-khao-yai");
  await expect(page).toHaveURL(/\/login\?next=/);
  await openPage(page, "/places/place-khao-yai");
  await expect(page.getByRole("heading", { name: "อุทยานแห่งชาติเขาใหญ่", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("doen-pa-travel-records-v2"))).toBe("legacy-original-sentinel");
});

test("real login survives reload and logout clears the session in another tab", async ({ page, context }, testInfo) => {
  await openPage(page, "/login");
  await page.screenshot({ path: `/tmp/doen-pa-auth-login-${testInfo.project.name}.png` });
  await login(page, testAccounts[0]);
  await expect(page.getByText(`@${testAccounts[0].username}`, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "ออกจากระบบ", exact: true })).toBeVisible();
  expect((await context.cookies()).some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"))).toBe(true);
  const observer = await context.newPage();
  await openPage(observer, "/passport");
  await page.screenshot({ path: `/tmp/doen-pa-auth-profile-${testInfo.project.name}.png` });
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await expect(page.getByRole("link", { name: "เข้าสู่ระบบ", exact: true }).last()).toBeVisible();
  await expect(observer.getByRole("link", { name: "เข้าสู่ระบบ", exact: true }).last()).toBeVisible();
  await expect(observer.getByRole("heading", { name: "ผู้ใช้ใหม่", exact: true })).toHaveCount(0);
  expect((await context.cookies()).some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"))).toBe(false);
});

test("an expired session snapshot refreshes with the real refresh token before SSR", async ({ page, context }) => {
  const response = await page.request.post("/auth/login", {
    headers: { Origin: appOrigin }, data: { email: testAccounts[0].email, password: testAccounts[0].password },
  });
  expect(response.status()).toBe(200);
  const cookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
  const baseName = cookies[0].name.replace(/\.\d+$/, "");
  const encoded = cookies.sort((a, b) => a.name.localeCompare(b.name)).map((cookie) => cookie.value).join("");
  const session = JSON.parse(Buffer.from(encoded.slice("base64-".length), "base64url").toString());
  session.expires_at = Math.floor(Date.now() / 1000) - 120;
  const expired = "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url");
  const parts = expired.match(/.{1,3180}/g)!;
  await context.clearCookies({ name: /^sb-.*auth-token/ });
  await context.addCookies(parts.map((value, index) => ({ ...cookies[0], name: parts.length === 1 ? baseName : `${baseName}.${index}`, value })));
  const rendered = await page.goto("/profile");
  await expect(page.getByRole("button", { name: "ออกจากระบบ", exact: true })).toBeVisible();
  const cacheControl = rendered?.headers()["cache-control"] ?? "";
  // Next dev overrides page cache headers; production must preserve no-store.
  expect(cacheControl).toContain(process.env.PLAYWRIGHT_PRODUCTION ? "no-store" : "no-cache");
  expect(cacheControl).not.toMatch(/public|s-maxage/);
  const refreshed = (await context.cookies()).filter((cookie) => cookie.name.startsWith(baseName)).sort((a, b) => a.name.localeCompare(b.name)).map((cookie) => cookie.value).join("");
  const refreshedSession = JSON.parse(Buffer.from(refreshed.slice("base64-".length), "base64url").toString());
  expect(refreshedSession.expires_at > Date.now() / 1000).toBe(true);
  // Assert only booleans so a failure can never print tokens in reports.
  expect(typeof refreshedSession.refresh_token === "string").toBe(true);
});

test("switching accounts in the same browser isolates new data and preserves originals", async ({ page }) => {
  test.setTimeout(120_000);
  await login(page, testAccounts[0]);
  await page.evaluate(() => localStorage.setItem("doen-pa-travel-records-v2", "untouched-original"));
  await openPage(page, "/profile/edit");
  await page.getByLabel("ชื่อที่แสดง").fill("QA Account A Private");
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await openPage(page, "/records/new?placeId=place-khao-yai");
  await page.getByLabel("บันทึกความทรงจำ").fill("Account A private memory");
  await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
  await expect(page).toHaveURL(/\/passport$/);
  await expect(page.getByText("1 บันทึก", { exact: true })).toBeVisible();
  await openPage(page, "/profile");
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await expect(page.getByRole("link", { name: "เข้าสู่ระบบ", exact: true }).last()).toBeVisible();
  await login(page, testAccounts[1], "/passport");
  await expect(page.getByText("0 บันทึก", { exact: true })).toBeVisible();
  await expect(page.getByText("QA Account A Private", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Account A private memory")).toHaveCount(0);
  await openPage(page, "/profile");
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await expect(page.getByRole("link", { name: "เข้าสู่ระบบ", exact: true }).last()).toBeVisible();
  await login(page, testAccounts[0], "/passport");
  await expect(page.getByRole("heading", { name: "QA Account A Private", exact: true })).toBeVisible();
  await expect(page.getByText("1 บันทึก", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("doen-pa-travel-records-v2"))).toBe("untouched-original");
});

test("Auth endpoints reject cross-origin mutations and unsafe callback destinations", async ({ page }) => {
  const denied = await page.request.post("/auth/logout", { headers: { Origin: "https://other.example" }, data: {} });
  expect(denied.status()).toBe(403);
  expect(denied.headers()["cache-control"]).toBe("private, no-store");
  await openPage(page, "/auth/callback?next=https://other.example");
  await expect(page).toHaveURL(/\/login\?error=link$/);
  await expect(page.getByRole("status")).toContainText("ลิงก์ไม่ถูกต้องหรือหมดอายุ");
  await openPage(page, "/signup");
  await page.getByLabel("อีเมล", { exact: true }).fill("qa@example.com");
  await page.getByLabel("รหัสผ่านใหม่", { exact: true }).fill("ExamplePassword-123");
  await page.getByLabel("ยืนยันรหัสผ่านใหม่", { exact: true }).fill("DifferentPassword-123");
  await page.getByRole("button", { name: "สมัครสมาชิก", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
  const invalidLogin = await page.request.post("/auth/login", {
    headers: { Origin: appOrigin }, data: { email: testAccounts[0].email, password: "incorrect-password" },
  });
  expect(invalidLogin.status()).toBe(400);
  expect((await invalidLogin.json()).error).toBe("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  const noSession = await page.request.post("/auth/reset-password", {
    headers: { Origin: appOrigin }, data: { password: "ExamplePassword-123" },
  });
  expect(noSession.status()).toBe(401);
});

test("two real JWTs enforce ownership through the hosted Data API", async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const clients = testAccounts.map(() => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }));
  const recordId = `qa-rls-${crypto.randomUUID()}`;
  try {
    for (let i = 0; i < clients.length; i++) {
      const { error } = await clients[i].auth.signInWithPassword({ email: testAccounts[i].email, password: testAccounts[i].password });
      expect(error?.code).toBeUndefined();
      const profile = await clients[i].from("profiles").select("user_id");
      expect(profile.error?.code).toBeUndefined();
      expect(profile.data).toEqual([{ user_id: testAccounts[i].id }]);
    }
    const saved = await clients[0].from("travel_records").insert({ user_id: testAccounts[0].id, id: recordId, place_id: "place-khao-yai", visited_at: new Date().toISOString() });
    expect(saved.error?.code).toBeUndefined();
    expect((await clients[1].from("travel_records").select("id").eq("id", recordId)).data).toEqual([]);
    const forged = await clients[1].from("travel_records").insert({ user_id: testAccounts[0].id, place_id: "place-khao-yai", visited_at: new Date().toISOString() });
    expect(forged.error?.code).toBe("42501");
    const reassigned = await clients[0].from("travel_records").update({ user_id: testAccounts[1].id }).eq("id", recordId);
    expect(reassigned.error?.code).toBe("42501");
    const foreignPhoto = await clients[1].from("photos").insert({ user_id: testAccounts[1].id, kind: "travel", travel_record_id: recordId, object_path: `${testAccounts[1].id}/record-photos/${recordId}.jpg`, mime_type: "image/jpeg", size_bytes: 100 });
    expect(foreignPhoto.error?.code).toBe("23503");
  } finally {
    await clients[0].from("travel_records").delete().eq("id", recordId);
    for (const client of clients) await client.auth.signOut({ scope: "local" });
  }
});
