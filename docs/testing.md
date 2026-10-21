# Verification

## Local checks

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm lint
git diff --check
pnpm build
```

`pnpm test` runs the read-model, storage-snapshot, image-import, session and place-database tests with Node's test runner. TypeScript compilation goes into a temporary directory and is removed when the command completes. The place-database tests require Python 3 to check generated files and use test-only PGlite to execute Postgres migrations, seed imports and RLS checks in memory; they do not connect to Supabase or need Docker. See [catalog verification](places-backend.md#automated-verification) for coverage and hosted verification limits.

Private-data database tests apply the full migration history with simulated
Supabase roles and `auth.uid()`. They check two-account isolation, ownership
forgery/reassignment, photo/record ownership, anonymous access, metadata limits,
repeated record upserts, revisits, cascades and the auto-RLS trigger. They also
validate the administrator-only hosted smoke script and its rollback. To run
that script against the linked project, follow
[private-data verification](private-data-backend.md#apply-and-verify). Database
role tests do not validate Auth signup, real JWTs/cookies or Storage objects.

## Browser regression tests

First-time setup:

```sh
pnpm install
pnpm exec playwright install chromium
```

Run the suite:

```sh
pnpm test:e2e
```

The suite runs Chromium at desktop (1440 × 1000) and mobile (390 × 844) sizes. It reuses an existing server at `http://localhost:3000`; otherwise Playwright starts `pnpm dev` and stops that server after testing. CI requires a free port 3000. This follows Playwright's [web server configuration](https://playwright.dev/docs/test-webserver).

The running server needs the Supabase environment settings and the reviewed
156-place seed described in [catalog setup](places-backend.md). Browser tests
also require `.local/auth-test-accounts.json`. Create it once with Node 22+ and
the authenticated, linked CLI:

```sh
node scripts/setup-auth-test-users.mjs
```

The human-readable credentials are in `.local/auth-test-accounts.md`; both files
are ignored by Git and owner-readable only. Login uses email, not profile username.
Signed-in fixtures create a fresh temporary account and session for each test.
Tests read the catalog through the app server and write profile/record data to
the real account's Supabase tables and private Storage. Cleanup removes its
objects before deleting the account; cascading deletes remove its metadata.
Reusable QA accounts remain for manual login and targeted Auth checks. Auth RLS
tests write uniquely named temporary database records and remove them afterward.
Email-flow tests use an administrative key read into memory through the linked
CLI, create temporary Auth users/tokens, and delete those users in cleanup. These
tests do not modify the hosted catalog or send email. They do not prove SMTP
delivery or production-domain configuration. Unit
tests cover public catalog response decoding, pagination through project row
caps, empty tables, unavailable/invalid responses, and legacy ID resolution.

Each test gets an isolated browser context and cloud identity. Test profile edits
and travel records do not affect a developer's account. Two pages inside a
context exercise cross-tab change signals; an additional fresh context verifies
that cloud data is independent of browser storage.

Covered journeys:

- Guest screens, protected forms and a signed-in account's empty personal pages.
- Guest personal pages omit the extra Search link. Signup/recovery omit the
  duplicate Login footer and email-send success notices while retaining errors
  and resend (`auth-screens.spec.ts`, mocked email responses, no email sent).
- Real login, reload persistence, expired-session refresh, logout across tabs,
  account switching, preserved legacy local data and permitted return destinations.
- Confirmation/recovery with real single-use Auth tokens, rejected unconfirmed
  login, changed passwords, and ownership enforced through two real JWTs.
- Revisits, six photos across two records, Profile photo selection, lightbox and Passport read-only details.
- Corrupt legacy local data and storage clear leave cloud memories intact.
- Latest avatar selection, independent cover reads, and save disabled while reading.
- Avatar replacement removes old bytes, retains the cover and updates another open editor.
- Delayed background reads cannot overwrite a confirmed profile save.
- Photo removal and alt edits during a pending read, then save and cross-tab Passport update.
- Profile/record file limits and maximum five photos per record.
- Failed cloud writes retain drafts without publishing unsaved data.
- Fresh-browser persistence, private image delivery and logout access revocation.
- Two real accounts cannot read, overwrite or delete each other's Storage objects.
- Partial upload cleanup and idempotent retry after a lost commit response.
- Catalog search, category counts, missing measurements, old record references,
  404s, invalid stamp redirects and deduplicated visited pins on the map.
- Search filters and text search work while subsequent Search server responses
  are held; selection, result counts, Back/Forward and reload retain URL state
  on desktop and mobile (`search-filters.spec.ts`, anonymous, no QA account).

The map catalog test stubs terrain tile images to isolate visited-pin behavior;
it preserves and checks attribution but does not validate Stadia credentials.

Held image reads are released explicitly by tests; race checks do not depend on arbitrary sleep durations. Browser console errors and uncaught page errors fail the test.

Artifacts are ignored by git: `playwright-report/` and `test-results/`. Traces are
disabled because real Auth request bodies contain QA passwords. Failure
screenshots are retained, and the file-limit test records the form for each
viewport. Auth screenshots used for visual QA are saved under `/tmp/doen-pa-auth-*`.
Open the report with `pnpm exec playwright show-report`.

For an already-running production build on a separate local port:

```sh
pnpm build
pnpm exec next start --port 3001
# In another terminal:
PLAYWRIGHT_BASE_URL=http://localhost:3001 PLAYWRIGHT_PRODUCTION=1 pnpm exec playwright test tests/e2e/auth.spec.ts tests/e2e/auth-email.spec.ts
```

`PLAYWRIGHT_PRODUCTION=1` checks the production `no-store` page headers. Next's
dev server overrides page headers with `no-cache, must-revalidate`; Auth JSON
and callback handlers independently require `private, no-store` in both modes.

The mobile project emulates Chromium. This suite does not validate Safari/WebKit, Firefox, or deployed map tile credentials.

The Auth rollout's rendered QA used regular Playwright because the Browser
plugin was not available in the session. Desktop (1440 × 1000) and mobile
(390 × 844) screenshots and real interactions were inspected.
