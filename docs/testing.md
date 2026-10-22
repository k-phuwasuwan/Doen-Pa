# Verification

## Local checks

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm lint
git diff --check
pnpm build
```

`pnpm test` runs the read-model, image-import, session and place-database tests with Node's test runner. TypeScript compilation goes into a temporary directory and is removed when the command completes. The place-database tests require Python 3 to check generated files and use test-only PGlite to execute Postgres migrations, seed imports and RLS checks in memory; they do not connect to Supabase or need Docker. See [catalog verification](places-backend.md#automated-verification) for coverage and hosted verification limits.

Private-data database tests apply the full migration history with simulated
Supabase roles and `auth.uid()`. They check two-account isolation, ownership
forgery/reassignment, photo/record ownership, anonymous access, metadata limits,
repeated record upserts, revisits, cascades and the auto-RLS trigger. They also
validate the administrator-only hosted smoke script and its rollback. To run
that script against the linked project, follow
[private-data verification](private-data-backend.md#apply-and-verify). Database
role tests do not validate Auth signup, real JWTs/cookies or Storage objects.

`account-rows.test.ts` uses the real Supabase query builder with an in-memory
HTTP adapter to check owner filters, stable ordering, pagination through a
smaller project row cap, empty accounts and failed/incomplete responses.
`account-data.test.ts` checks account identity, optional profile fields, photo
paths, ratings and timestamp decoding; malformed values fail rather than
appearing as valid memories or zero progress. Neither test contacts Supabase.

## Logic performance checks

Run `pnpm bench:logic` for repeatable Search, Map photo-selection and Profile
gallery workloads against the reviewed 156-place catalog and synthetic personal
records. It reports median batch times after seven warmups and 25 samples;
Search reuses one prebuilt catalog, while Map/Profile include creating a fresh
read model. Run it separately from builds
and other CPU-heavy checks. This measures Node computation only, not network,
image decoding, React rendering or total page-load time.

On 2026-10-22, an interleaved comparison in one Node 22.21.1 process against the
pre-optimization worktree produced equal checksums and these median batch times:

| Workload | Batch | Before | After |
| --- | --- | --- | --- |
| Search over 156 places | 1,000 queries | 33.273 ms | 3.470 ms |
| Map photo selection with 10,000 records | 20 fresh models, selecting every visited place | 25.352 ms | 10.063 ms |
| Profile gallery with 10,000 records | 20 fresh models | 40.740 ms | 20.085 ms |

Records in this fixture have two photos every fifth record. Results vary by
hardware, record distribution and photo density. Search precomputes normalized
text for an immutable catalog snapshot; Map uses `getMapPhoto` without sorting
the gallery; Profile sorts only records containing photos. Unit tests cover
search equivalence and fresh catalog snapshots, map date ties and photo-less
visits, account isolation, and matching Profile/Place gallery positions.

## Browser regression tests

Auth email template checks on 2026-10-23 rendered confirmation and recovery
HTML at 640 px and 390 px using installed Chromium (Browser plugin not
available). All four previews retained their action/fallback URL, had action
targets above 44 px, wrapped long URLs without horizontal overflow and
followed the button to a stubbed destination without browser errors. Hosted
subjects/bodies were saved through Supabase's Dashboard. These checks do not
send email, verify Gmail rendering/dark mode/spam placement, or consume real
Auth tokens. The new templates still need a real-inbox signup/resend/recovery
check; the earlier SMTP acceptance below predates this template update.

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
- First-login and email-confirmation profile setup without Back/Cancel,
  optional avatar upload, persisted completion, Search after saving, subsequent
  login to Search and normal profile editing with Back/Cancel
  (`profile-setup.spec.ts`, isolated accounts and real tokens, no email sent).
- Revisits, six photos across two records, Profile photo selection, lightbox and Passport read-only details.
- Corrupt legacy local data and storage clear leave cloud memories intact.
- Latest avatar selection, independent cover reads, and save disabled while reading.
- Avatar replacement removes old bytes, retains the cover and updates another open editor.
- Delayed background reads cannot overwrite a confirmed profile save.
- Concurrent focus/visibility triggers share one account request; failed reads
  keep the current snapshot and can retry. Cross-tab changes and record saves
  start a newer read even while an earlier response is held. Older data and
  errors cannot replace the newer result (`account-refresh.spec.ts`).
- Map selection retains existing marker elements and keyboard focus. Click,
  Enter and Space select pins and closing details clears selection
  (`map-selection.spec.ts`, terrain tiles stubbed).
- Both navigation bars retain the origin tab on nested Place Details and
  preserve explicit guest previews during navigation and Back
  (`navigation.spec.ts`). Stamp links support keyboard activation and preserve
  Search versus Place Details Back destinations, including Back from Login
  after logged-out stamping, Login resuming the stamp form and successful
  submission opening Passport (`stamp-navigation.spec.ts`).
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

The catalog and map-selection tests stub terrain tile images to isolate visited-pin behavior;
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

The mobile project emulates Chromium. It does not establish Safari/WebKit or
Firefox coverage. The catalog map test stubs tiles; the explicit production
journey below checks real deployed terrain responses.

The Auth rollout's rendered QA used regular Playwright because the Browser
plugin was not available in the session. Desktop (1440 × 1000) and mobile
(390 × 844) screenshots and real interactions were inspected.

## Production acceptance — 2026-10-22

- Production URL: `https://doen-pa.vercel.app`, Vercel deployment for commit
  `6c7578e` confirmed successful through its GitHub commit status.
- User-confirmed: real Gmail inbox delivery for signup/confirmation, resend
  and password recovery passed. Automated tests do not send email.
- User-confirmed: real-device mobile checks passed. Device models and browser
  versions were not recorded; this does not imply all mobile browsers passed.
- Agent-verified: the deployed production journey and profile-setup tests passed
  **6/6 cases**, using Chromium at 1440 × 1000 and 390 × 844. New-account setup,
  real photo uploads, saved dates/ratings, Passport and lightbox, real terrain
  responses without 401/403, visited pins, Stats/Profile, logout and private-photo
  denial, and fresh-browser persistence passed. Temporary accounts and their
  Storage objects were cleaned up after each case.
- The complete journey was then rechecked **2/2 cases** with loaded Passport
  photo bytes, all terrain tile images loaded, and console-error checks in the
  fresh browser context before recording final screenshots.

Run the deployed journey explicitly:

```sh
PLAYWRIGHT_BASE_URL=https://doen-pa.vercel.app PLAYWRIGHT_PRODUCTION=1 \
  pnpm exec playwright test tests/e2e/production-journey.spec.ts tests/e2e/profile-setup.spec.ts --workers=1
```

`production-journey.spec.ts` runs only when `PLAYWRIGHT_PRODUCTION=1`. It uses a
temporary confirmed account, ordinary UI login and profile setup, Search and
Place Details, a dated record with two uploaded photos and a personal rating,
Passport/gallery/lightbox, real Stadia terrain and its visited pin, Stats,
Profile, logout/private-photo denial, and persistence after login in a fresh
browser context. It does not stub map tiles or send signup email. Temporary
Storage objects and the account are removed in `finally`; no user memories or
catalog rows are modified. The companion profile-setup tests exercise genuine
email-confirmation tokens and retry after a simulated completion failure.

After full-document login, tests wait for the new page's scripts to finish
loading and assert live profile-preview updates before saving. Place Details
checks assert the destination URL and its level-one heading, so a matching
Search card heading cannot make the test advance before navigation finishes.

Screenshots are saved outside the repository under
`/tmp/doen-pa-production-{passport,map,stats,profile}-{desktop,mobile}.png`.

### Post-refactor deployment verification — 2026-10-22

- Runtime commit: `b7e1c520c6f864aee0b27f8db0d24d0d155d6f97`, including the
  preceding cleanup/performance and account/navigation commits. Its Vercel
  deployment completed successfully before testing the production alias
  `https://doen-pa.vercel.app`.
- **24/24 browser cases passed** in Chromium at desktop 1440 × 1000 and mobile
  390 × 844, using `PLAYWRIGHT_PRODUCTION=1` and two workers.
- Suites: `production-journey`, `profile-setup`, `navigation`,
  `stamp-navigation`, `search-filters`, `account-refresh` and `map-selection`.
  They verify new-account setup, real private-photo uploads and delivery,
  dated/rated memories, Passport/lightbox, Stats/Profile, logout access denial,
  fresh-browser persistence, keyboard stamping and Back destinations, active
  tabs/guest previews, client filters, shared refreshes and stale-response races.
- The complete production journey used real Stadia terrain responses and loaded
  image bytes; no terrain 401/403 or unexpected browser errors were observed.
  The separate marker-interaction suite stubs terrain to isolate selection and
  keyboard focus. Desktop/mobile Passport, Map, Stats and Profile screenshots
  were visually inspected.
- Temporary accounts and their uploads were removed by test cleanup. No catalog
  changes or migrations were applied. This run did not send SMTP email or repeat
  the user's earlier physical-device tests.
