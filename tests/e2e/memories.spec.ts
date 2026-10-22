import { test, expect, openPage, imageFixtures, seedRecords } from "./fixtures";

test("signed-in account starts with empty cloud memories", async ({ page }) => {
  await openPage(page, "/passport");
  await expect(page.getByText("พาสปอร์ตของคุณยังว่างเปล่า")).toBeVisible();
  await openPage(page, "/profile");
  await expect(page.getByText("ยังไม่มีรูปภาพในแกลเลอรี")).toBeVisible();
  await openPage(page, "/stats");
  await expect(page.getByRole("heading", { name: "0 การเดินทาง" })).toBeVisible();
});

test("revisit counts and Profile photo positions agree across personal pages", async ({ page, account }) => {
  await openPage(page, "/profile");
  const { urls } = await imageFixtures(page);
  await seedRecords(account, [
    { id: "old", placeId: "place-doi-inthanon", note: "memory", createdAt: "2026-01-02T12:00:00Z", photos: urls },
    { id: "new", placeId: "place-doi-inthanon", note: "memory", createdAt: "2026-01-03T12:00:00Z", photos: [...urls].reverse() },
  ]);
  await openPage(page, "/profile");
  await expect(page.getByText("6 รูป", { exact: true })).toBeVisible();
  const photo = page.locator('main a[href*="from=profile&photo="]').nth(4);
  const source = await photo.locator("img").getAttribute("src");
  await photo.click();
  await expect(page).toHaveURL(/from=profile&photo=4$/);
  await expect(page.getByText("5 / 6", { exact: true })).toBeVisible();
  const gallery = page.getByRole("button", { name: "ดูภาพจากการเดินทาง รูปที่ 5 แบบเต็มจอ" });
  // Profile tiles and the gallery request different widths of the same photo.
  await expect(gallery.locator("img")).toHaveAttribute("src", source!.replace(/&w=\d+$/, "&w=1280"));
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

test("legacy corrupt local data and storage clear do not alter cloud memories", async ({ page, context }) => {
  await openPage(page, "/profile/edit");
  await page.getByLabel("ชื่อที่แสดง").fill("Cloud Name");
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  const writer = await context.newPage();
  await openPage(writer, "/profile");
  await writer.evaluate(() => {
    localStorage.setItem(`doen-pa-current-user-account-v1:${window.doenPaTestAccountId}`, "{corrupt");
    localStorage.setItem(`doen-pa-travel-records-account-v1:${window.doenPaTestAccountId}`, "{corrupt");
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Cloud Name", exact: true })).toBeVisible();
  await writer.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { name: "Cloud Name", exact: true })).toBeVisible();
});
