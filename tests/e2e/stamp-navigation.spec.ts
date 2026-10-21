import { test, expect, openPage } from "./fixtures";

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
