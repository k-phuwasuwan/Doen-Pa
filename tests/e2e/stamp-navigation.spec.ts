import { test, expect, openPage, appOrigin } from "./fixtures";

test.describe("Guest stamping", () => {
  test.use({ signedIn: false });

  for (const origin of ["/search", "/places/place-doi-inthanon"]) {
    test(`Login Back returns to ${origin}`, async ({ page }, testInfo) => {
      await openPage(page, origin);
      await page.getByRole("link", { name: "สแตมป์", exact: true }).first().click();
      await expect(page).toHaveURL(/\/login\?/);
      await expect(page).toHaveTitle("เข้าสู่ระบบ | Doen Pa");
      await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
      await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ Doen Pa", exact: true })).toBeVisible();
      const back = page.getByRole("link", { name: "กลับ", exact: true });
      await expect(back).toHaveAttribute("href", origin);
      await page.screenshot({ path: `/tmp/doen-pa-stamp-login-${origin === "/search" ? "search" : "place"}-${testInfo.project.name}.png` });
      await back.click();
      await expect(page).toHaveURL(origin);
      await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
    });
  }
});

test("Login resumes stamping and a saved record opens Passport", async ({ page, account }) => {
  const logout = await page.request.post("/auth/logout", { headers: { Origin: appOrigin }, data: {} });
  expect(logout.status()).toBe(200);
  await openPage(page, "/places/place-doi-inthanon");
  await page.getByRole("link", { name: "สแตมป์", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?/);
  await page.getByLabel("อีเมล", { exact: true }).fill(account.email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page).toHaveURL("/records/new?placeId=place-doi-inthanon");
  await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
  await page.getByLabel("บันทึกความทรงจำ", { exact: true }).fill("Stamp after logging in");
  await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
  await expect(page).toHaveURL("/passport");
  await expect(page.getByText("1 บันทึก", { exact: true })).toBeVisible();
});

test("Stamp links support keyboard navigation and preserve each Back destination", async ({ page }, testInfo) => {
  await openPage(page, "/search?q=ดอยอินทนนท์");
  const stamp = page.getByRole("link", { name: "สแตมป์", exact: true });
  await expect(stamp).toHaveAttribute("href", "/records/new?placeId=place-doi-inthanon&returnTo=search");
  expect(await stamp.evaluate((link) => link.parentElement?.closest("a") !== null)).toBe(false);
  await stamp.focus();
  await expect(stamp).toBeFocused();
  await page.screenshot({ path: `/tmp/doen-pa-search-stamp-${testInfo.project.name}.png` });
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/records\/new\?placeId=place-doi-inthanon&returnTo=search$/);
  const back = page.getByRole("link", { name: "ย้อนกลับ", exact: true });
  await expect(back).toHaveAttribute("href", "/search");
  await back.click();
  await expect(page).toHaveURL(/\/search$/);
  await openPage(page, "/places/place-doi-inthanon");
  await stamp.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/records\/new\?placeId=place-doi-inthanon$/);
  await expect(back).toHaveAttribute("href", "/places/place-doi-inthanon");
});
