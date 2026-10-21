import { test, expect, openPage, appOrigin, imageFixtures } from "./fixtures";
import { createTemporaryAccount, removeTemporaryAccount, getTestAdmin } from "../helpers/auth-admin";

test.use({ signedIn: false });

test("first login opens setup without Back or Cancel, saves to Search and skips setup next time", async ({ page, expectedConsoleErrors }) => {
  test.setTimeout(120_000);
  const account = await createTemporaryAccount();
  const admin = getTestAdmin();
  try {
    const updated = await admin.auth.admin.updateUserById(account.id, { user_metadata: { profile_setup_pending: true } });
    expect(updated.error?.code).toBeUndefined();
    const profile = await admin.from("profiles").update({ name: "นักเดินทาง", username: "new_hiker" }).eq("user_id", account.id);
    expect(profile.error?.code).toBeUndefined();
    const next = "/records/new?placeId=place-khao-yai&returnTo=search";
    await openPage(page, `/login?next=${encodeURIComponent(next)}`);
    await page.getByLabel("อีเมล", { exact: true }).fill(account.email);
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
    await expect(page.getByRole("heading", { name: "ตั้งค่าโปรไฟล์ของคุณ", exact: true })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("link", { name: "ย้อนกลับ", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "ยกเลิก", exact: true })).toHaveCount(0);
    await expect(page.getByLabel("ชื่อที่แสดง", { exact: true })).toHaveValue("");
    await expect(page.getByLabel("ชื่อผู้ใช้", { exact: true })).toHaveValue("");
    await page.getByLabel("ชื่อที่แสดง", { exact: true }).fill("นักเดินป่าครั้งแรก");
    await page.getByLabel("ชื่อผู้ใช้", { exact: true }).fill("first_hiker");
    await expect(page.getByRole("heading", { name: "นักเดินป่าครั้งแรก", exact: true })).toBeVisible();
    expectedConsoleErrors.push("/auth/complete-profile-setup");
    await page.route("**/auth/complete-profile-setup", (route) => route.fulfill({ status: 503, json: { error: "ตั้งค่าโปรไฟล์ไม่สำเร็จ กรุณาลองบันทึกอีกครั้ง" } }));
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("ตั้งค่าโปรไฟล์ไม่สำเร็จ กรุณาลองบันทึกอีกครั้ง");
    await expect(page.getByLabel("ชื่อที่แสดง", { exact: true })).toHaveValue("นักเดินป่าครั้งแรก");
    await expect(page.getByLabel("ชื่อผู้ใช้", { exact: true })).toHaveValue("first_hiker");
    const pending = await admin.auth.admin.getUserById(account.id);
    expect(pending.data.user?.user_metadata.profile_setup_pending).toBe(true);
    await page.unroute("**/auth/complete-profile-setup");
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
    await expect(page).toHaveURL(new URL("/search", appOrigin).toString());
    const saved = await admin.auth.admin.getUserById(account.id);
    expect(saved.data.user?.user_metadata.profile_setup_pending).toBe(false);
    const logout = await page.request.post("/auth/logout", { headers: { Origin: appOrigin }, data: {} });
    expect(logout.status()).toBe(200);
    await openPage(page, "/login?from=profile");
    await page.getByLabel("อีเมล", { exact: true }).fill(account.email);
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole("heading", { name: "ตั้งค่าโปรไฟล์ของคุณ", exact: true })).toHaveCount(0);
    await openPage(page, "/profile/edit");
    await expect(page.getByRole("heading", { name: "แก้ไขโปรไฟล์", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "ย้อนกลับ", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "ยกเลิก", exact: true })).toBeVisible();
  } finally { await removeTemporaryAccount(account.id); }
});

test("email confirmation opens setup and saves the user's own profile image", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const admin = getTestAdmin();
  let userId: string | undefined;
  try {
    const link = await admin.auth.admin.generateLink({
      type: "signup", email: `doen-pa-setup-${crypto.randomUUID()}@example.com`, password: `Setup-${crypto.randomUUID()}`,
      options: { data: { profile_setup_pending: true } },
    });
    if (link.error) throw new Error("Could not create profile setup confirmation fixture");
    userId = link.data.user.id;
    await openPage(page, `/auth/confirm?type=signup&token_hash=${link.data.properties.hashed_token}&next=/profile`);
    await expect(page.getByRole("heading", { name: "ตั้งค่าโปรไฟล์ของคุณ", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "ย้อนกลับ", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "ยกเลิก", exact: true })).toHaveCount(0);
    await page.getByLabel("ชื่อที่แสดง", { exact: true }).fill("เจ้าของโปรไฟล์");
    await page.getByLabel("ชื่อผู้ใช้", { exact: true }).fill("my_hiking_profile");
    const images = await imageFixtures(page);
    await page.locator("#profile-avatar").setInputFiles(images.png("own-avatar.png"));
    await expect(page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true })).toBeEnabled();
    await page.screenshot({ path: `/tmp/doen-pa-profile-setup-${testInfo.project.name}.png` });
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
    await expect(page).toHaveURL(/\/search$/);
    const result = await (await page.request.get("/api/account")).json();
    expect(result.user.avatar.startsWith("/api/photos/")).toBe(true);
    expect(result.user.needsProfileSetup).toBe(false);
    expect(result.user.name).toBe("เจ้าของโปรไฟล์");
  } finally { if (userId) await removeTemporaryAccount(userId); }
});
