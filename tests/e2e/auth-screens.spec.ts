import { test, expect } from "@playwright/test";

test("guest personal pages show Login without the extra Search link", async ({ page }, testInfo) => {
  for (const route of ["/passport", "/stats", "/profile"]) {
    await page.goto(route);
    await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
    await expect(page.locator("main").getByRole("link", { name: "เข้าสู่ระบบ", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "ค้นหาสถานที่", exact: true })).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `/tmp/doen-pa-guest-${route.slice(1)}-${testInfo.project.name}.png` });
  }
});

test("signup and recovery omit email notices and the duplicate login link", async ({ page }, testInfo) => {
  // Exercise the UI response without sending real email or requiring SMTP.
  for (const mode of ["signup", "forgot-password"] as const) {
    await page.goto(`/${mode}`);
    await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
    await expect(page.getByRole("link", { name: "กลับไปเข้าสู่ระบบ", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "กลับ", exact: true })).toBeVisible();
    await page.route(`**/auth/${mode}`, (route) => route.fulfill({ json: { message: "ตรวจสอบอีเมลของคุณ ระบบส่งลิงก์แล้ว" } }));
    await page.getByLabel("อีเมล", { exact: true }).fill("ui-check@example.com");
    if (mode === "signup") {
      await page.getByLabel("รหัสผ่านใหม่", { exact: true }).fill("UiCheck-Password123");
      await page.getByLabel("ยืนยันรหัสผ่านใหม่", { exact: true }).fill("UiCheck-Password123");
    }
    const submit = page.locator('button[type="submit"]');
    await submit.click();
    await expect(submit).toBeEnabled();
    await expect(page.getByText("ตรวจสอบอีเมลของคุณ ระบบส่งลิงก์แล้ว", { exact: true })).toHaveCount(0);
    await expect(page.locator("form").getByRole("status")).toHaveCount(0);
    await page.screenshot({ path: `/tmp/doen-pa-auth-${mode}-${testInfo.project.name}.png` });
    if (mode === "signup") {
      await page.route("**/auth/resend", (route) => route.fulfill({ json: { message: "ส่งอีเมลยืนยันใหม่แล้ว" } }));
      await page.getByRole("button", { name: "ส่งอีเมลยืนยันอีกครั้ง", exact: true }).click();
      await expect(submit).toBeEnabled();
      await expect(page.getByText("ส่งอีเมลยืนยันใหม่แล้ว", { exact: true })).toHaveCount(0);
    }
    await page.unroute(`**/auth/${mode}`);
    await page.route(`**/auth/${mode}`, (route) => route.fulfill({ status: 503, json: { error: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" } }));
    await submit.click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
  }
});
