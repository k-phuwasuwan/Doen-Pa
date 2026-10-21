import type { Request } from "@playwright/test";
import { test, expect, openPage } from "./fixtures";
import { getTestAdmin } from "../helpers/auth-admin";

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

test("focus and visibility share one account read and a failed refresh can retry", async ({ page, expectedConsoleErrors }) => {
  await openPage(page, "/profile");
  const snapshot = await (await page.request.get("/api/account")).json();
  const release = deferred();
  let responses = 0;
  expectedConsoleErrors.push("/api/account");
  await page.route("**/api/account", async (route) => {
    const index = responses++;
    if (index === 0) {
      await release.promise;
      await route.fulfill({ json: { ...snapshot, user: { ...snapshot.user, name: "Coalesced refresh" } } });
    } else if (index === 1) {
      await route.fulfill({ status: 503, json: { error: "Temporary read failure" } });
    } else {
      await route.fulfill({ json: snapshot });
    }
  });
  const counter = await page.evaluateHandle(() => {
    const counter = { requests: 0 };
    const originalFetch = window.fetch.bind(window);
    window.fetch = (...args: Parameters<typeof window.fetch>) => {
      const input = args[0];
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (new URL(url, location.href).pathname === "/api/account") counter.requests++;
      return originalFetch(...args);
    };
    return counter;
  });
  try {
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(await counter.evaluate((counter) => counter.requests)).toBe(1);
    release.resolve();
    await expect(page.getByRole("heading", { name: "Coalesced refresh", exact: true })).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByRole("alert").filter({ hasText: "อัปเดตข้อมูลไม่สำเร็จ" })).toContainText("อัปเดตข้อมูลไม่สำเร็จ");
    await expect(page.getByRole("heading", { name: "Coalesced refresh", exact: true })).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByRole("heading", { name: snapshot.user.name, exact: true })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "อัปเดตข้อมูลไม่สำเร็จ" })).toHaveCount(0);
    expect(await counter.evaluate((counter) => counter.requests)).toBe(3);
  } finally { release.resolve(); }
});

for (const olderResponse of ["data", "failure"] as const) {
  test(`an account change starts a fresh read past older ${olderResponse}`, async ({ page, account, expectedConsoleErrors }) => {
    await openPage(page, "/profile");
    const stale = await (await page.request.get("/api/account")).json();
    if (olderResponse === "failure") expectedConsoleErrors.push("/api/account");
    const started = deferred();
    const release = deferred();
    let heldRequest: Request | undefined;
    await page.route("**/api/account", async (route) => {
      if (!heldRequest) {
        heldRequest = route.request();
        started.resolve();
        await release.promise;
        if (olderResponse === "failure") await route.fulfill({ status: 503, json: { error: "Outdated read failed" } });
        else await route.fulfill({ json: stale });
      } else await route.continue();
    });
    try {
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await started.promise;
      const updated = await getTestAdmin().from("profiles").update({ name: "Changed in another tab" }).eq("user_id", account.id);
      expect(updated.error).toBeNull();
      await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "doen-pa-cloud-account-changed-v1" })));
      await expect(page.getByRole("heading", { name: "Changed in another tab", exact: true })).toBeVisible();
      const finished = page.waitForEvent("requestfinished", (request) => request === heldRequest);
      release.resolve();
      await finished;
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      await expect(page.getByRole("heading", { name: "Changed in another tab", exact: true })).toBeVisible();
      await expect(page.getByRole("alert").filter({ hasText: "อัปเดตข้อมูลไม่สำเร็จ" })).toHaveCount(0);
    } finally { release.resolve(); }
  });
}

test("saving a record reads past a pending background snapshot", async ({ page }) => {
  await openPage(page, "/records/new?placeId=place-doi-inthanon");
  const stale = await (await page.request.get("/api/account")).json();
  const started = deferred();
  const release = deferred();
  let heldRequest: Request | undefined;
  await page.route("**/api/account", async (route) => {
    if (!heldRequest) {
      heldRequest = route.request();
      started.resolve();
      await release.promise;
      await route.fulfill({ json: stale });
    } else await route.continue();
  });
  try {
    await page.getByLabel("บันทึกความทรงจำ", { exact: true }).fill("Saved after the background read started");
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await started.promise;
    await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
    await expect(page).toHaveURL(/\/passport$/);
    await expect(page.locator("blockquote")).toContainText("Saved after the background read started");
    const finished = page.waitForEvent("requestfinished", (request) => request === heldRequest);
    release.resolve();
    await finished;
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(page.locator("blockquote")).toContainText("Saved after the background read started");
  } finally { release.resolve(); }
});
