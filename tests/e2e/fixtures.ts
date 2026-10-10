import { test as base, expect, type Page } from "@playwright/test";

export const test = base.extend<{ appHealth: void }>({
  appHealth: [async ({ context }, use) => {
    const errors: string[] = [];
    const watch = (page: Page) => {
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(`${message.text()} (${message.location().url})`); });
    };
    context.pages().forEach(watch);
    context.on("page", watch);
    await use();
    expect(errors, "Unexpected browser errors").toEqual([]);
  }, { auto: true }],
});
export { expect };

declare global {
  interface Window { releaseImageReads: () => void }
}

export async function openPage(page: Page, route: string) {
  await page.goto(route);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("[data-route-loading-overlay]")).toBeHidden();
  await expect(page).toHaveTitle(/Doen Pa/);
}

export async function imageFixtures(page: Page) {
  const urls = await page.evaluate(() => ["#be123c", "#1d4ed8", "#14532d"].map((color) => {
    const canvas = document.createElement("canvas");
    canvas.width = 100; canvas.height = 100;
    const drawing = canvas.getContext("2d");
    if (!drawing) throw new Error("Canvas unavailable");
    drawing.fillStyle = color; drawing.fillRect(0, 0, 100, 100);
    return canvas.toDataURL("image/png");
  }));
  return { urls, png: (name: string, index = 0) => ({ name, mimeType: "image/png", buffer: Buffer.from(urls[index].split(",")[1], "base64") }) };
}

export async function controlledImageReads(page: Page) {
  await page.addInitScript(() => {
    const original = FileReader.prototype.readAsDataURL;
    const queued: Array<() => void> = [];
    FileReader.prototype.readAsDataURL = function(file) {
      if (file instanceof File && file.name.startsWith("held-")) queued.push(() => original.call(this, file));
      else original.call(this, file);
    };
    window.releaseImageReads = () => queued.splice(0).forEach((read) => read());
  });
}
