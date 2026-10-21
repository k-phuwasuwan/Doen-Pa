import { test, expect } from "@playwright/test";

test("search filters update without waiting for another server render", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/search");
  await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
  await expect(page.locator('main a[href^="/places/"]')).toHaveCount(156);
  // Hold all subsequent Search requests: filtering already-loaded data must
  // still work, even when the server cannot respond.
  let release = () => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  let requests = 0;
  await page.route("**/search?**", async (route) => {
    requests += 1;
    await held;
    await route.continue();
  });
  const cards = page.locator('main a[href^="/places/"]');
  const category = (type: string) => page.locator(`main a[href="/search?type=${type}"]`);
  try {
    await category("island").click();
    await expect(category("island")).toHaveAttribute("aria-current", "true", { timeout: 500 });
    await expect(cards).toHaveCount(23, { timeout: 500 });
    await expect(page).toHaveURL(/type=island$/);
    await page.getByRole("button", { name: "เคยไปแล้ว", exact: true }).click();
    await expect(cards).toHaveCount(0, { timeout: 500 });
    await expect(page.getByRole("heading", { name: "ไม่พบสถานที่" })).toBeVisible();
    await page.getByRole("button", { name: "เคยไปแล้ว", exact: true }).click();
    await expect(cards).toHaveCount(23, { timeout: 500 });
    await category("mountain").click();
    await category("waterfall").click();
    await expect(category("waterfall")).toHaveAttribute("aria-current", "true");
    await page.goBack();
    await expect(category("mountain")).toHaveAttribute("aria-current", "true");
    await page.goForward();
    await expect(category("waterfall")).toHaveAttribute("aria-current", "true");
    const search = page.getByPlaceholder("ค้นหาชื่อสถานที่ จังหวัด...");
    await search.fill("เจ็ดคด");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("น้ำตกเจ็ดคด");
    await page.goBack();
    await expect(search).toHaveValue("");
    await page.goForward();
    await expect(search).toHaveValue("เจ็ดคด");
    expect(requests).toBe(0);
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
  await page.reload();
  await expect(cards).toHaveCount(1);
  await expect(page.getByPlaceholder("ค้นหาชื่อสถานที่ จังหวัด...")).toHaveValue("เจ็ดคด");
  // A filtered initial URL must still carry the full catalog for later filters.
  await page.getByPlaceholder("ค้นหาชื่อสถานที่ จังหวัด...").fill("");
  await category("island").click();
  await expect(cards).toHaveCount(23);
  await expect(page).toHaveTitle("ค้นหา | Doen Pa");
  expect(errors).toEqual([]);
});
