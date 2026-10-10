import { test, expect, openPage, imageFixtures, controlledImageReads } from "./fixtures";

test("latest avatar wins while cover and cross-tab profile update independently", async ({ page, context }) => {
  await controlledImageReads(page);
  const observer = await context.newPage();
  await openPage(observer, "/passport");
  await openPage(page, "/profile/edit");
  const { urls, png } = await imageFixtures(page);
  await page.getByLabel("ชื่อที่แสดง").fill("QA Local User");
  await page.locator("#profile-avatar").setInputFiles(png("held-old.png", 0));
  await page.locator("#profile-avatar").setInputFiles(png("new.png", 1));
  await page.locator("#profile-cover").setInputFiles(png("held-cover.png", 2));
  await expect(page.getByRole("button", { name: "กำลังอ่านรูปภาพ…" })).toBeDisabled();
  await expect(page.getByAltText("QA Local User", { exact: true })).toHaveAttribute("src", urls[1]);
  await page.evaluate(() => window.releaseImageReads());
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(observer.getByRole("heading", { name: "QA Local User", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("doen-pa-current-user-v2") ?? "null"));
  expect(saved.avatar).toBe(urls[1]);
  expect(saved.coverImage).toBe(urls[2]);
});

test("removal and alt edits survive pending reads and record save updates another tab", async ({ page, context }) => {
  await controlledImageReads(page);
  const observer = await context.newPage();
  await openPage(observer, "/passport");
  await openPage(page, "/records/new?placeId=place-doi-inthanon");
  const { urls, png } = await imageFixtures(page);
  const input = page.getByLabel("เลือกไฟล์รูปภาพ", { exact: true });
  await input.setInputFiles([png("remove.png", 0), png("keep.png", 1)]);
  await expect(page.getByRole("button", { name: "ลบรูป keep.png" })).toBeAttached();
  await input.setInputFiles(png("held-added.png", 2));
  await expect(page.getByRole("button", { name: "กำลังอ่านรูปภาพ…" })).toBeDisabled();
  // Desktop removal controls appear on hover/focus.
  await page.getByRole("button", { name: "ลบรูป remove.png" }).focus();
  await page.getByRole("button", { name: "ลบรูป remove.png" }).click();
  await page.getByLabel("คำอธิบายสำหรับรูปที่ 1").fill("edited while reading");
  await page.evaluate(() => window.releaseImageReads());
  await expect(page.getByRole("button", { name: "ลบรูป held-added.png" })).toBeAttached();
  await expect(page.getByRole("button", { name: "ลบรูป remove.png" })).toHaveCount(0);
  await expect(page.getByLabel("คำอธิบายสำหรับรูปที่ 1")).toHaveValue("edited while reading");
  await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต" }).click();
  await expect(page).toHaveURL(/\/passport$/);
  await expect(observer.getByText("1 บันทึก", { exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("doen-pa-travel-records-v2") ?? "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0].photos).toEqual([urls[1], urls[2]]);
});

test("file validation keeps separate profile and record limits", async ({ page }, testInfo) => {
  await openPage(page, "/profile/edit");
  await page.locator("#profile-avatar").setInputFiles({ name: "invalid.txt", mimeType: "text/plain", buffer: Buffer.from("invalid") });
  await expect(page.getByText("รองรับเฉพาะ JPG, PNG, WebP", { exact: true })).toBeVisible();
  await page.locator("#profile-avatar").setInputFiles({ name: "large.png", mimeType: "image/png", buffer: Buffer.alloc(1024 * 1024 + 1) });
  await expect(page.getByText("รูปภาพต้องมีขนาดไม่เกิน 1 MB เพื่อเก็บไว้ในเบราว์เซอร์", { exact: true })).toBeVisible();
  await openPage(page, "/records/new?placeId=place-doi-inthanon");
  const { png } = await imageFixtures(page);
  const input = page.getByLabel("เลือกไฟล์รูปภาพ", { exact: true });
  await input.setInputFiles({ name: "large.png", mimeType: "image/png", buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await expect(page.getByText("ไฟล์ต้องไม่เกิน 5 MB")).toBeVisible();
  await input.setInputFiles(Array.from({ length: 6 }, (_, index) => png(`photo-${index}.png`, index % 3)));
  await expect(page.getByText("ครบ 5 รูปแล้ว", { exact: true })).toBeVisible();
  await expect(page.locator('button[aria-label^="ลบรูป"]')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("record-form.png") });
});

test("storage quota failure shows error without publishing unsaved data", async ({ page, context }) => {
  const observer = await context.newPage();
  await openPage(observer, "/passport");
  await openPage(page, "/profile/edit");
  await page.getByLabel("ชื่อที่แสดง").fill("Unsaved Name");
  const failWrites = () => {
    Storage.prototype.setItem = () => { throw new DOMException("Quota full", "QuotaExceededError"); };
  };
  await page.evaluate(failWrites);
  await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง" }).click();
  await expect(page.getByText("บันทึกไม่สำเร็จ พื้นที่จัดเก็บในเบราว์เซอร์อาจเต็ม กรุณาใช้รูปภาพที่เล็กลง", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("doen-pa-current-user-v2"))).toBeNull();
  await openPage(page, "/records/new?placeId=place-doi-inthanon");
  await page.evaluate(failWrites);
  await page.getByRole("button", { name: "บันทึกลงพาสปอร์ต" }).click();
  await expect(page.getByText("เกิดข้อผิดพลาด กรุณาลองใหม่", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("doen-pa-travel-records-v2"))).toBeNull();
  await expect(observer.getByText("พาสปอร์ตของคุณยังว่างเปล่า")).toBeVisible();
  await expect(observer.getByRole("heading", { name: "ผู้ใช้ใหม่", exact: true })).toBeVisible();
});
