import { test, expect, openPage, imageFixtures } from "./fixtures";

test("new local user starts with empty memories", async ({ page }) => {
  await openPage(page, "/passport");
  await expect(page.getByText("พาสปอร์ตของคุณยังว่างเปล่า")).toBeVisible();
  await openPage(page, "/profile");
  await expect(page.getByText("ยังไม่มีรูปภาพในแกลเลอรี")).toBeVisible();
  await openPage(page, "/stats");
  await expect(page.getByRole("heading", { name: "0 การเดินทาง" })).toBeVisible();
});

test("revisit counts and Profile photo positions agree across personal pages", async ({ page }) => {
  await openPage(page, "/profile");
  const { urls } = await imageFixtures(page);
  await page.evaluate((photos) => {
    const record = { userId: "local-user", placeId: "place-doi-inthanon", visitedAt: "2026-01-01T12:00:00Z", note: "memory", rating: 0 };
    localStorage.setItem("doen-pa-travel-records-v2", JSON.stringify([
      { ...record, id: "old", createdAt: "2026-01-02T12:00:00Z", photos: [photos[0],photos[1],photos[2]] },
      { ...record, id: "new", createdAt: "2026-01-03T12:00:00Z", photos: [photos[2],photos[1],photos[0]] },
    ]));
  }, urls);
  await openPage(page, "/profile");
  await expect(page.getByText("6 รูป", { exact: true })).toBeVisible();
  const photo = page.locator('main a[href*="from=profile&photo="]').nth(4);
  const source = await photo.locator("img").getAttribute("src");
  await photo.click();
  await expect(page).toHaveURL(/from=profile&photo=4$/);
  await expect(page.getByText("5 / 6", { exact: true })).toBeVisible();
  const gallery = page.getByRole("button", { name: "ดูภาพจากการเดินทาง รูปที่ 5 แบบเต็มจอ" });
  await expect(gallery.locator("img")).toHaveAttribute("src", source!);
  await gallery.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await openPage(page, "/passport");
  await expect(page.getByText("2 บันทึก", { exact: true })).toBeVisible();
  await expect(page.locator('main a[href*="from=passport"]')).toHaveCount(2);
  await page.locator('main a[href*="from=passport"]').first().click();
  await expect(page).toHaveURL(/from=passport$/);
  await expect(page.locator('main a[href*="/records/new"]')).toHaveCount(0);
  await openPage(page, "/stats");
  await expect(page.getByRole("heading", { name: "2 การเดินทาง" })).toBeVisible();
  await openPage(page, "/search?visited=visited");
  await expect(page.getByText("เคยไปแล้ว 2 ครั้ง")).toBeVisible();
  await expect(page.locator('main a[href="/places/place-doi-inthanon"]')).toHaveCount(1);
});

test("corrupt data and cross-tab storage clear restore neutral empty states", async ({ page, context }) => {
  await openPage(page, "/passport");
  const writer = await context.newPage();
  await openPage(writer, "/profile");
  await writer.evaluate(() => {
    localStorage.setItem("doen-pa-current-user-v2", JSON.stringify({ id: "local-user", name: "Cross Tab", username: "cross_tab" }));
    localStorage.setItem("doen-pa-travel-records-v2", "{corrupt");
  });
  await expect(page.getByRole("heading", { name: "Cross Tab", exact: true })).toBeVisible();
  await expect(page.getByText("พาสปอร์ตของคุณยังว่างเปล่า")).toBeVisible();
  await writer.evaluate(() => localStorage.clear());
  await expect(page.getByRole("heading", { name: "ผู้ใช้ใหม่", exact: true })).toBeVisible();
  await expect(page.getByText("พาสปอร์ตของคุณยังว่างเปล่า")).toBeVisible();
});
