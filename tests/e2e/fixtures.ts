import { test as base, expect, type Page } from "@playwright/test";
import { createTemporaryAccount, removeTemporaryAccount, getTestAdmin } from "../helpers/auth-admin";
import { readFileSync } from "node:fs";

export interface TestAccount { id: string; email: string; password: string; username: string }
export const appOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000").origin;
// Credentials stay local and are never attached to traces or test reports.
export const testAccounts: TestAccount[] = JSON.parse(readFileSync(".local/auth-test-accounts.json", "utf8"));

export const test = base.extend<{ appHealth: void; signedIn: boolean; account: TestAccount; accountSession: void; expectedConsoleErrors: string[] }>({
  signedIn: [true, { option: true }],
  expectedConsoleErrors: [[], { option: true }],
  account: async ({ signedIn }, provide) => {
    if (!signedIn) { await provide(testAccounts[0]); return; }
    const account = await createTemporaryAccount();
    try { await provide(account); } finally { await removeTemporaryAccount(account.id); }
  },
  accountSession: [async ({ page, context, account, signedIn }, use) => {
    await context.addInitScript((id) => { window.doenPaTestAccountId = id; }, account.id);
    if (signedIn) {
      const response = await page.request.post("/auth/login", {
        headers: { Origin: appOrigin },
        data: { email: account.email, password: account.password },
      });
      expect(response.status(), "QA account login must succeed").toBe(200);
    }
    await use();
    // End only this context's Auth session; reusable QA identities are retained.
    const logout = await page.request.post("/auth/logout", { headers: { Origin: appOrigin }, data: {} });
    expect(logout.status(), "QA context session cleanup must succeed").toBe(200);
  }, { auto: true }],
  appHealth: [async ({ context, expectedConsoleErrors }, use) => {
    const errors: string[] = [];
    const watch = (page: Page) => {
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error" && !expectedConsoleErrors.some((url) => message.location().url.includes(url))) errors.push(`${message.text()} (${message.location().url})`); });
    };
    context.pages().forEach(watch);
    context.on("page", watch);
    await use();
    expect(errors, "Unexpected browser errors").toEqual([]);
  }, { auto: true }],
});
export { expect };

declare global {
  interface Window { releaseImageReads: () => void; doenPaTestAccountId: string }
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

export async function seedRecords(account: TestAccount, records: Array<{id: string; placeId: string; photos?: string[]; note?: string; createdAt?: string}>) {
  const admin = getTestAdmin();
  for (const record of records) {
    const result = await admin.from("travel_records").insert({ user_id: account.id, id: record.id, place_id: record.placeId, visited_at: "2026-01-01T12:00:00Z", created_at: record.createdAt ?? "2026-01-02T12:00:00Z", note: record.note ?? "original memory", rating: 0 });
    if (result.error) throw new Error("Could not seed cloud record");
    for (let position = 0; position < (record.photos?.length ?? 0); position++) {
      const id = crypto.randomUUID(), path = `${account.id}/record-photos/${id}.png`;
      const bytes = Buffer.from(record.photos![position].split(",")[1], "base64");
      const upload = await admin.storage.from("travel-photos").upload(path, bytes, { contentType: "image/png" });
      if (upload.error) throw new Error("Could not seed cloud photo");
      const photo = await admin.from("photos").insert({ user_id: account.id, id, kind: "travel", travel_record_id: record.id, position, object_path: path, mime_type: "image/png", size_bytes: bytes.length });
      if (photo.error) throw new Error("Could not seed cloud photo metadata");
    }
  }
}
