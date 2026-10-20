# Private account data in Supabase

## Rollout status — 2026-10-20

Migration `20261020063556_create_private_user_data.sql` is applied to the linked
`doen-pa` project. It creates `profiles`, `travel_records`, and `photos` with
owner-only RLS. The hosted two-account SQL smoke test passed and rolled back all
test identities and data. Those tables were empty after that rollout; the public
catalog still contains 156 places. The subsequent Auth implementation adds two
reusable QA accounts and their profiles without sample travel records or photos.
Temporary email-flow accounts are deleted after testing.

Security Advisors returned no findings immediately after the database deployment.
The subsequent Auth account setup reports a leaked-password-protection warning
on the current Free plan; see [Auth setup](supabase-setup.md#current-auth-behavior).
The earlier `rls_auto_enable()` warnings remain resolved. Performance Advisors
reported only INFO notices for newly created, unused query/FK indexes; keep
these indexes for account-scoped queries and cascading record deletion.

This migration supplies the database foundation. Real email/password Auth is now
implemented; see [Auth setup](supabase-setup.md). Initial profile text comes from
`profiles`; profile edits and travel records remain in account-scoped browser
storage. Cloud saves, Storage and local import remain deferred.

## Ownership and schema contracts

All three tables reference `auth.users(id)` with `ON DELETE CASCADE`. The
`authenticated` role has only SELECT, INSERT, UPDATE and DELETE grants. Each
table has an owner policy with both `USING` and `WITH CHECK` comparing
`(select auth.uid())` with `user_id`. This covers reads and mutations, including
ownership reassignment. Missing identity sees no rows. `anon` and `PUBLIC` have
no table grants; there are no anonymous policies. TRUNCATE, REFERENCES and
TRIGGER privileges are not granted to either client role.

Trusted administrators and `service_role` can bypass RLS. Use the signed-in
user's SSR client for future personal operations; a service-role client would
remove these ownership checks. Never put an administrative key in browser code.

- `profiles`: one row per Auth user; name, username, bio and creation time.
  Validation matches the current profile editor. Username remains a private
  display field and is not globally unique. No email or authentication secrets
  are duplicated here. Login and email callbacks initialize a missing profile
  through the user's RLS-protected client, ignoring conflicts to preserve existing
  values. This migration installs no signup trigger.
- `travel_records`: primary key `(user_id, id)`, preserving existing text record
  IDs independently in each account. `place_id` is text without a catalog foreign
  key so archived/unknown memories survive imports and catalog edits. Resolving
  aliases, rendering archived metadata and excluding them from park credit remain
  read-model responsibilities. `visited_at` and `created_at` are timestamps with
  time zone. Rating is 0–5, where 0 preserves the current unrated representation.
  Revisits are separate rows with distinct IDs, not unique by place.
- `photos`: primary key `(user_id, id)` and a `kind` of `travel`, `avatar` or
  `cover`. Stores only object path, MIME type, byte size, ordering and creation
  time. The composite foreign key `(user_id, travel_record_id)` ensures a travel
  photo belongs to a record owned by the same account. Deleting a record removes
  its photo metadata. Avatar/cover rows have no record ID; each account can have
  one current image of each kind. Profile images are resolved from this table by
  owner and kind, rather than duplicating their paths in `profiles`.

Travel photos occupy unique positions 0–4 per record. This enforces five photos
even under concurrent inserts, while allowing more than five photos across
revisits. Metadata permits JPG, PNG and WebP, with at most 5 MiB per travel image
and 1 MiB per profile image. Alt text remains unpersisted, matching the current
model. No public photo URLs, data URLs or signed URLs belong in these tables.

Object paths must be owned by the row's user:

```text
<auth-user-uuid>/record-photos/<file-id>.jpg
<auth-user-uuid>/profile/<file-id>.webp
```

File IDs accept ASCII letters, numbers, `_` and `-`; supported extensions are
`jpg`, `jpeg`, `png` and `webp`. Travel images use `record-photos`; avatar/cover
use `profile`. Paths are unique. These are schema contracts for a future private
bucket, not proof that an object exists or that the bytes match the metadata.
The upload integration must independently validate files and enforce Storage
bucket limits and owner policies. Deleting metadata does not delete Storage
bytes; later cloud mutations need an explicit upload/cleanup lifecycle.

Account-scoped text IDs allow a future importer to use `(user_id, id)` as a
conflict target without changing local source IDs. An importer still needs to
choose the destination account, assign stable photo IDs/paths, report partial
failures and preserve local originals. This schema alone is not an import flow.

## Existing auto-RLS warning

The hosted `public.rls_auto_enable()` is a SECURITY DEFINER event-trigger
function with `search_path = pg_catalog`, called by `ensure_rls` after new table
creation. It previously inherited EXECUTE through PUBLIC and also had explicit
API-role grants. The migration revokes EXECUTE from PUBLIC, `anon`,
`authenticated` and `service_role`, preserving the function and event trigger.
The block is conditional because fresh installations may not have that optional
dashboard-created function. Migrations explicitly enable RLS regardless.

Both prior advisor warnings are resolved: [anonymous execution warning](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
and [authenticated execution warning](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
The hosted rollback test also confirms that new public tables still receive
automatic RLS after direct API execution has been revoked.

## Apply and verify

Use the authenticated CLI already linked to the intended project. Review the
dry run before applying; this migration neither seeds nor imports personal data.

```sh
pnpm exec supabase db push --linked --dry-run --skip-vault
pnpm exec supabase db push --linked --skip-vault
pnpm exec supabase db query --linked --file supabase/tests/private_user_data.sql
```

The smoke script requires an administrator. It inserts two random Auth identity
rows within one transaction, switches to the real `authenticated` and `anon`
roles, tests ownership and the existing auto-RLS trigger, then rolls back all
test data and the probe table. Success returns an explicit verification message.
An error is a failed check, not a pass; do not run fragments manually or commit
the test transaction. This is a database RLS test, not an Auth signup/login test.

`pnpm test` also runs the entire migration history in isolated PGlite, including
the smoke script. It covers cross-account reads/writes, forged owners,
reassignment, cross-owner record/photo references, anonymous and missing
identity, repeated record upserts, revisits, five-photo slots, MIME/size/path
validation, cascades, and auto-RLS execution revocation. See [testing](testing.md).

Auth browser tests now exercise real login/logout, confirmation/recovery tokens,
SSR refresh and authenticated Data API isolation. SMTP delivery, Storage access
and production-domain configuration still require separate verification.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[user data](https://supabase.com/docs/guides/auth/managing-user-data),
[private Storage](https://supabase.com/docs/guides/storage/serving/downloads).
