import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { storageSchema } from "./helpers/storage-schema";

const accountA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const accountB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const migrationDir = join(process.cwd(), "supabase/migrations");

async function asAccount<T>(db: PGlite, userId: string, run: () => Promise<T>) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId]);
  try { return await run(); } finally { await db.exec("reset role; reset request.jwt.claim.sub"); }
}

test("a full database backup restores into a fresh instance with data and RLS intact", async (t) => {
  const source = new PGlite();
  t.after(() => source.close());
  await source.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create table auth.users (id uuid primary key, email_confirmed_at timestamptz, recovery_token text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    insert into auth.users values ('${accountA}'), ('${accountB}');
  `);
  await source.exec(storageSchema);
  for (const file of readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort()) {
    await source.exec(readFileSync(join(migrationDir, file), "utf8"));
  }
  for (const id of [accountA, accountB]) {
    await source.query("insert into public.profiles(user_id,name) values ($1,$2)", [id, `hiker-${id.slice(0, 1)}`]);
    await source.query("insert into public.travel_records(user_id,id,place_id,visited_at,note) values ($1,'r','p',now(),'บันทึก')", [id]);
    await source.query(`insert into public.photos(user_id,id,kind,travel_record_id,position,object_path,mime_type,size_bytes)
      values ($1,'ph','travel','r',0,$2,'image/jpeg',10)`, [id, `${id}/record-photos/ph.jpg`]);
  }

  // Backup: archive the whole data directory. Restore: boot a brand-new instance from it.
  const backup = await source.dumpDataDir("gzip");
  const restored = await PGlite.create({ loadDataDir: backup });
  t.after(() => restored.close());

  for (const table of ["profiles", "travel_records", "photos"]) {
    const before = (await source.query(`select * from public.${table} order by user_id`)).rows;
    const after = (await restored.query(`select * from public.${table} order by user_id`)).rows;
    assert.deepEqual(after, before, `${table} rows match the backup`);
  }
  // Restored policies still isolate accounts, and the restored deletion function works.
  await asAccount(restored, accountA, async () => {
    assert.deepEqual((await restored.query<{ user_id: string }>("select user_id from public.travel_records")).rows, [{ user_id: accountA }]);
    await restored.exec("select public.delete_my_account()");
  });
  assert.deepEqual((await restored.query("select id from auth.users")).rows, [{ id: accountB }]);
});
