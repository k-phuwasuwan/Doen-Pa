import assert from "node:assert/strict";
import { test } from "node:test";
import { isProfileSetupComplete } from "../src/lib/auth/profile-setup";

test("first-time setup requires a chosen display name and username", () => {
  assert.equal(isProfileSetupComplete("ผู้เดินทาง", "hiker_01"), true);
  assert.equal(isProfileSetupComplete("นักเดินทาง", "hiker_01"), false);
  assert.equal(isProfileSetupComplete("ผู้เดินทาง", "new_hiker"), false);
  assert.equal(isProfileSetupComplete("   ", "hiker_01"), false);
  assert.equal(isProfileSetupComplete("ผู้เดินทาง", "ab"), false);
  assert.equal(isProfileSetupComplete("ผู้เดินทาง", "has space"), false);
});
