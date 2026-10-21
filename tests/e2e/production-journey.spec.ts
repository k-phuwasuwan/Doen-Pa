import { test, expect, openPage, imageFixtures, appOrigin } from "./fixtures";
import { createTemporaryAccount, removeTemporaryAccount, getTestAdmin } from "../helpers/auth-admin";

test.use({ signedIn: false });
test.skip(process.env.PLAYWRIGHT_PRODUCTION !== "1", "Run explicitly against the deployed HTTPS app with real terrain tiles.");

test("production journey saves a new hiker's memories and restores them after logout", async ({ page, browser }, testInfo) => {
  test.setTimeout(180_000);
  const account = await createTemporaryAccount();
  const admin = getTestAdmin();
  const note = "Production acceptance memory — temporary QA data";
  const placeName = "อุทยานแห่งชาติดอยอินทนนท์";
  try {
    await test.step("New account logs in and completes profile setup", async () => {
      const pending = await admin.auth.admin.updateUserById(account.id, { user_metadata: { profile_setup_pending: true } });
      expect(pending.error?.code).toBeUndefined();
      await openPage(page, "/login");
      await page.getByLabel("อีเมล", { exact: true }).fill(account.email);
      await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
      await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
      await expect(page.getByRole("heading", { name: "ตั้งค่าโปรไฟล์ของคุณ", exact: true })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("link", { name: "ย้อนกลับ", exact: true })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "ยกเลิก", exact: true })).toHaveCount(0);
      await page.getByLabel("ชื่อที่แสดง", { exact: true }).fill("Release QA Hiker");
      await page.getByLabel("ชื่อผู้ใช้", { exact: true }).fill("release_qa_hiker");
      await expect(page.getByRole("heading", { name: "Release QA Hiker", exact: true })).toBeVisible();
      const { png } = await imageFixtures(page);
      await page.locator("#profile-avatar").setInputFiles(png("avatar.png", 1));
      await page.locator("#profile-cover").setInputFiles(png("cover.png", 2));
      await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
      await expect(page).toHaveURL(/\/search$/);
    });

    await test.step("Search opens Place Details and saves a dated memory with two photos", async () => {
      await page.getByPlaceholder("ค้นหาชื่อสถานที่ จังหวัด...").fill("ดอยอินทนนท์");
      await expect(page.locator('main a[href^="/places/"]')).toHaveCount(1);
      const place = page.locator('main a[href="/places/place-doi-inthanon"]');
      await expect(place).toHaveCount(1);
      await place.click();
      await expect(page).toHaveURL(/\/places\/place-doi-inthanon$/);
      await expect(page.getByRole("heading", { name: placeName, level: 1, exact: true })).toBeVisible();
      await page.getByRole("link", { name: "สแตมป์", exact: true }).click();
      await expect(page).toHaveURL(/\/records\/new\?placeId=place-doi-inthanon$/);
      await page.waitForLoadState("networkidle");
      await page.locator("#visitedAt").fill("2026-10-20");
      await page.getByLabel("บันทึกความทรงจำ", { exact: true }).fill(note);
      const { png } = await imageFixtures(page);
      await page.getByLabel("เลือกไฟล์รูปภาพ", { exact: true }).setInputFiles([png("memory-one.png"), png("memory-two.png", 1)]);
      await page.getByRole("radio", { name: "4 ดาว", exact: true }).click();
      await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต", exact: true }).click();
      await expect(page).toHaveURL(/\/passport$/);
      await expect(page.getByText("1 บันทึก", { exact: true })).toBeVisible();
      await expect(page.locator("blockquote")).toContainText(note);
      const record = page.locator('main a[href*="from=passport"]');
      await expect(record).toHaveCount(1);
      await record.click();
      await expect(page.getByText("1 / 2", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "สแตมป์", exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "ดูภาพจากการเดินทาง รูปที่ 1 แบบเต็มจอ", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
      await openPage(page, "/passport");
      await expect(page.getByText("1 บันทึก", { exact: true })).toBeVisible();
      await expect(page.locator("blockquote")).toContainText(note);
      const photo = page.locator("article img").first();
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.screenshot({ path: `/tmp/doen-pa-production-passport-${testInfo.project.name}.png`, fullPage: true });
    });

    await test.step("Visited map renders real terrain, the saved pin and its photo", async () => {
      const terrainStatuses: number[] = [];
      page.on("response", (response) => {
        if (new URL(response.url()).hostname === "tiles.stadiamaps.com") terrainStatuses.push(response.status());
      });
      await openPage(page, "/map");
      await expect(page.locator(".visited-map-pin-wrapper")).toHaveCount(1);
      await expect.poll(() => terrainStatuses.some((status) => status === 200), { timeout: 20_000 }).toBe(true);
      expect(terrainStatuses.some((status) => status === 401 || status === 403)).toBe(false);
      await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
      await expect.poll(() => page.locator(".leaflet-tile").evaluateAll((images: HTMLImageElement[]) =>
        images.length > 0 && images.every((image) => image.complete && image.naturalWidth > 0)), { timeout: 20_000 }).toBe(true);
      await expect(page.locator(".leaflet-control-attribution")).toContainText("Stadia Maps");
      await expect(page.locator(".leaflet-control-attribution")).toContainText("OpenStreetMap");
      await page.locator(".visited-map-pin-wrapper").click();
      const details = page.getByRole("complementary", { name: `รายละเอียด ${placeName}`, exact: true });
      await expect(details.getByRole("heading", { name: placeName, exact: true })).toBeVisible();
      await expect(details).toContainText("เชียงใหม่");
      await expect.poll(() => details.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.screenshot({ path: `/tmp/doen-pa-production-map-${testInfo.project.name}.png` });
    });

    await test.step("Stats and Profile agree with the saved memory", async () => {
      await openPage(page, "/stats");
      await expect(page.getByRole("heading", { name: "1 การเดินทาง", exact: true })).toBeVisible();
      await page.screenshot({ path: `/tmp/doen-pa-production-stats-${testInfo.project.name}.png` });
      await openPage(page, "/profile");
      await expect(page.getByRole("heading", { name: "Release QA Hiker", exact: true })).toBeVisible();
      await expect(page.getByText("2 รูป", { exact: true })).toBeVisible();
      await expect(page.locator('main a[href*="from=profile&photo="]')).toHaveCount(2);
      await expect.poll(() => page.getByAltText("Release QA Hiker", { exact: true }).last().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.screenshot({ path: `/tmp/doen-pa-production-profile-${testInfo.project.name}.png` });
    });

    const snapshot = await (await page.request.get("/api/account")).json();
    expect(snapshot.user.needsProfileSetup).toBe(false);
    expect(snapshot.records).toHaveLength(1);
    expect(snapshot.records[0].photos).toHaveLength(2);
    expect(snapshot.records[0].rating).toBe(4);
    expect(snapshot.records[0].visitedAt.slice(0, 10)).toBe("2026-10-20");
    const privatePhoto: string = snapshot.records[0].photos[0];

    await test.step("Logout removes private photo access", async () => {
      await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
      await expect(page.locator("main").getByRole("link", { name: "เข้าสู่ระบบ", exact: true })).toBeVisible();
      expect((await page.request.get("/api/account")).status()).toBe(401);
      expect((await page.request.get(privatePhoto)).status()).toBe(404);
    });

    await test.step("A fresh browser logs in to Search and restores cloud memories", async () => {
      const fresh = await browser.newContext({ baseURL: appOrigin, viewport: testInfo.project.use.viewport });
      try {
        const remote = await fresh.newPage();
        const errors: string[] = [];
        remote.on("pageerror", (error) => errors.push(error.message));
        remote.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
        await openPage(remote, "/login");
        await remote.getByLabel("อีเมล", { exact: true }).fill(account.email);
        await remote.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
        await remote.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
        await expect(remote).toHaveURL(/\/search$/);
        await openPage(remote, "/passport");
        await expect(remote.getByText("1 บันทึก", { exact: true })).toBeVisible();
        await expect(remote.locator("blockquote")).toContainText(note);
        const photo = await fresh.request.get(privatePhoto);
        expect(photo.status()).toBe(200);
        expect(photo.headers()["cache-control"]).toBe("private, no-store");
        expect((await fresh.request.post("/auth/logout", { headers: { Origin: appOrigin }, data: {} })).status()).toBe(200);
        expect(errors).toEqual([]);
      } finally { await fresh.close(); }
    });
  } finally { await removeTemporaryAccount(account.id); }
});
