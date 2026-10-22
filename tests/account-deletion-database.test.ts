import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { storageSchema } from "./helpers/storage-schema";

const accountA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const accountB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const migrationDir = join(process.cwd(), "supabase/migrations");

async function asAccount(db: PGlite, userId: string | null, role: string, run: () => Promise<void>) {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? ""]);
  try { await run(); } finally { await db.exec("reset role; reset request.jwt.claim.sub"); }
}

test("delete_my_account removes only the caller's data and is closed to anonymous callers", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    insert into auth.users values ('${accountA}'), ('${accountB}');
  `);
  await db.exec(storageSchema);
  for (const file of readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(migrationDir, file), "utf8"));
  }
  for (const id of [accountA, accountB]) {
    await db.query("insert into public.profiles(user_id) values ($1)", [id]);
    await db.query("insert into public.travel_records(user_id,id,place_id,visited_at) values ($1,'r','p',now())", [id]);
    await db.query(`insert into public.photos(user_id,id,kind,travel_record_id,position,object_path,mime_type,size_bytes)
      values ($1,'ph','travel','r',0,$2,'image/jpeg',10)`, [id, `${id}/record-photos/ph.jpg`]);
  }

  await asAccount(db, null, "anon", async () => {
    await assert.rejects(db.exec("select public.delete_my_account()"), { code: "42501" });
  });
  await asAccount(db, accountA, "authenticated", async () => { await db.exec("select public.delete_my_account()"); });

  assert.deepEqual((await db.query("select id from auth.users")).rows, [{ id: accountB }]);
  for (const table of ["profiles", "travel_records", "photos"]) {
    const rows = (await db.query<{ user_id: string }>(`select user_id from public.${table}`)).rows;
    assert.deepEqual(rows.map((row) => row.user_id), [accountB], table);
  }
});
