import { test, expect, openPage } from "./fixtures";

test("real catalog supports search, classification and missing-value display", async ({ page }) => {
  await openPage(page, "/search");
  await expect(page.locator('main a[href^="/places/"]')).toHaveCount(156);
  const query = page.getByPlaceholder("ค้นหาชื่อสถานที่ จังหวัด...");
  await query.fill("เจ็ดคด");
  await expect(page.locator('main a[href^="/places/"]')).toHaveCount(1);
  const card = page.locator('main a[href^="/places/"]');
  await expect(card).toContainText("อุทยานแห่งชาติน้ำตกเจ็ดคด-โป่งก้อนเส้า");
  await expect(card).toContainText("น้ำตก");
  await card.click();
  await expect(page.getByRole("heading", { name: "อุทยานแห่งชาติน้ำตกเจ็ดคด-โป่งก้อนเส้า", exact: true })).toBeVisible();
  await expect(page.getByLabel("ความสูง: -", { exact: true })).toBeVisible();
  await expect(page.getByLabel("ระยะทาง: -", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "เกี่ยวกับสถานที่" }).locator("..").locator("p")).toHaveText("-");
  await openPage(page, "/search?type=island");
  await expect(page.locator('main a[href^="/places/"]')).toHaveCount(23);
  await openPage(page, "/places/place-khao-yai");
  await expect(page.getByLabel("ระยะทาง: 8 กม.", { exact: true })).toBeVisible();
  await expect(page.getByText("15.0 km", { exact: true })).toHaveCount(0);
});

test("old duplicate IDs share one park while memories outside the new catalog survive", async ({ page }) => {
  await openPage(page, "/passport");
  await page.evaluate(() => {
    const base = { userId: "local-user", visitedAt: "2026-01-01T12:00:00Z", createdAt: "2026-01-02T12:00:00Z", note: "original memory", photos: [], rating: 0 };
    localStorage.setItem("doen-pa-travel-records-v2", JSON.stringify([
      { ...base, id: "old-card", placeId: "place-khao-sam-rok" },
      { ...base, id: "second-card", placeId: "place-khao-sam-roi-yod" },
      { ...base, id: "archived", placeId: "place-doi-chiang-dao" },
    ]));
  });
  await page.reload();
  await expect(page.locator('main a[href*="from=passport"]')).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "ดอยหลวงเชียงดาว", exact: true })).toBeVisible();
  await page.getByRole("heading", { name: "ดอยหลวงเชียงดาว", exact: true }).click();
  await expect(page).toHaveURL(/\/places\/place-doi-chiang-dao\?from=passport$/);
  await expect(page.getByText("original memory")).toBeVisible();
  await expect(page.locator('main a[href*="/records/new"]')).toHaveCount(0);
  await openPage(page, "/stats");
  await expect(page.getByRole("heading", { name: "3 การเดินทาง" })).toBeVisible();
  const parkStats = page.getByRole("heading", { name: "อุทยานแห่งชาติ" }).locator("..");
  await expect(parkStats).toContainText("156");
  await openPage(page, "/search?visited=visited");
  await expect(page.locator('main a[href^="/places/"]')).toHaveCount(1);
  await expect(page.getByText("เคยไปแล้ว 2 ครั้ง")).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("doen-pa-travel-records-v2") ?? "[]"));
  expect(saved.map((r: {placeId: string}) => r.placeId)).toEqual(["place-khao-sam-rok", "place-khao-sam-roi-yod", "place-doi-chiang-dao"]);
});
