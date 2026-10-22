import { test, expect, openPage, appOrigin } from "./fixtures";
import { getTestAdmin } from "../helpers/auth-admin";

test.use({ signedIn: false });

test("real confirmation and recovery tokens establish SSR sessions and cannot be reused", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const admin = getTestAdmin();
  const email = `doen-pa-ephemeral-${crypto.randomUUID()}@example.com`;
  const password = `Original-${crypto.randomUUID()}`;
  const newPassword = `Updated-${crypto.randomUUID()}`;
  let userId: string | undefined;
  try {
    // Generate genuine Auth tokens without sending email or requiring SMTP.
    const signup = await admin.auth.admin.generateLink({ type: "signup", email, password });
    if (signup.error) throw new Error(`Could not create confirmation fixture: ${signup.error.code}`);
    userId = signup.data.user.id;
    const unconfirmed = await page.request.post("/auth/login", { headers: { Origin: appOrigin }, data: { email, password } });
    expect(unconfirmed.status()).toBe(400);
    expect((await unconfirmed.json()).error).toBe("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");

    await openPage(page, `/auth/confirm?token_hash=${signup.data.properties.hashed_token}&type=signup&next=/profile`);
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("button", { name: "ออกจากระบบ", exact: true })).toBeVisible();
    const { data: profile } = await admin.from("profiles").select("user_id").eq("user_id", userId).single();
    expect(profile?.user_id === userId).toBe(true);
    await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
    await expect(page.getByRole("link", { name: "เข้าสู่ระบบ", exact: true }).last()).toBeVisible();
    await openPage(page, `/auth/confirm?token_hash=${signup.data.properties.hashed_token}&type=signup`);
    await expect(page).toHaveURL(/\/login\?error=link$/);

    const recovery = await admin.auth.admin.generateLink({ type: "recovery", email });
    if (recovery.error) throw new Error(`Could not create recovery fixture: ${recovery.error.code}`);
    await openPage(page, `/auth/confirm?token_hash=${recovery.data.properties.hashed_token}&type=recovery&next=https://other.example`);
    await expect(page).toHaveURL(/\/reset-password$/);
    await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
    await expect(page.getByRole("link", { name: "กลับไปเข้าสู่ระบบ", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "กลับ", exact: true })).toBeVisible();
    await page.screenshot({ path: `/tmp/doen-pa-auth-reset-password-${testInfo.project.name}.png` });
    await page.getByLabel("รหัสผ่านใหม่", { exact: true }).fill(newPassword);
    await page.getByLabel("ยืนยันรหัสผ่านใหม่", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "บันทึกรหัสผ่านใหม่", exact: true }).click();
    await expect(page).toHaveURL(/\/login\?updated=1$/);
    const oldPassword = await page.request.post("/auth/login", { headers: { Origin: appOrigin }, data: { email, password } });
    expect(oldPassword.status()).toBe(400);
    await page.getByLabel("อีเมล", { exact: true }).fill(email);
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
    await expect(page).toHaveURL(/\/search$/);
  } finally {
    if (userId) {
      // This ID was created by this test only; reusable QA accounts are retained.
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw new Error("Could not remove temporary Auth test fixture");
    }
  }
});
