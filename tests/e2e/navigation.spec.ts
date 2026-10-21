import { test, expect, openPage } from "./fixtures";

test.use({ signedIn: false });

test("nested place pages keep the originating tab active in both navigation bars", async ({ page }, testInfo) => {
  for (const origin of ["search", "passport", "profile"]) {
    await openPage(page, `/places/place-doi-inthanon?from=${origin}`);
    const active = page.locator('nav a[aria-current="page"]');
    await expect(active).toHaveCount(2);
    for (const link of await active.all()) await expect(link).toHaveAttribute("href", new RegExp(`^/${origin}(?:\\?view=guest)?$`));
    const back = page.getByRole("link", { name: "ย้อนกลับ", exact: true });
    await expect(back).toHaveAttribute("href", `/${origin}`);
  }
  await page.screenshot({ path: `/tmp/doen-pa-navigation-${testInfo.project.name}.png` });
});

test("client navigation preserves an explicit guest preview and updates the active tab", async ({ page }) => {
  await openPage(page, "/passport?view=guest");
  await page.locator('nav a[href="/stats?view=guest"]:visible').click();
  await expect(page).toHaveURL(/\/stats\?view=guest$/);
  const active = page.locator('nav a[aria-current="page"]');
  await expect(active).toHaveCount(2);
  for (const link of await active.all()) await expect(link).toHaveAttribute("href", "/stats?view=guest");
  await page.goBack();
  await expect(page).toHaveURL(/\/passport\?view=guest$/);
  await expect(page.locator('nav a[aria-current="page"]:visible')).toHaveAttribute("href", "/passport?view=guest");
});
