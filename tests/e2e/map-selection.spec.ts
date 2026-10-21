import { test, expect, openPage, seedRecords } from "./fixtures";

test("map selection keeps existing markers and keyboard focus", async ({ page, account }, testInfo) => {
  await page.route("https://tiles.stadiamaps.com/**", (route) => route.fulfill({
    contentType: "image/png",
    body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9WQAAAAASUVORK5CYII=", "base64"),
  }));
  await seedRecords(account, [
    { id: "north", placeId: "place-doi-inthanon" },
    { id: "northeast", placeId: "place-khao-yai" },
    { id: "south", placeId: "place-khao-sok" },
  ]);
  await openPage(page, "/map");
  const pins = page.locator(".visited-map-pin-wrapper");
  await expect(pins).toHaveCount(3);
  await page.waitForLoadState("networkidle");
  const originalMarkers = await pins.elementHandles();
  const first = page.locator('.visited-map-pin-wrapper[title="อุทยานแห่งชาติดอยอินทนนท์"]');
  const second = page.locator('.visited-map-pin-wrapper[title="อุทยานแห่งชาติเขาใหญ่"]');
  await first.click();
  await expect(page.getByRole("heading", { name: "อุทยานแห่งชาติดอยอินทนนท์", exact: true })).toBeVisible();
  for (const marker of originalMarkers) expect(await marker.evaluate((element) => element.isConnected)).toBe(true);
  await second.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "อุทยานแห่งชาติเขาใหญ่", exact: true })).toBeVisible();
  await expect(first.locator(".visited-map-pin--selected")).toHaveCount(0);
  await expect(second.locator(".visited-map-pin--selected")).toHaveCount(1);
  await expect(second).toBeFocused();
  await page.screenshot({ path: `/tmp/doen-pa-map-selection-${testInfo.project.name}.png`, animations: "disabled" });
  await page.getByRole("button", { name: "ปิดรายละเอียดสถานที่", exact: true }).click();
  await expect(page.locator(".visited-map-pin--selected")).toHaveCount(0);
  await first.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "อุทยานแห่งชาติดอยอินทนนท์", exact: true })).toBeVisible();
  await expect(first).toBeFocused();
  for (const marker of originalMarkers) expect(await marker.evaluate((element) => element.isConnected)).toBe(true);
  await expect(page.locator(".leaflet-control-attribution")).toContainText("Stadia Maps");
});
