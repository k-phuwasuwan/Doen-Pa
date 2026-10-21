# Repository review and cleanup — 2026-10-22

Review covers project-owned code and the accumulated uncommitted changes on
top of `8037f3f`. Reviewing a file does not require rewriting it: changes below
address a concrete duplication, failure mode, unused path or measured workload.

## Scope

| Area | Reviewed contracts |
| --- | --- |
| `app/`, global CSS and navigation | Routes, guest previews, protected forms, origins/Back destinations, active tabs, loading/error states, glass surfaces and touch targets |
| Auth and account libraries | Verified identities, same-origin mutations, redirect allowlist, cookie propagation, account snapshots, stale reads, upload/commit/cleanup lifecycle |
| Domain, services, hooks and page components | Catalog validation/pagination, archived IDs, search filters, revisits, photo ordering, map selection and personal statistics |
| SQL migrations, seed/import and smoke test | Owner policies and grants, composite ownership, transactional writes, per-record photo limits, retries and preservation of existing IDs |
| Root config and scripts | Next/TypeScript/Tailwind/Playwright configuration, dependency references, temporary compilation, CSV generation and QA credential handling |
| Unit/database/browser tests and helpers | Behavioral assertions, isolated identities, cleanup, mocked failure responses and reproducible race conditions |

Third-party package internals, generated build output and hosted dashboard
settings are outside this code review. SQL review and isolated database tests
do not apply migrations or change the hosted catalog. This is not a dedicated
penetration test or dependency-vulnerability scan.

## Changes

1. **Complete account pagination.** The old loop stopped whenever a response
   contained fewer than 500 rows, so a lower project row cap could truncate
   personal records/photos. `readAccountRows` advances by actual page length
   and checks the exact total. Unexpected early completion fails the load.
   Tests exercise the real Supabase query builder against capped HTTP responses,
   preserving owner filtering and stable ordering. See Supabase's
   [range](https://supabase.com/docs/reference/javascript/range) and
   [select](https://supabase.com/docs/reference/javascript/select) contracts.
2. **Validate account snapshots at one seam.** Profile and record decoders
   validate optional text/images and timestamp types before publication.
   Previously `Date(null)`/`Date(0)` could pass as an epoch date, and malformed
   optional profile fields were unchecked. Invalid reads retain the existing
   snapshot or use the initial error path; they never become empty statistics.
3. **Remove duplicate Auth calls in forms.** Profile and record forms delegate
   identity verification to the account store, which checks before uploading
   and again before committing. This removes one extra `getUser` request per
   submission while preserving write ownership and RLS.
4. **Share navigation behavior.** `NavigationState` owns URL resolution and the
   last resolved fallback for both nav bars. `NAV_LINKS` owns link labels/order;
   the existing origin mapping remains in `activeNav.ts`.
5. **Strengthen QA cleanup.** Account-switching tests track each created account
   inside the cleanup scope, including a partial setup failure. Session fixture
   teardown uses `finally`; record fixtures iterate actual photo entries without
   non-null assertions.
6. **Retain the earlier cleanup/performance work.** Remove unused local snapshot
   code, the unused records hook, obsolete date helpers/skeleton and the unused
   `react-leaflet` dependency. Share display labels and image policies; index
   catalog text once, avoid gallery sorting for map photos, share concurrent
   account refreshes and update selected map icons without replacing markers.
   Benchmark scope and results are recorded in [testing.md](testing.md).
7. **Fix small UI defects found during review.** Six mobile controls now have
   at least 44px touch targets; remove an empty CSS media query. Desktop/mobile
   screenshots and measured bounding boxes were inspected.
8. **Use independent navigation links for stamping.** Search's Stamp action was
   an interactive button nested inside the place link. It is now a sibling link
   with the same position and `returnTo=search` destination. Place Details also
   uses a link for its navigation action. Both disable prefetch, preserving
   on-demand form loading, and support keyboard activation/opening another tab.

Unused-export inspection also checks dynamic imports, benchmark callers and
tests. `ThailandMap`'s dynamic default export, testable decoder/read-model
exports, archived place metadata and shared design-system classes are retained.
Applied migrations are preserved as history rather than rewritten for style.

## Verification

- Unit/database suite: 53 passing cases, including migration/seed/RLS and the
  new account decoder/pagination cases.
- TypeScript with unused-local/parameter checks, ESLint, production build,
  generated-seed check and whitespace checks pass.
- Browser regression suite after the account/navigation refactors: **72/72**
  passed on the local production build, split between desktop and mobile.
- After the final Stamp-link change and rebuild, **22/22** related Search,
  catalog, memories, navigation and Stamp keyboard/Back cases passed. This
  includes two new Stamp cases; the other 20 repeat relevant regression cases.
  Final desktop/mobile navigation and focused Stamp screenshots were inspected.
- The deployed-only terrain journey is excluded from local regression runs;
  local map tests stub terrain tiles. Deployment verification follows the
  local review and is recorded separately in `docs/testing.md`.
