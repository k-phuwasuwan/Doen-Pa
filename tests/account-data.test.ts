import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeAccountData, photoUrl, type AccountData } from "../src/domain/account-data";

function snapshot(): AccountData {
  return {
    user: { id: "owner", name: "ผู้เดินทาง", username: "hiker", avatar: photoUrl("owner", "avatar"), needsProfileSetup: false },
    records: [{ id: "visit", userId: "owner", placeId: "place-khao-yai", note: "memory", rating: 4,
      photos: [photoUrl("owner", "photo")], visitedAt: "2026-01-01T12:00:00Z", createdAt: "2026-01-02T12:00:00Z" }],
  };
}

test("account decoding restores dates without changing the network snapshot", () => {
  const source = snapshot();
  const decoded = decodeAccountData(source, "owner");
  assert.equal(decoded.user.name, source.user.name);
  assert.equal(decoded.user.avatar, source.user.avatar);
  assert.equal(decoded.records[0].visitedAt.getTime(), Date.parse(source.records[0].visitedAt));
  assert.equal(decoded.records[0].createdAt.getTime(), Date.parse(source.records[0].createdAt));
  assert.equal(typeof source.records[0].visitedAt, "string");
  assert.deepEqual(decodeAccountData({ user: source.user, records: [] }, "owner").records, []);
});

test("account decoding rejects foreign identities and malformed profile fields", () => {
  for (const changes of [{ id: "other" }, { bio: {} }, { avatar: 42 }, { coverImage: "https://other.test/image.png" }, { needsProfileSetup: "false" }]) {
    const source = snapshot();
    assert.throws(() => decodeAccountData({ ...source, user: { ...source.user, ...changes } }, "owner"));
  }
});

test("account decoding rejects invalid records instead of silently changing statistics", () => {
  for (const changes of [{ userId: "other" }, { rating: 6 }, { rating: 1.5 }, { photos: [null] },
    { visitedAt: null }, { visitedAt: 0 }, { createdAt: null }, { createdAt: "invalid" }]) {
    const source = snapshot();
    assert.throws(() => decodeAccountData({ ...source, records: [{ ...source.records[0], ...changes }] }, "owner"));
  }
  for (const value of [null, [], {}, { user: snapshot().user, records: null }]) {
    assert.throws(() => decodeAccountData(value, "owner"));
  }
});
