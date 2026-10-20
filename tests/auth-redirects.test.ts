import assert from "node:assert/strict";
import { test } from "node:test";
import { safeAuthNext, loginHref, authBackHref } from "../src/lib/auth/redirects";

test("auth redirects accept only app destinations and preserve stamp intent", () => {
  for (const value of [null, undefined, "https://evil.example", "//evil.example", "/\\evil.example", "/login", "/auth/logout", "/%2f%2fevil.example", "/passport\n", "/passport/../login"]) {
    assert.equal(safeAuthNext(value), "/passport");
  }
  assert.equal(safeAuthNext("/profile?view=guest#anything"), "/profile");
  assert.equal(safeAuthNext("/records/new?placeId=place-khao-yai&returnTo=search&evil=1"), "/records/new?placeId=place-khao-yai&returnTo=search");
  assert.equal(safeAuthNext("/records/new"), "/passport");
  assert.equal(loginHref("/profile/edit"), "/login?next=%2Fprofile%2Fedit");
  assert.equal(authBackHref("stats"), "/stats");
  assert.equal(authBackHref("https://evil.example"), "/passport");
});
