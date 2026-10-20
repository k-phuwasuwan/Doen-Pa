-- Administrator-only smoke test for a migrated Supabase project.
-- Uses two temporary Auth identities and rolls back ALL test data and DDL.
-- This tests actual Postgres roles/RLS, not signup, JWT verification or Storage.
begin;
select set_config('test.account_a', gen_random_uuid()::text, true);
select set_config('test.account_b', gen_random_uuid()::text, true);
insert into auth.users (id) values
  (current_setting('test.account_a')::uuid),
  (current_setting('test.account_b')::uuid);

set local role authenticated;
do $$
declare
  owner_id uuid;
  other_id uuid;
  table_name text;
  affected integer;
begin
  foreach owner_id in array array[current_setting('test.account_a')::uuid, current_setting('test.account_b')::uuid]
  loop
    perform set_config('request.jwt.claim.sub', owner_id::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
    insert into public.profiles(user_id) values (owner_id);
    insert into public.travel_records(user_id, id, place_id, visited_at)
      values (owner_id, 'rls-smoke-record', 'history-only-place', now());
    insert into public.photos(user_id, id, kind, travel_record_id, object_path, mime_type, size_bytes)
      values (owner_id, 'rls-smoke-photo', 'travel', 'rls-smoke-record',
        owner_id::text || '/record-photos/smoke.jpg', 'image/jpeg', 100);
  end loop;

  foreach owner_id in array array[current_setting('test.account_a')::uuid, current_setting('test.account_b')::uuid]
  loop
    other_id := case when owner_id = current_setting('test.account_a')::uuid
      then current_setting('test.account_b')::uuid else current_setting('test.account_a')::uuid end;
    perform set_config('request.jwt.claim.sub', owner_id::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
    foreach table_name in array array['profiles', 'travel_records', 'photos']
    loop
      execute format('select count(*) from public.%I where user_id <> $1', table_name) into affected using owner_id;
      if affected <> 0 then raise exception 'Cross-account SELECT on %', table_name; end if;
      execute format('update public.%I set user_id = user_id where user_id = $1', table_name) using owner_id;
      get diagnostics affected = row_count;
      if affected <> 1 then raise exception 'Owner UPDATE failed on %', table_name; end if;
      execute format('delete from public.%I where user_id = $1', table_name) using other_id;
      get diagnostics affected = row_count;
      if affected <> 0 then raise exception 'Cross-account DELETE on %', table_name; end if;
      begin
        execute format('update public.%I set user_id = $1 where user_id = $2', table_name) using other_id, owner_id;
        raise exception 'Owner reassignment allowed on %', table_name;
      exception when insufficient_privilege then null;
      end;
      begin
        execute format('truncate public.%I cascade', table_name);
        raise exception 'TRUNCATE allowed on %', table_name;
      exception when insufficient_privilege then null;
      end;
    end loop;
    begin
      insert into public.travel_records(user_id, place_id, visited_at) values (other_id, 'forged', now());
      raise exception 'Forged INSERT allowed';
    exception when insufficient_privilege then null;
    end;
    -- Own DELETE and cascading metadata cleanup must also work.
    delete from public.travel_records where user_id = owner_id and id = 'rls-smoke-record';
    if exists(select 1 from public.photos where user_id = owner_id) then
      raise exception 'Photo cascade failed';
    end if;
  end loop;
end;
$$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{}', true);
do $$
declare table_name text;
begin
  foreach table_name in array array['profiles', 'travel_records', 'photos']
  loop
    begin
      execute format('select * from public.%I', table_name);
      raise exception 'Anonymous SELECT allowed on %', table_name;
    exception when insufficient_privilege then null;
    end;
  end loop;
end;
$$;
reset role;

-- If the optional auto-RLS event trigger exists, test it after revoking RPC
-- access. The probe table and all grants disappear with the transaction.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    if has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE')
      or has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE') then
      raise exception 'API execution of auto-RLS function is still allowed';
    end if;
    create table public.private_data_rls_smoke_probe(id integer);
    if not (select relrowsecurity from pg_class where oid = 'public.private_data_rls_smoke_probe'::regclass) then
      raise exception 'Auto-RLS trigger no longer works';
    end if;
  end if;
end;
$$;
rollback;
select 'Private data RLS smoke test passed; all test data rolled back' as verification;
