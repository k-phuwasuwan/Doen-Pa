# Security, backup, operations and privacy

Reviewed 2026-10-22. Items marked **owner action** need the dashboard owner;
they were not verified from this repository.

## Review summary

| Severity | Finding | Status |
| --- | --- | --- |
| Critical | Next.js 16.3.4 advisories (RCE in `next/og`, image-optimizer SSRF, cache issues) | Fixed: Next.js 16.3.8 |
| High | `brace-expansion`, `source-map-js` DoS in dev tooling | Fixed with `pnpm-workspace.yaml` overrides |
| High | `braces` DoS (via `eslint-config-next`), no upstream fix | Open, dev-only; CI reports it without failing |
| Medium | No browser security headers | Added `nosniff`, frame denial, referrer and permissions policies, plus a Content-Security-Policy (origins restricted to self, Supabase and Stadia tiles; `'unsafe-inline'` scripts remain because Next hydration data is inline, so a nonce rollout is the next hardening step). Checked for violations on anonymous pages at desktop/mobile; **signed-in flows (uploads, profile) were not checked under the CSP**, run `production-journey` after deploying |
| Medium | Photo EXIF/GPS was uploaded unchanged | Fixed: metadata is stripped in the browser (`strip-metadata.ts`), orientation kept |

Checked and found sound: redirect allowlist, same-origin JSON-only auth
mutations, owner checks in `/api/photos` plus RLS, Storage MIME/size/path rules,
non-enumerating auth messages, `private, no-store` on personal responses, HSTS,
no secrets in tracked files or history.

Known limits: no application-level login rate limit (relies on Supabase Auth
limits); the browser-side EXIF strip is not enforced by the server, so a hand-made
upload still keeps its metadata. Never trust it as the only privacy control.

## Backup and restore

* **Database.** Verify in the Supabase dashboard (Database → Backups) whether the
  plan has daily backups or PITR. **Owner action.** For an independent copy run
  `pnpm exec supabase db dump --linked -f backup.sql` and
  `... --data-only -f data.sql` and store them encrypted off the machine.
* **Photos.** Database backups do not include Storage objects. Copy both private
  buckets with the CLI, e.g. `supabase storage cp -r --linked ss:///travel-photos ./backup/travel-photos`
  (command form not exercised against the hosted project).
* **Restore.** Create a new project, apply `supabase/migrations`, load `data.sql`,
  copy Storage objects back to the same paths (`<user-uuid>/…`), then point Vercel
  env vars at it and update Auth redirect URLs.
* **Drill.** `tests/backup-restore.test.ts` archives a populated local Postgres
  (PGlite), restores it into a fresh instance and checks rows, RLS isolation and
  `delete_my_account`. It runs in `pnpm test`. A hosted dump/restore drill and a
  Storage copy have **not** been performed.

## Operations checklist (owner action)

* Enable 2FA on GitHub, Vercel, Supabase and the sender Gmail; use a dedicated
  sender and keep the App Password only in Supabase SMTP settings.
* Review who is a member of the Vercel team, Supabase organisation and GitHub repo.
* Enable usage/spend alerts in Vercel and Supabase, and Supabase Auth rate limits.
* Logs: application code logs no tokens, passwords or photo bytes; do not add
  request-body logging. Vercel log drains, if added, must exclude cookies.
* **Key incident plan:** publishable key leaked → low impact (RLS), rotate in
  Supabase API settings and redeploy. Admin/secret key or DB password leaked →
  rotate immediately, revoke sessions, review `auth.users` and Storage. Gmail App
  Password leaked → revoke it in Google Account and create a new one. Vercel token
  leaked → delete it, redeploy from a clean commit.

## Privacy decisions (accepted 2026-10-22)

* **Account deletion.** Profile → Edit profile → "ลบบัญชี" asks for the password,
  deletes photo rows and Storage objects, then calls `delete_my_account()`, which
  removes the Auth user; foreign keys cascade profile and records. It is immediate
  and irreversible. Apply migration `20261022120000_delete_own_account.sql` to the
  hosted project before using it.
* **Retention.** Data is kept while the account exists and removed on deletion.
  Hosted database backups may retain deleted data until they expire.
* **GPS in photos.** Location metadata is removed from every new upload. Photos
  uploaded before 2026-10-22 may still contain it; no migration of old files has
  been done.
* A published privacy policy page is still needed before public launch.

## Pre-deploy automation

`.github/workflows/ci.yml` runs the secret scan (`scripts/scan-secrets.mjs`),
production dependency audit, TypeScript, lint, `pnpm test` (including RLS and
isolation tests) and the production build on every push and pull request. Enable
branch protection requiring this check; **owner action**. Browser e2e tests need
real project credentials and stay manual.
