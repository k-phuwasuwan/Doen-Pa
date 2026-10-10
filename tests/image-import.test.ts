import assert from "node:assert/strict";
import { test } from "node:test";
import { createImageImporter, PROFILE_IMAGE_POLICY, RECORD_IMAGE_POLICY, type ImageFile, type ImportedImage } from "../src/lib/images/image-import";

function file(name: string, changes: Partial<ImageFile> = {}): ImageFile {
  return { name, type: "image/png", size: 100, ...changes };
}
function deferred() {
  let resolve!: (value: string) => void;
  const promise = new Promise<string>((done) => { resolve = done; });
  return { promise, resolve };
}

test("type and size validation respect each policy and never read rejected files", async () => {
  const readNames: string[] = [];
  const importer = createImageImporter(async (image: ImageFile) => { readNames.push(image.name); return "data:image/png;base64,ok"; });
  await importer.importImages("avatar", [file("wrong", { type: "text/plain" }), file("large", { size: PROFILE_IMAGE_POLICY.maxBytes + 1 }), file("exact", { size: PROFILE_IMAGE_POLICY.maxBytes })], PROFILE_IMAGE_POLICY, ({ images, errors }) => {
    assert.equal(images.length, 1);
    assert.equal(errors.length, 2);
    assert.equal(errors[1].message, PROFILE_IMAGE_POLICY.sizeMessage);
  });
  assert.deepEqual(readNames, ["exact"]);
  await importer.importImages("record", [file("5MB", { size: RECORD_IMAGE_POLICY.maxBytes })], RECORD_IMAGE_POLICY, ({ images }) => assert.equal(images.length, 1));
  assert.equal(importer.isPending(), false);
});

test("read failure is reported while successful images keep selection order", async () => {
  const importer = createImageImporter(async (image: ImageFile) => { if (image.name === "failed") throw new Error("read failed"); return image.name; });
  await importer.importImages("record", [file("first"), file("failed"), file("last")], RECORD_IMAGE_POLICY, ({ images, errors }) => {
    assert.deepEqual(images.map((image) => image.name), ["first", "last"]);
    assert.equal(errors[0].filename, "failed");
  });
  assert.deepEqual(importer.getSnapshot(), []);
});

test("latest choice wins and obsolete completion cannot clear pending state", async () => {
  const older = deferred();
  const newer = deferred();
  const importer = createImageImporter((image: ImageFile) => image.name === "old" ? older.promise : newer.promise);
  const committed: string[] = [];
  const first = importer.importImages("avatar", [file("old")], PROFILE_IMAGE_POLICY, () => committed.push("old"));
  const second = importer.importImages("avatar", [file("new")], PROFILE_IMAGE_POLICY, () => committed.push("new"));
  older.resolve("old");
  await first;
  assert.deepEqual(committed, []);
  assert.equal(importer.isPending(), true);
  newer.resolve("new");
  await second;
  assert.deepEqual(committed, ["new"]);
  assert.equal(importer.isPending(), false);
});

test("avatar and cover run independently and pending state remains stable between changes", async () => {
  const avatar = deferred();
  const cover = deferred();
  const importer = createImageImporter((image: ImageFile) => image.name === "avatar" ? avatar.promise : cover.promise);
  const first = importer.importImages("avatar", [file("avatar")], PROFILE_IMAGE_POLICY, () => {});
  const second = importer.importImages("cover", [file("cover")], PROFILE_IMAGE_POLICY, () => {});
  assert.deepEqual(importer.getSnapshot(), ["avatar", "cover"]);
  assert.equal(importer.getSnapshot(), importer.getSnapshot());
  avatar.resolve("avatar"); await first;
  assert.deepEqual(importer.getSnapshot(), ["cover"]);
  cover.resolve("cover"); await second;
  assert.equal(importer.isPending(), false);
});

test("cancelled forms never receive late results", async () => {
  const pending = deferred();
  const importer = createImageImporter(() => pending.promise);
  let commits = 0;
  const job = importer.importImages("record", [file("image")], RECORD_IMAGE_POLICY, () => { commits++; });
  importer.cancelAll();
  pending.resolve("image"); await job;
  assert.equal(commits, 0);
  assert.equal(importer.isPending(), false);
});

test("completion can append to current draft without resurrecting removed images", async () => {
  const pending = deferred();
  const importer = createImageImporter(() => pending.promise);
  let draft: Array<ImportedImage & { alt: string }> = [{ name: "remove", dataUrl: "old", alt: "" }, { name: "keep", dataUrl: "keep", alt: "before" }];
  const job = importer.importImages("record", [file("new")], RECORD_IMAGE_POLICY, ({ images }) => {
    draft = [...draft, ...images.map((image) => ({ ...image, alt: "" }))];
  });
  draft = [{ ...draft[1], alt: "edited while reading" }];
  pending.resolve("new"); await job;
  assert.deepEqual(draft.map((image) => image.name), ["keep", "new"]);
  assert.equal(draft[0].alt, "edited while reading");
});
