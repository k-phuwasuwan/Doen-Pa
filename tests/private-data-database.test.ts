import { storageSchema } from "./helpers/storage-schema";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const accountA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const accountB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const tables = ["profiles", "travel_records", "photos"];
const migrationDir = join(process.cwd(), "supabase/migrations");
const privateMigration = readdirSync(migrationDir).find((name) => name.endsWith("_create_private_user_data.sql"));
assert.ok(privateMigration);
const migration = readFileSync(join(migrationDir, privateMigration), "utf8");

async function prepare(db: PGlite) {
  // Supabase-compatible identity lookup; no Auth server or real accounts needed.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, email_confirmed_at timestamptz, recovery_token text);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    insert into auth.users values ('${accountA}'), ('${accountB}');
  `);
  await db.exec(storageSchema);
}

async function asAccount(db: PGlite, userId: string | null, run: () => Promise<void>, role = "authenticated") {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? ""]);
  try {
    await run();
  } finally {
    await db.exec("reset role; reset request.jwt.claim.sub");
  }
}

async function addPhoto(db: PGlite, userId: string, id: string, recordId = "shared-local-id", position = 0) {
  return db.query(`insert into public.photos
    (user_id, id, kind, travel_record_id, position, object_path, mime_type, size_bytes)
    values ($1, $2, 'travel', $3, $4, $5, 'image/jpeg', 5242880)`,
  [userId, id, recordId, position, `${userId}/record-photos/${id}.jpg`]);
}

test("private data migrations isolate two accounts and preserve local import identities", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await prepare(db);
  // Apply the entire application migration history, not just the new tables.
  for (const file of readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(migrationDir, file), "utf8"));
  }

  await t.test("hosted smoke-test script passes and rolls back its identities and data", async () => {
    await db.exec(readFileSync("supabase/tests/private_user_data.sql", "utf8"));
    assert.equal((await db.query("select * from auth.users")).rows.length, 2);
    assert.equal((await db.query("select * from public.profiles")).rows.length, 0);
  });

  for (const userId of [accountA, accountB]) {
    await asAccount(db, userId, async () => {
      await db.query("insert into public.profiles (user_id) values ($1)", [userId]);
      await db.query(`insert into public.travel_records (user_id, id, place_id, visited_at)
        values ($1, 'shared-local-id', 'archived-or-unknown-place', '2025-01-01T07:00:00+07:00')`, [userId]);
      await addPhoto(db, userId, "first-photo");
    });
  }

  await t.test("each account sees only its own rows, including when local IDs match", async () => {
    for (const userId of [accountA, accountB]) {
      await asAccount(db, userId, async () => {
        for (const table of tables) {
          const { rows } = await db.query(`select user_id from public.${table}`);
          assert.deepEqual(rows, [{ user_id: userId }]);
        }
      });
    }
  });

  await t.test("forged ownership and ownership reassignment are rejected for every table", async () => {
    await asAccount(db, accountA, async () => {
      for (const sql of [
        `insert into public.profiles (user_id) values ('${accountB}')`,
        `insert into public.travel_records (user_id, place_id, visited_at) values ('${accountB}', 'place', now())`,
        `insert into public.photos (user_id, kind, object_path, mime_type, size_bytes)
          values ('${accountB}', 'avatar', '${accountB}/profile/forged.jpg', 'image/jpeg', 100)`,
      ]) await assert.rejects(db.exec(sql), { code: "42501" });
      for (const table of tables) {
        await assert.rejects(db.query(`update public.${table} set user_id = $1`, [accountB]), { code: "42501" });
        const update = await db.query(`update public.${table} set user_id = user_id where user_id = $1 returning *`, [accountB]);
        const remove = await db.query(`delete from public.${table} where user_id = $1 returning *`, [accountB]);
        assert.equal(update.rows.length, 0);
        assert.equal(remove.rows.length, 0);
        await assert.rejects(db.exec(`truncate public.${table} cascade`), { code: "42501" });
      }
    });
  });

  await t.test("photos cannot reference another account's record or object path", async () => {
    await asAccount(db, accountB, async () => {
      await db.query(`insert into public.travel_records (user_id, id, place_id, visited_at)
        values ($1, 'only-b', 'place', now())`, [accountB]);
    });
    await asAccount(db, accountA, async () => {
      await assert.rejects(addPhoto(db, accountA, "foreign-record", "only-b"), { code: "23503" });
      await assert.rejects(db.query("update public.photos set travel_record_id = 'only-b'"), { code: "23503" });
      await assert.rejects(db.query("update public.photos set object_path = $1", [`${accountB}/record-photos/stolen.jpg`]), { code: "23514" });
    });
  });

  await t.test("no identity and anonymous callers cannot read or mutate private data", async () => {
    await asAccount(db, null, async () => {
      for (const table of tables) {
        assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
        assert.equal((await db.query(`delete from public.${table} returning *`)).rows.length, 0);
        assert.equal((await db.query(`update public.${table} set user_id = user_id returning *`)).rows.length, 0);
      }
      await assert.rejects(db.query("insert into public.profiles(user_id) values ($1)", [accountA]), { code: "42501" });
    });
    await asAccount(db, null, async () => {
      for (const table of tables) {
        for (const operation of [`select * from public.${table}`, `delete from public.${table}`, `update public.${table} set user_id = user_id`]) {
          await assert.rejects(db.exec(operation), { code: "42501" });
        }
      }
    }, "anon");
    // Even an accidental future anon grant must not bypass RLS.
    await db.exec("grant select, insert, update, delete on public.profiles to anon");
    await asAccount(db, null, async () => {
      assert.equal((await db.query("select * from public.profiles")).rows.length, 0);
      await assert.rejects(db.query("insert into public.profiles(user_id) values ($1)", [accountA]), { code: "42501" });
    }, "anon");
    await db.exec("revoke all on public.profiles from anon");
  });

  await t.test("owners can update/upsert, keep revisits and save five photos per record", async () => {
    await asAccount(db, accountA, async () => {
      await db.query("update public.profiles set name = 'ผู้เดินทาง', bio = 'ความทรงจำ' where user_id = $1", [accountA]);
      await db.query(`insert into public.travel_records (user_id, id, place_id, visited_at, note, rating)
        values ($1, 'shared-local-id', 'archived-or-unknown-place', now(), 'นำเข้าซ้ำ', 5)
        on conflict (user_id, id) do update set note = excluded.note, rating = excluded.rating`, [accountA]);
      assert.deepEqual((await db.query("select note, rating from public.travel_records")).rows, [{ note: "นำเข้าซ้ำ", rating: 5 }]);
      for (let i = 1; i < 5; i++) await addPhoto(db, accountA, `photo-${i}`, "shared-local-id", i);
      await assert.rejects(addPhoto(db, accountA, "sixth", "shared-local-id", 5), { code: "23514" });
      await assert.rejects(addPhoto(db, accountA, "duplicate-slot", "shared-local-id", 4), { code: "23505" });
      await db.query(`insert into public.travel_records (user_id, id, place_id, visited_at)
        values ($1, 'revisit', 'archived-or-unknown-place', now())`, [accountA]);
      await addPhoto(db, accountA, "revisit-photo", "revisit");
      assert.equal((await db.query("select * from public.photos")).rows.length, 6);
      await db.query("update public.photos set mime_type = 'image/png', size_bytes = 1 where id = 'revisit-photo'");
      assert.equal((await db.query("delete from public.photos where id = 'revisit-photo' returning *")).rows.length, 1);
    });
  });

  await t.test("profile image rules and metadata constraints reject invalid data", async () => {
    await asAccount(db, accountA, async () => {
      await db.query(`insert into public.photos(user_id, id, kind, object_path, mime_type, size_bytes)
        values ($1, 'avatar', 'avatar', $2, 'image/webp', 1048576),
               ($1, 'cover', 'cover', $3, 'image/png', 1048576)`,
      [accountA, `${accountA}/profile/avatar.webp`, `${accountA}/profile/cover.png`]);
      for (const sql of [
        "update public.photos set size_bytes = 1048577 where kind = 'avatar'",
        "update public.photos set size_bytes = 5242881 where kind = 'travel'",
        "update public.photos set size_bytes = 0",
        "update public.photos set mime_type = 'image/svg+xml'",
        "update public.photos set travel_record_id = null where kind = 'travel'",
        "update public.photos set travel_record_id = 'shared-local-id' where kind = 'avatar'",
        `update public.photos set object_path = '${accountA}/profile/../other.jpg' where kind = 'avatar'`,
        "update public.profiles set username = 'bad handle'",
        "update public.profiles set name = '   '",
        "update public.profiles set bio = repeat('x', 161)",
        "update public.travel_records set rating = 6",
        "update public.travel_records set visited_at = 'infinity'",
        "update public.travel_records set place_id = ''",
      ]) await assert.rejects(db.exec(sql), { code: "23514" });
      await assert.rejects(db.query(`insert into public.photos(user_id, kind, object_path, mime_type, size_bytes)
        values ($1, 'avatar', $2, 'image/jpeg', 100)`, [accountA, `${accountA}/profile/second.jpg`]), { code: "23505" });
    });
  });

  await t.test("deleting records and accounts cascades metadata without touching the other owner", async () => {
    await asAccount(db, accountA, async () => {
      await db.query("delete from public.travel_records where id = 'shared-local-id'");
      assert.equal((await db.query("select * from public.photos where kind = 'travel'")).rows.length, 0);
    });
    await db.query("delete from auth.users where id = $1", [accountA]);
    for (const table of tables) {
      assert.equal((await db.query(`select * from public.${table} where user_id = $1`, [accountA])).rows.length, 0);
      assert.ok((await db.query(`select * from public.${table} where user_id = $1`, [accountB])).rows.length > 0);
    }
  });
});

test("existing auto-RLS trigger keeps working after API execution is revoked", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await prepare(db);
  await db.exec(`
    create function public.rls_auto_enable() returns event_trigger
      language plpgsql security definer set search_path = pg_catalog as $$
    declare cmd record;
    begin
      for cmd in select * from pg_event_trigger_ddl_commands()
        where object_type = 'table' and schema_name = 'public'
      loop
        execute format('alter table %s enable row level security', cmd.object_identity);
      end loop;
    end;
    $$;
    grant execute on function public.rls_auto_enable() to anon, authenticated, service_role;
    create event trigger ensure_rls on ddl_command_end when tag in ('CREATE TABLE')
      execute function public.rls_auto_enable();
  `);
  await db.exec(migration);
  for (const role of ["anon", "authenticated", "service_role"]) {
    const { rows } = await db.query<{ allowed: boolean }>(
      "select has_function_privilege($1, 'public.rls_auto_enable()', 'EXECUTE') as allowed", [role]);
    assert.equal(rows[0].allowed, false);
  }
  await db.exec("create table public.auto_rls_probe(id integer)");
  assert.deepEqual((await db.query("select relrowsecurity from pg_class where oid = 'public.auto_rls_probe'::regclass")).rows,
    [{ relrowsecurity: true }]);
});
