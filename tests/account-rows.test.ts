import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import { readAccountRows } from "../src/lib/account/read-rows";

test("account pagination reads past a project row cap without skipping owner-scoped rows", async () => {
  const requests: URL[] = [];
  const client = createClient("https://account.test", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      requests.push(url);
      assert.equal(url.searchParams.get("user_id"), "eq.owner");
      assert.equal(url.searchParams.get("order"), "id.asc");
      assert.equal(new Headers(init?.headers).get("prefer"), "count=exact");
      const offset = Number(url.searchParams.get("offset"));
      const rows = Array.from({ length: Math.min(2, 5 - offset) }, (_, index) => ({ id: String(offset + index) }));
      return Response.json(rows, { headers: { "content-range": `${offset}-${offset + rows.length - 1}/5` } });
    } },
  });
  assert.deepEqual(await readAccountRows(client, "travel_records", "id", "owner"), Array.from({ length: 5 }, (_, id) => ({ id: String(id) })));
  assert.deepEqual(requests.map((url) => url.searchParams.get("offset")), ["0", "2", "4"]);
});

test("empty accounts succeed while interrupted, unavailable and incomplete reads fail", async () => {
  for (const scenario of ["empty", "no-count", "unavailable", "incomplete"] as const) {
    let calls = 0;
    const client = createClient("https://account.test", "test-key", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: async () => {
        calls++;
        if (scenario === "unavailable") return Response.json({ message: "unavailable" }, { status: 400 });
        const rows = scenario === "empty" || calls > 1 ? [] : [{ id: "one" }];
        return Response.json(rows, { headers: scenario === "no-count" ? {} : { "content-range": `*/${scenario === "empty" ? 0 : 2}` } });
      } },
    });
    if (scenario === "empty") assert.deepEqual(await readAccountRows(client, "photos", "id", "owner"), []);
    else if (scenario === "no-count") assert.deepEqual(await readAccountRows(client, "photos", "id", "owner"), [{ id: "one" }]);
    else await assert.rejects(readAccountRows(client, "photos", "id", "owner"));
  }
});
