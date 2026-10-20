-- Immutable uploads go directly to private Storage; metadata commits atomically.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('travel-photos', 'travel-photos', false, 5242880, array['image/jpeg','image/png','image/webp']),
       ('profile-photos', 'profile-photos', false, 1048576, array['image/jpeg','image/png','image/webp']);

create policy account_photo_read on storage.objects for select to authenticated
using (bucket_id in ('travel-photos','profile-photos') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy account_photo_upload on storage.objects for insert to authenticated
with check (
  name ~ ('^' || (select auth.uid())::text || '/' ||
    case bucket_id when 'travel-photos' then 'record-photos' when 'profile-photos' then 'profile' else 'INVALID' end ||
    '/[a-zA-Z0-9_-]+[.](jpg|jpeg|png|webp)$')
  and bucket_id in ('travel-photos','profile-photos')
);
-- A referenced object cannot be removed through the ordinary Storage API.
-- Commit metadata replacement/deletion before removing obsolete bytes.
create policy account_photo_cleanup on storage.objects for delete to authenticated
using (
  bucket_id in ('travel-photos','profile-photos') and (storage.foldername(name))[1] = (select auth.uid())::text
  and not exists (select 1 from public.photos p where p.user_id = (select auth.uid()) and p.object_path = name)
);

create function public.attach_account_photo(p_photo jsonb, p_kind text, p_record_id text default null, p_position integer default 0)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_bucket text := case when p_kind = 'travel' then 'travel-photos' else 'profile-photos' end;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if not exists (
    select 1 from storage.objects o where o.bucket_id = v_bucket and o.name = p_photo->>'object_path'
      and (storage.foldername(o.name))[1] = v_uid::text
      and (o.metadata->>'size')::bigint = (p_photo->>'size_bytes')::bigint
      and o.metadata->>'mimetype' = p_photo->>'mime_type'
  ) then raise exception 'Uploaded photo not found or metadata mismatch' using errcode = '23514'; end if;
  insert into public.photos(user_id,id,kind,travel_record_id,position,object_path,mime_type,size_bytes)
  values(v_uid,p_photo->>'id',p_kind,p_record_id,p_position,p_photo->>'object_path',p_photo->>'mime_type',(p_photo->>'size_bytes')::integer);
end;
$$;

create function public.save_travel_record(p_record jsonb, p_photos jsonb default '[]'::jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_photo jsonb; v_position integer := 0;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if jsonb_typeof(p_photos) <> 'array' or jsonb_array_length(p_photos) > 5 then
    raise exception 'At most five photos' using errcode = '23514';
  end if;
  -- Same submission ID is idempotent, including after a lost response.
  insert into public.travel_records(user_id,id,place_id,visited_at,note,rating)
  values(v_uid,p_record->>'id',p_record->>'place_id',(p_record->>'visited_at')::timestamptz,
    coalesce(p_record->>'note',''),coalesce((p_record->>'rating')::smallint,0))
  on conflict (user_id,id) do nothing;
  if not found then return; end if;
  for v_photo in select value from jsonb_array_elements(p_photos) loop
    perform public.attach_account_photo(v_photo,'travel',p_record->>'id',v_position);
    v_position := v_position + 1;
  end loop;
end;
$$;

create function public.save_account_profile(p_profile jsonb, p_photos jsonb default '[]'::jsonb)
returns text[] language plpgsql security invoker set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_photo jsonb; v_old text; v_obsolete text[] := '{}';
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if jsonb_typeof(p_photos) <> 'array' or jsonb_array_length(p_photos) > 2 then
    raise exception 'Invalid profile photos' using errcode = '23514';
  end if;
  insert into public.profiles(user_id,name,username,bio)
  values(v_uid,p_profile->>'name',p_profile->>'username',coalesce(p_profile->>'bio',''))
  on conflict(user_id) do update set name=excluded.name, username=excluded.username, bio=excluded.bio;
  -- Serialize replacements for this account; retain images omitted from payload.
  for v_photo in select value from jsonb_array_elements(p_photos) loop
    if v_photo->>'kind' not in ('avatar','cover') or v_photo->>'kind' is null then
      raise exception 'Invalid photo kind' using errcode = '23514';
    end if;
    delete from public.photos where user_id=v_uid and kind=v_photo->>'kind' returning object_path into v_old;
    if v_old is not null then v_obsolete := array_append(v_obsolete,v_old); end if;
    perform public.attach_account_photo(v_photo,v_photo->>'kind');
  end loop;
  return v_obsolete;
end;
$$;
revoke all on function public.attach_account_photo(jsonb,text,text,integer), public.save_travel_record(jsonb,jsonb), public.save_account_profile(jsonb,jsonb) from public, anon;
grant execute on function public.attach_account_photo(jsonb,text,text,integer), public.save_travel_record(jsonb,jsonb), public.save_account_profile(jsonb,jsonb) to authenticated;
