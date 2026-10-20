import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { readReviewedCatalog } from "./helpers/place-catalog";

const places = readReviewedCatalog();

test("place migrations and seed preserve the catalog and enforce public read-only access", async (t) => {
  const generated = spawnSync("python3", ["scripts/import-national-parks.py", "--check"], { encoding: "utf8" });
  assert.equal(generated.status, 0, generated.stderr);

  const db = new PGlite();
  t.after(() => db.close());
  // Model the Supabase roles and its possible automatic table grants.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    alter default privileges in schema public
      grant all on tables to anon, authenticated, service_role;
  `);
  const migrationDir = join(process.cwd(), "supabase/migrations");
  const migrationFiles = readdirSync(migrationDir).filter((name) => name.endsWith("_create_places.sql"));
  assert.equal(migrationFiles.length, 1);
  await db.exec(readFileSync(join(migrationDir, migrationFiles[0]), "utf8"));
  const seed = readFileSync("supabase/seed.sql", "utf8");
  await db.exec(seed);

  await t.test("all 156 seed rows match the reviewed CSV, including stable IDs and missing values", async () => {
    const { rows } = await db.query("select * from public.places order by id");
    const expected = places.map((place) => ({
      id: place.id,
      name: place.name,
      location: place.location,
      province: place.province,
      region: place.region,
      description: place.description,
      type: place.type,
      is_national_park: place.isNationalPark ?? false,
      latitude: place.latitude ?? null,
      longitude: place.longitude ?? null,
      altitude: place.altitude ?? null,
      distance: place.distance ?? null,
    })).sort((a, b) => a.id.localeCompare(b.id));
    assert.equal(rows.length, 156);
    assert.deepEqual(rows, expected);
  });

  await t.test("reimport updates data without duplicates, losing references, or deleting other places", async () => {
    await db.exec(`
      create table saved_place_references (
        place_id text references public.places(id)
      );
      insert into saved_place_references values ('place-khao-yai');
      update public.places set name = 'outdated name', altitude = null
        where id = 'place-khao-yai';
      insert into public.places (id, name, province, region, type)
        values ('admin-extra', 'สถานที่เพิ่มเติม', 'เชียงใหม่', 'north', 'mountain');
    `);
    await db.exec(seed);
    await db.exec(seed);
    const { rows } = await db.query<{ count: number }>("select count(*)::int as count from public.places");
    assert.equal(rows[0].count, 157);
    const park = await db.query("select name, altitude from public.places where id = 'place-khao-yai'");
    const original = places.find((place) => place.id === "place-khao-yai");
    assert.deepEqual(park.rows, [{ name: original?.name, altitude: original?.altitude }]);
    const references = await db.query("select place_id from saved_place_references");
    assert.deepEqual(references.rows, [{ place_id: "place-khao-yai" }]);
    await db.exec("delete from public.places where id = 'admin-extra'");
  });

  await t.test("generated SQL safely round-trips Thai text, quotes, backslashes, zero and missing values", async () => {
    const fixture = {
      id: "import-escaping-test",
      name: "สถานที่ 'ทดสอบ' \\",
      province: "เชียงใหม่",
      region: "north",
      location: "",
      description: "บรรทัดแรก\n'); drop table public.places; -- \\ ความทรงจำ",
      type: "mountain",
      isNationalPark: false,
      latitude: 0,
      longitude: 0,
      distance: "0 กม.",
    };
    const render = spawnSync("python3", ["-c", [
      "import json, runpy, sys",
      "module = runpy.run_path('scripts/import-national-parks.py')",
      "sys.stdout.write(module['render_seed'](json.load(sys.stdin)))",
    ].join("\n")], { input: JSON.stringify([fixture]), encoding: "utf8" });
    assert.equal(render.status, 0, render.stderr);
    await db.exec(render.stdout);
    const { rows } = await db.query("select name, description, altitude, distance, latitude from public.places where id = $1", [fixture.id]);
    assert.deepEqual(rows, [{ name: fixture.name, description: fixture.description, altitude: null, distance: "0 กม.", latitude: 0 }]);
    await db.exec("delete from public.places where id = 'import-escaping-test'");
  });

  await t.test("both public roles can read but cannot insert, update, delete or truncate", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      try {
        const { rows } = await db.query<{ count: number }>("select count(*)::int as count from public.places");
        assert.equal(rows[0].count, 156);
        for (const sql of [
          "insert into public.places (id, name, province, region, type) values ('unauthorized', 'test', 'เชียงใหม่', 'north', 'mountain')",
          "update public.places set name = 'changed' where id = 'place-khao-yai'",
          "delete from public.places where id = 'place-khao-yai'",
          "truncate public.places cascade",
        ]) {
          await assert.rejects(db.exec(sql), { code: "42501" });
        }
      } finally {
        await db.exec("reset role");
      }
    }
  });

  await t.test("RLS also blocks writes if a client role accidentally receives write grants", async () => {
    const { rows } = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where oid = 'public.places'::regclass",
    );
    assert.equal(rows[0].relrowsecurity, true);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`grant insert, update, delete on public.places to ${role}; set role ${role}`);
      try {
        await assert.rejects(db.exec(
          "insert into public.places (id, name, province, region, type) values ('rls-test', 'test', 'เชียงใหม่', 'north', 'mountain')",
        ), { code: "42501" });
        const update = await db.query("update public.places set name = 'changed' returning id");
        const remove = await db.query("delete from public.places returning id");
        assert.equal(update.rows.length, 0);
        assert.equal(remove.rows.length, 0);
      } finally {
        await db.exec(`reset role; revoke insert, update, delete on public.places from ${role}`);
      }
    }
  });

  await t.test("trusted imports can upsert and invalid catalog data is rejected", async () => {
    await db.exec("set role service_role");
    try {
      await db.exec(seed);
    } finally {
      await db.exec("reset role");
    }
    for (const sql of [
      "update public.places set type = 'booking' where id = 'place-khao-yai'",
      "update public.places set region = 'unknown' where id = 'place-khao-yai'",
      "update public.places set latitude = 91 where id = 'place-khao-yai'",
      "update public.places set longitude = 'NaN' where id = 'place-khao-yai'",
      "update public.places set altitude = '' where id = 'place-khao-yai'",
    ]) {
      await assert.rejects(db.exec(sql), { code: "23514" });
    }
  });
});
