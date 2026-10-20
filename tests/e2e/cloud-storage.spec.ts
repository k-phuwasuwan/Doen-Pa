import { createClient } from "@supabase/supabase-js";
import { test, expect, openPage, imageFixtures, appOrigin } from "./fixtures";
import { createTemporaryAccount, removeTemporaryAccount, getTestAdmin } from "../helpers/auth-admin";

test("cloud profile, records and private photos survive a fresh browser context", async ({ page, browser, account }, testInfo) => {
  test.setTimeout(90_000);
  await openPage(page, "/profile/edit");
  const { png } = await imageFixtures(page);
  await page.getByLabel("ชื่อที่แสดง").fill("Cloud Hiker");
  await page.locator("#profile-avatar").setInputFiles(png("avatar.png", 1));
  await page.locator("#profile-cover").setInputFiles(png("cover.png", 2));
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await openPage(page, "/records/new?placeId=place-doi-inthanon");
  await page.getByLabel("บันทึกความทรงจำ").fill("Saved across browsers");
  await page.getByLabel("เลือกไฟล์รูปภาพ", { exact: true }).setInputFiles(png("memory.png"));
  await page.getByRole("radio", { name: "4 ดาว", exact: true }).click();
  await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
  await expect(page).toHaveURL(/\/passport$/);
  const snapshot = await (await page.request.get("/api/account")).json();
  expect(snapshot.records).toHaveLength(1);
  expect(snapshot.records[0].rating).toBe(4);
  const photoUrls: string[] = [snapshot.user.avatar, snapshot.user.coverImage, ...snapshot.records[0].photos];

  const fresh = await browser.newContext({ baseURL: appOrigin, viewport: testInfo.project.use.viewport });
  try {
    expect((await fresh.request.get("/api/account")).status()).toBe(401);
    for (const url of photoUrls) expect((await fresh.request.get(url)).status()).toBe(404);
    const login = await fresh.request.post("/auth/login", { headers: { Origin: appOrigin }, data: { email: account.email, password: account.password } });
    expect(login.status()).toBe(200);
    const remote = await fresh.newPage();
    const errors: string[] = [];
    remote.on("pageerror", (error) => errors.push(error.message));
    remote.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await openPage(remote, "/profile");
    await expect(remote.getByRole("heading", { name: "Cloud Hiker", exact: true })).toBeVisible();
    await expect(remote.getByText("1 รูป", { exact: true })).toBeVisible();
    for (let index = 0; index < photoUrls.length; index++) {
      const image = await fresh.request.get(photoUrls[index]);
      expect(image.status()).toBe(200);
      expect(image.headers()["cache-control"]).toBe("private, no-store");
      expect((await image.body()).equals(png("verify", [1, 2, 0][index]).buffer)).toBe(true);
    }
    await openPage(remote, "/passport");
    await expect(remote.locator("blockquote")).toContainText("Saved across browsers");
    await expect(remote.locator("article img").first()).toBeVisible();
    await expect.poll(() => remote.locator("article img").first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await remote.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await remote.screenshot({ path: `/tmp/doen-pa-cloud-passport-${testInfo.project.name}.png` });
    expect(errors).toEqual([]);
    expect((await fresh.request.post("/auth/logout", { headers: { Origin: appOrigin }, data: {} })).status()).toBe(200);
    for (const url of photoUrls) expect((await fresh.request.get(url)).status()).toBe(404);
  } finally { await fresh.close(); }
});

test("another real account cannot read, overwrite or delete private Storage objects", async ({ page, account }) => {
  test.setTimeout(90_000);
  await openPage(page, "/records/new?placeId=place-doi-inthanon");
  const { png } = await imageFixtures(page);
  await page.getByLabel("เลือกไฟล์รูปภาพ", { exact: true }).setInputFiles(png("private.png"));
  await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
  await expect(page).toHaveURL(/\/passport$/);
  const data = await (await page.request.get("/api/account")).json();
  const photoUrl: string = data.records[0].photos[0];
  const metadata = await getTestAdmin().from("photos").select("object_path").eq("user_id", account.id).single();
  if (metadata.error || !metadata.data) throw new Error("Missing photo fixture");
  const path: string = metadata.data.object_path;
  const other = await createTemporaryAccount();
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    expect((await client.auth.signInWithPassword({ email: other.email, password: other.password })).error).toBeNull();
    const bucket = client.storage.from("travel-photos");
    expect((await bucket.download(path)).error !== null).toBe(true);
    expect((await bucket.list(`${account.id}/record-photos`)).data).toEqual([]);
    expect((await bucket.upload(path, png("forged").buffer, { contentType: "image/png", upsert: true })).error !== null).toBe(true);
    // Storage may return successful removal with no rows visible to this user.
    await bucket.remove([path]);
    const unchanged = await page.request.get(photoUrl);
    expect(unchanged.status()).toBe(200);
    expect((await unchanged.body()).equals(png("verify").buffer)).toBe(true);
    expect((await page.request.post("/auth/login", { headers: { Origin: appOrigin }, data: { email: other.email, password: other.password } })).status()).toBe(200);
    expect((await page.request.get(photoUrl)).status()).toBe(404);
    expect((await (await page.request.get("/api/account")).json()).records).toEqual([]);
  } finally {
    await client.auth.signOut({ scope: "local" });
    await removeTemporaryAccount(other.id);
  }
});

test("a delayed background read cannot replace a newly saved profile", async ({ page }) => {
  await openPage(page, "/profile/edit");
  const stale = await (await page.request.get("/api/account")).json();
  let releaseRead: () => void = () => {};
  let notifyRead: () => void = () => {};
  const held = new Promise<void>((resolve) => { releaseRead = resolve; });
  const started = new Promise<void>((resolve) => { notifyRead = resolve; });
  await page.route("**/api/account", async (route) => {
    notifyRead();
    await held;
    await route.fulfill({ json: stale });
  });
  try {
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await started;
    await page.getByLabel("ชื่อที่แสดง").fill("Newly Saved Name");
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Newly Saved Name", exact: true })).toBeVisible();
    const finished = page.waitForEvent("requestfinished", (request) => new URL(request.url()).pathname === "/api/account");
    releaseRead();
    await finished;
    // Let the fetched snapshot and React's render complete without a time delay.
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(page.getByRole("heading", { name: "Newly Saved Name", exact: true })).toBeVisible();
  } finally { releaseRead(); }
});

test("replacing an avatar removes old bytes while preserving the cover", async ({ page, context, account }) => {
  await openPage(page, "/profile/edit");
  const { png } = await imageFixtures(page);
  await page.locator("#profile-avatar").setInputFiles(png("old.png"));
  await page.locator("#profile-cover").setInputFiles(png("cover.png", 2));
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  const original = (await (await page.request.get("/api/account")).json()).user;
  const observer = await context.newPage();
  await openPage(observer, "/profile/edit");
  await expect(observer.getByAltText("ผู้ใช้ใหม่", { exact: true })).toHaveAttribute("src", original.avatar);
  await openPage(page, "/profile/edit");
  await page.locator("#profile-avatar").setInputFiles(png("replacement.png", 1));
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  const current = (await (await page.request.get("/api/account")).json()).user;
  expect(current.avatar === original.avatar).toBe(false);
  expect(current.coverImage === original.coverImage).toBe(true);
  await expect(observer.getByAltText("ผู้ใช้ใหม่", { exact: true })).toHaveAttribute("src", current.avatar);
  expect((await page.request.get(original.avatar)).status()).toBe(404);
  expect((await (await page.request.get(current.avatar)).body()).equals(png("verify", 1).buffer)).toBe(true);
  expect((await (await page.request.get(current.coverImage)).body()).equals(png("verify", 2).buffer)).toBe(true);
  const objects = await getTestAdmin().storage.from("profile-photos").list(`${account.id}/profile`);
  expect(objects.error).toBeNull();
  expect(objects.data).toHaveLength(2);
});

test.describe("recoverable upload and response failures", () => {
  test.use({ expectedConsoleErrors: ["/storage/v1/object/travel-photos/", "/rest/v1/rpc/save_travel_record", "/api/account"] });

  test("a partial upload cleans private orphan bytes and retains the draft for retry", async ({ page, account }) => {
    await openPage(page, "/records/new?placeId=place-doi-inthanon");
    const { png } = await imageFixtures(page);
    await page.getByLabel("บันทึกความทรงจำ").fill("Retry this memory");
    await page.getByLabel("เลือกไฟล์รูปภาพ", { exact: true }).setInputFiles([png("one.png"), png("two.png", 1)]);
    let uploads = 0;
    await page.route("**/storage/v1/object/travel-photos/**", async (route) => {
      if (route.request().method() === "POST" && ++uploads === 2) {
        await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Simulated upload failure" }) });
      } else await route.continue();
    });
    await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
    await expect(page.getByText("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่", { exact: true })).toBeVisible();
    await expect(page.getByLabel("บันทึกความทรงจำ")).toHaveValue("Retry this memory");
    expect((await (await page.request.get("/api/account")).json()).records).toEqual([]);
    const remaining = await getTestAdmin().storage.from("travel-photos").list(`${account.id}/record-photos`);
    expect(remaining.error).toBeNull();
    expect(remaining.data).toEqual([]);
    await page.unroute("**/storage/v1/object/travel-photos/**");
    await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
    await expect(page).toHaveURL(/\/passport$/);
    const saved = await (await page.request.get("/api/account")).json();
    expect(saved.records).toHaveLength(1);
    expect(saved.records[0].photos).toHaveLength(2);
  });

  test("retry after a lost commit response keeps one record and removes duplicate uploads", async ({ page, account }) => {
    await openPage(page, "/records/new?placeId=place-doi-inthanon");
    const { png } = await imageFixtures(page);
    await page.getByLabel("เลือกไฟล์รูปภาพ", { exact: true }).setInputFiles(png("memory.png"));
    await page.route("**/rest/v1/rpc/save_travel_record", async (route) => {
      const committed = await route.fetch();
      expect(committed.ok()).toBe(true);
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Simulated lost response" }) });
    });
    await page.route("**/api/account", (route) => route.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
    await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
    await expect(page.getByText("โหลดข้อมูลบัญชีไม่สำเร็จ กรุณาลองใหม่", { exact: true })).toBeVisible();
    await page.unroute("**/rest/v1/rpc/save_travel_record");
    await page.unroute("**/api/account");
    await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
    await expect(page).toHaveURL(/\/passport$/);
    const saved = await (await page.request.get("/api/account")).json();
    expect(saved.records).toHaveLength(1);
    expect(saved.records[0].photos).toHaveLength(1);
    expect((await page.request.get(saved.records[0].photos[0])).status()).toBe(200);
    const objects = await getTestAdmin().storage.from("travel-photos").list(`${account.id}/record-photos`);
    expect(objects.error).toBeNull();
    expect(objects.data).toHaveLength(1);
  });
});
