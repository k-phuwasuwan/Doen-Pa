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

Migration `20261020080657_connect_private_storage.sql` is also applied to the
linked project. It creates private `travel-photos` and `profile-photos` buckets,
owner policies and transactional save functions. Profiles, travel records and
photos now persist in Supabase using real email/password Auth; see
[Auth setup](supabase-setup.md). Local import is out of scope by user decision:
there is no local data to migrate. Security Advisors
still report only the existing leaked-password-protection warning.

## Ownership and schema contracts

All three tables reference `auth.users(id)` with `ON DELETE CASCADE`. The
`authenticated` role has only SELECT, INSERT, UPDATE and DELETE grants. Each
table has an owner policy with both `USING` and `WITH CHECK` comparing
`(select auth.uid())` with `user_id`. This covers reads and mutations, including
ownership reassignment. Missing identity sees no rows. `anon` and `PUBLIC` have
no table grants; there are no anonymous policies. TRUNCATE, REFERENCES and
TRIGGER privileges are not granted to either client role.

Trusted administrators and `service_role` can bypass RLS. Use the signed-in
user's client for personal operations; a service-role client would
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
`jpg`, `jpeg`, `png` and `webp`. Travel images use the `travel-photos` bucket and
`record-photos` folder; avatar/cover use `profile-photos` and `profile`. Paths
are unique. Bucket limits enforce MIME types and the respective 5 MiB / 1 MiB
limits. Browser uploads also validate size, type and image decodability.

## Cloud reads, writes and photo lifecycle

`getAuthAccount` verifies the Auth user before loading a paginated account
snapshot through the user's SSR client. `/api/account` repeats this verification
for refreshes; account rows never use an administrative key. `readAccountRows`
advances by the actual number of rows received and checks the reported total,
so a project row cap below 500 cannot silently truncate records or photos.
`decodeAccountData` validates profile fields, owner IDs, private-photo paths,
ratings and string timestamps before publishing a snapshot. `AuthProvider`
publishes the snapshot through `createAccountStore`. Cross-tab signals carry
only an account UUID and nonce; focus/visibility also refresh data from Supabase.
Concurrent background triggers share one in-flight read for the current account
data revision. A cross-tab change or a write response advances that revision,
so a post-change read cannot reuse a pre-change response. An older read cannot
replace a confirmed snapshot or clear a newer request from the in-flight slot;
only the latest trigger updates the refresh error notice. Both successful and
failed requests release their slot so later refreshes can retry.
Failed refreshes retain the previous snapshot with a retry notice; initial
failures show the global error screen rather than empty personal statistics.

Uploads use new UUID paths with `upsert: false`. Storage permits owner reads,
owner inserts into the expected folder and deletion of unreferenced objects;
ordinary clients cannot overwrite uploaded bytes or delete referenced objects.
The account store verifies the current Auth identity before uploads and again
before committing metadata; Profile and record forms delegate to this check
instead of making an additional duplicate Auth request.
`save_travel_record` inserts the record and photo metadata in one transaction,
using `(user_id, id)` for idempotent submissions. `save_account_profile` commits
profile text and replacement photo metadata together, serializing replacements
on the profile row and retaining images omitted from the payload. Both functions
run as SECURITY INVOKER and derive ownership from `auth.uid()`.
`attach_account_photo` checks the private object's path, size and MIME metadata
before attaching it. Direct table clients remain subject to the existing RLS
and schema constraints; the application uses these RPCs for atomic saves.

After confirmed profile replacement, the client removes obsolete bytes. Failed
mutations attempt cleanup only after verifying that each uploaded path is not
referenced. Ambiguous record responses are checked against cloud data; retrying
the same form reuses the submission ID and removes unused retry uploads. Failed
cleanup can leave private orphan bytes; scheduled reclamation is not implemented.
Local originals remain untouched, including both account-v1 keys.

Images are delivered by `/api/photos/[id]?owner=<uuid>`, which verifies the
JWT locally with `getClaims`, matches the requested owner and reads the metadata
and Storage bytes through RLS. Photo IDs never change bytes, so successful
responses use `private, max-age=31536000, immutable` and `nosniff`; a response
that also refreshes session cookies stays `private, no-store`. Login, logout,
account deletion and password reset send `Clear-Site-Data: "cache"` so cached
photos do not survive an account switch on a shared browser. Guests,
other owners and missing images receive 404. Personal Next Images use
`unoptimized` to avoid an image optimizer cache of authenticated content. No
public URLs or reusable bearer links are exposed by this delivery route.

Account-scoped text IDs preserve record identities independently in each account.
No local import flow is planned; manual local testing uses existing accounts and
creates new data directly in their cloud storage. Legacy local keys remain
untouched.

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

Browser tests exercise real login/logout, confirmation/recovery tokens, SSR
refresh and authenticated Data API isolation. Cloud tests additionally cover
private Storage access, cross-browser reads and failure/retry cleanup; see
[testing](testing.md). The user confirmed real Gmail delivery and real-device
checks on 2026-10-22; see [Auth setup](supabase-setup.md#production-url-and-email-delivery--2026-10-22)
and [production acceptance](testing.md#production-acceptance--2026-10-22) for the
recorded verification scope.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[user data](https://supabase.com/docs/guides/auth/managing-user-data),
[private Storage](https://supabase.com/docs/guides/storage/serving/downloads).
