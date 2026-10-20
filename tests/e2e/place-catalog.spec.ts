import { test, expect, openPage, seedRecords } from "./fixtures";

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

test("old duplicate IDs share one park while memories outside the new catalog survive", async ({ page, account }) => {
  await openPage(page, "/passport");
  await seedRecords(account, [
    { id: "old-card", placeId: "place-khao-sam-rok" },
    { id: "second-card", placeId: "place-khao-sam-roi-yod" },
    { id: "archived", placeId: "place-doi-chiang-dao" },
  ]);
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
  const saved = await (await page.request.get("/api/account")).json();
  expect(saved.records.map((r: {placeId: string}) => r.placeId).sort()).toEqual(["place-doi-chiang-dao", "place-khao-sam-roi-yod", "place-khao-sam-rok"]);

});

test("missing places keep 404 behavior and invalid stamping returns to Search", async ({ page }) => {
  await openPage(page, "/records/new?placeId=unknown-place");
  await expect(page).toHaveURL(/\/search$/);
  await openPage(page, "/records/new?placeId=place-doi-chiang-dao");
  await expect(page).toHaveURL(/\/search$/);
  await page.goto("/places/unknown-place");
  await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
});

test("map resolves saved IDs from the server catalog and deduplicates revisits", async ({ page, account }) => {
  // Tile availability is independent of catalog reads; keep this test deterministic.
  await page.route("https://tiles.stadiamaps.com/**", (route) => route.fulfill({
    contentType: "image/png",
    body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9WQAAAAASUVORK5CYII=", "base64"),
  }));
  await openPage(page, "/passport");
  await seedRecords(account, [{ id: "visit-one", placeId: "place-doi-inthanon" }, { id: "visit-two", placeId: "place-doi-inthanon" }]);
  await openPage(page, "/map");
  await expect(page.locator(".visited-map-pin-wrapper")).toHaveCount(1);
  await page.locator(".visited-map-pin-wrapper").click();
  await expect(page.getByRole("heading", { name: "อุทยานแห่งชาติดอยอินทนนท์", exact: true })).toBeVisible();
  await expect(page.locator(".leaflet-control-attribution")).toContainText("OpenStreetMap");
});
