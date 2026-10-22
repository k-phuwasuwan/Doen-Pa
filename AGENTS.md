# 🥾 Doen Pa — AGENTS.md

## Purpose and working agreement

Doen Pa is a personal Digital Hiking Passport for Thai hikers: **document the journey, not plan the journey**. The core flow is search for a place → stamp a visit by creating a travel record → view memories in the Passport, Place Details, Map, Stats, and Profile.

When product scope, design direction, or data modeling is genuinely ambiguous, ask the user before choosing. Use the latest user decision over older mockups or this document. For implementation details already settled in code and prior decisions, continue without repeating permission requests. Do not silently turn the app into a planner, booking product, or public review network.

This file describes the **current implementation and accepted behavior**, not a promise that every older mockup element has been built. When it differs from the code, inspect the relevant component and recent commits before changing either one.

## Current stack and repository

- Next.js **16.3.4** App Router, React **19**, TypeScript strict mode, Tailwind CSS **4**, Lucide React, Leaflet 1.9 (used directly); package manager **pnpm**.
- Fonts: Kanit and Plus Jakarta Sans are bundled under `public/fonts/` and declared in `app/globals.css`; the production build uses Webpack so it does not fetch Google Fonts during compilation.
- Pages and global CSS live in root-level `app/`; components, services, data, types, and hooks live in `src/`. Do not create a second `src/app/`.
- State uses React hooks, URL query parameters and `useSyncExternalStore` over verified Supabase account snapshots. localStorage carries cross-tab change signals only. **Zustand is not installed**; do not assume a store layer exists.
- Source of truth for types: `src/types/index.ts`; for design tokens/effects: `app/globals.css` and `tailwind.config.ts`; for the running place catalog: Supabase `public.places`, read through `src/services/place.service.ts`.
- The app starts **logged out**. Supabase SSR implements email/password signup, confirmation, login, recovery and logout. New accounts start with zero memories. Profiles and travel records persist in Supabase; photos use private Storage with owner-only access. Google login remains deferred. Never reintroduce seeded personal records or sample user photos.

- Production runs on **Vercel** at **`https://doen-pa.vercel.app`**; no purchased custom domain is required. Recheck Supabase Auth Site URL and allowed redirect URLs whenever the deployment domain changes. Production acceptance results are recorded in [docs/testing.md](docs/testing.md).
- Auth email uses **Gmail SMTP** with a dedicated sender, 2-Step Verification and an App Password stored only in Supabase's custom SMTP settings. On **2026-10-22**, the user confirmed real-inbox signup/confirmation, resend and password-recovery checks passed. Keep the App Password out of source control and browser code; automated token tests do not themselves prove email delivery.

## Routes and navigation

| Route | Current behavior |
|---|---|
| `/` | Redirects to `/search`. |
| `/search` | Search, category cards, visited filter, place cards. |
| `/places/[id]` | Full Place Details page. Missing IDs call `notFound()`. |
| `/records/new?placeId=[id]` | Requires real authentication and preserves stamp intent through Login for returning users. First-time profile setup ends at Search. Missing place redirects to Search; authenticated invalid places do too. |
| `/map` | Full-viewport visited-place terrain map. |
| `/passport` | Account's Passport and travel-record cards, initially empty; logged-out visitors see the guest screen. |
| `/passport?view=guest` | Optional guest design preview; this parameter is not a security boundary. |
| `/signup` | Email/password signup and resend; no email-send success notice or extra Login footer link. |
| `/forgot-password` | Request a password recovery link; no email-send success notice or extra Login footer link. |
| `/reset-password` | Requires a verified session; sets a new password, signs out the current session and returns to Login. |
| `/login` | Real email/password login. Normal login ends at Search; explicit `next` accepts allowed app destinations only. Legacy `from` controls Back, not the login destination. Newly registered users with pending profile setup open `/profile/edit` first and reach Search after saving. Returning users skip setup. |
| `/auth/delete-account` | POST only: password re-check, deletes photo rows and Storage objects, then `delete_my_account()` removes the Auth user. Shown as "ลบบัญชี" on `/profile/edit` (not during setup). |
| `/stats` | Personal travel statistics by province, place type, and region. Badge UI is deferred. |
| `/stats?view=guest` | Optional guest Stats preview with Login; anonymous `/stats` shows the same guest screen. |
| `/profile` | Personal profile and photo gallery. |
| `/profile/edit` | Requires authentication; edit the account's display name, username, bio, avatar and cover with a live preview. Pending first-time setup starts with blank name/username defaults, has no Back or Cancel link, and saves to Search; photos are optional. Later edits retain Back/Cancel and save to Profile. Changes save to the account in Supabase. |
| `/profile?view=guest` | Optional guest Profile preview with Login; anonymous `/profile` shows the same guest screen. |

Place Details receives an explicit origin when needed:

- Search opens `/places/[id]`: Back → `/search`; the Search nav item remains active; stamping is available.
- Passport cards open `/places/[id]?from=passport`: Back → `/passport`; the Passport nav item remains active; **read-only**, so no Stamp button.
- Profile photos open `/places/[id]?from=profile&photo=[index]` at the selected image: Back → `/profile`; the Profile nav item remains active.
- `src/components/navigation/activeNav.ts` owns shared links and active-tab mapping for TopNav and BottomNav; `NavigationState` preserves their last resolved tab and guest state during URL suspension. Preserve a visible active tab on nested pages and during client navigation.
- Logged-out users and `?view=guest` previews see the Login link. Navigation preserves explicit `view=guest`; server authentication and RLS enforce access independently.
- Signed-in TopNav reads the account-scoped profile through `useCurrentUser`. Do not hardcode a sample person's name or avatar.
- `BackButton` uses an explicit href, never browser history. In the record form and its logged-out Login redirect, `returnTo=search` returns to Search; otherwise Back returns to the place page. Login preserves the record-form destination in `next` independently of Back; a successful record submission redirects to Passport.

Do not add a dialog version of Place Details. The map's selected-place card is display-only and does not navigate.

## Data and persistence

`Place` has `id`, `name`, `location`, `province`, `region`, `description`, `type`, optional coordinates, altitude and distance. `type` is one of the four Search categories; `isNationalPark` separately marks park membership for statistics. The place catalog has **no sample image URLs**. `TravelRecord` has `userId`, `placeId`, `visitedAt`, `note`, `photos: string[]`, personal `rating`, and `createdAt`. Use the actual interfaces in `src/types/index.ts`; older fields such as `image`, `category`, `rankLabel`, `difficulty`, `guidelines`, `season`, and `camping` are **not in the current Place model**.

`getPlaceCatalog()` is server-only and shares one Supabase snapshot within a request using React `cache`. Its loader uses the publishable key, `no-store`, pagination and runtime validation. `CatalogContent` passes successful results through `PlaceCatalogProvider`; `useTravelRecordReadModel` combines that catalog with the account's cloud records for client views and resolves legacy place aliases without rewriting saved IDs. A failed catalog request shows a retry panel, not empty personal statistics. There is no local catalog fallback. Login, Profile editing and guest Passport/Stats/Profile previews do not require catalog reads.

`data/national-parks-156.csv` is the reviewed import source. `pnpm import:places` generates only `supabase/seed.sql`; applying the seed updates the database. `--json` supplies offline tests and benchmarks. The generated application catalog `src/data/places.ts` has been removed. Preserve existing text IDs, the alias in `src/data/place-identities.ts`, and history-only metadata in `src/data/archived-places.ts` so old memories remain readable without adding searchable places or park credit. Before changing catalog loading, imports, database permissions or deployment, read [docs/places-backend.md](docs/places-backend.md).

`getAuthAccount` verifies Auth before loading the account's profile, records and photo metadata with the user's SSR client. Account reads paginate by the actual response length and reported total; a project row cap must never truncate personal data. Network snapshots validate optional profile fields and string timestamps before publication. The account store verifies the current identity before uploads and metadata writes; forms delegate to it without a duplicate Auth request. `AuthProvider` owns `createAccountStore` from `src/lib/account/browser.ts`; hooks subscribe to its in-memory snapshots. `/api/account` refreshes on cross-tab change signals, window focus and visibility. Concurrent background refreshes share one request per account-data revision. Cross-tab changes use `refresh({ afterChange: true })`; confirmed profile writes and record-write responses invalidate older reads so post-write refreshes never join pre-write requests. Only the latest refresh updates the retry notice; read failures retain the last snapshot. Initial read failures use the global error screen. Anonymous stores expose empty data and reject writes. Keep data operations out of presentational components where practical.

All legacy local keys, including `doen-pa-travel-records-v2`, `doen-pa-current-user-v2` and both `*-account-v1:<uuid>` keys, remain untouched and are never automatically imported. **User decision — 2026-10-20:** there is no local data to migrate, so local import is removed from the plan. Manual local testing uses the accounts already created for this project. Reopen local import only if explicitly requested.

Proxy refreshes via `getClaims`; request-scoped `getAuthUser` verifies with `getUser` before personal rendering. Auth handlers carry SDK cookies to the final response with `private, no-store`, and accept same-origin JSON mutations only. Before changing connection settings, cookies or authentication, read [docs/supabase-setup.md](docs/supabase-setup.md). Public catalog reads use SELECT-only grants and RLS for `anon` and `authenticated`; administrative imports stay outside client code.

The hosted `profiles`, `travel_records`, `photos` and private Storage buckets enforce owner-only access. Before changing personal tables, cloud writes/Storage or local imports, read [docs/private-data-backend.md](docs/private-data-backend.md) for transactions, upload cleanup, account-scoped IDs and verification. Images use session-checked `/api/photos/[id]?owner=<uuid>` responses with `private, no-store`; `/api/photos/[id]` accepts `w=256|640|1280` and returns a resized, auto-oriented WebP (falls back to the original if resizing fails; Profile gallery, avatar and cover use it, full views use the original); render them with unoptimized Next Images so authenticated bytes are never placed in the image optimizer cache. The `rls_auto_enable()` API execution warnings are resolved while its event trigger remains active.

Photo rules:

- Uploads have EXIF/XMP/GPS removed in the browser by `src/lib/images/strip-metadata.ts` before preview or upload (JPEG keeps only orientation). See [docs/security.md](docs/security.md) for review, backup, operations and privacy decisions.
- A **new TravelRecord** accepts up to **5** JPG, PNG, or WebP images, each at most **5 MB**. `PhotoUploader` reads them as data URLs and offers preview/removal and alt-text entry.
- Revisiting the same place creates another record; do **not** cap the total photos shown for that place at five. The shared read model joins matching records; `PlaceDetailContent` passes every photo to `PlaceGallery` and `PhotoLightbox`.
- Passport cards represent records; Passport statistics count unique places/provinces and all saved photos.
- The current `TravelRecord.photos` schema stores image strings only. Uploader alt text is UI state and is **not persisted**; changing that needs an explicit data-model decision.
- Saved data is account-scoped in Supabase. New photos upload to private Storage before metadata commits atomically; failed uploads retain the form draft and attempt safe cleanup. A stable submission ID prevents duplicate records on retry. Cleanup failures can leave private orphan objects for later reclamation. This is cloud persistence, not a separate backup service.

Place images shown in personal surfaces must come from records the user creates, while empty images use neutral placeholders. Stitch `lh3.googleusercontent.com/aida-public/...` preview URLs must never be added as production image sources. The permanent place-photo strategy is undecided.

## Design system and references

The current visual language is **Design System v2**: forest-green `brand` tokens, light `canvas`, beige placeholders, rounded cards, soft contour dots, ambient glows, and Liquid Glass surfaces. Consult the implemented classes and tokens in `app/globals.css` and `tailwind.config.ts` rather than copying a long CSS snapshot into this document. Preserve `.liquid-glass`, `.liquid-glass-card`, `.liquid-glass-capsule`, `.hero-glass-console`, and the shared root background. Use the existing green type chips consistently on Search and Passport.

Use Figma mobile mockups as **structure/content references**. Stitch desktop mockups established the visual language. More recent accepted screenshots and explicit user decisions override older visual references. Do not copy generic booking, social, aggregate-rating, or recommendation UI from a mockup.

Desktop TopNav is a broad floating glass capsule with five links and a green active pill. Mobile has a full-width capsule **without a hamburger**: logo on the left and a Login link on guest previews or a linked account avatar and name on the right. A floating Liquid Glass BottomNav provides the same five routes, icons, labels, and safe-area spacing. Neither nav should lose its active state on Place Details. Keep mobile touch targets at least 44 × 44 px, visible focus states, readable contrast, and reduced-motion support.

## Current page behavior

### Search

- `app/search/page.tsx` supplies the full Supabase catalog snapshot and server-rendered place cards. `SearchResults` filters those cards in the browser using `q`, `type`, and `visited` URL parameters and the current user's records. Search controls update native browser history so selection and results do not wait for another Auth/catalog request; direct links, reload and Back/Forward retain the filters. An open Search page keeps its catalog snapshot until navigation or reload. `createPlaceCatalog` normalizes searchable text once per immutable snapshot; create a new catalog when place data changes. Query/type results are memoized independently of the visited filter and account updates.
- Search category options show only their names. On mobile, categories form one horizontally scrollable row. Choosing a category preserves the page's scroll position on mobile and desktop.
- Place cards link to full Place Details. Their green type chip is a place category, not booking status. The personal visit count appears only when positive. The card's Stamp action opens the record form with `returnTo=search`.
- The card's Stamp link is a sibling of its details link, never an interactive element nested inside it. Stamp links load the form on demand with `prefetch={false}`.
- No public aggregate rating, review count, booking badge, or popularity recommendation.

### Place Details and records

- Desktop Place Details uses a gallery column and a `.liquid-glass-card` info column. Show text-only type → altitude → distance chips, description, and **all** matching personal records. Location, region, and record-date chips also have no icons.
- Gallery shows one large photo at a time. Previous/next controls are dark frosted vertical rectangles, vertically centered and inset from the photo edges; a position counter sits near the top. No thumbnail row and no image zoom on hover.
- Clicking a gallery photo opens a fixed full-screen lightbox. Use the same style of controls; close by clicking outside the displayed photo or pressing Escape. There is no visible X button.
- If the user entered from Passport, suppress `PlaceActions` but keep the records and gallery visible.
- Record form: date, up to five photos **per record**, memory note, optional personal 1–5 star rating. On save, create a new record then route to Passport. Never turn personal ratings into public aggregates.

### Map

- `MapOverview` combines client-side records with the server-provided catalog and deduplicates visited places by `placeId` when valid coordinates exist. Its `getMapPhoto` read selects the latest photographed visit in one pass without sorting or building a gallery; equal visit dates retain storage order. `DynamicThailandMap` loads Leaflet without SSR.
- Map fills the viewport **behind** the floating nav. Terrain tiles use Stadia Maps' Stamen Terrain Background. Stadia domain authentication for `doen-pa.vercel.app` was configured and verified on 2026-10-21; in Stadia's form, leave Subdomain empty and set Domain to `doen-pa.vercel.app`, with Allow All Subdomains off. This deployment needs no API key. Other deployed domains need their own Stadia domain authentication or `NEXT_PUBLIC_STADIA_MAPS_API_KEY`. If old 401 warning tiles remain after authorization, hard-reload the page to bypass cached tiles.
- Keep Stadia Maps, Stamen Design, OpenMapTiles, and OpenStreetMap attribution visible; only Leaflet's optional prefix is hidden.
- Constrain panning to Thailand and its nearby region. Show visited-place pins only, neutral province outlines and small Thai province names from `public/data/thailand.json`, and noninteractive Thai labels for neighboring countries. Do not shade provinces by visit status.
- Pin selection reuses existing Leaflet markers and changes only the old/new selected icons; rebuild markers when place data changes. Enter and Space select a focused pin without losing keyboard focus.
- Selecting a pin shows a bottom card on desktop and mobile with record photo when available, place name, **province chip**, distance, and altitude. It displays information only.

### Passport, Stats, Profile

- Passport lists all travel records without a category filter. Cards open read-only Place Details with `from=passport`; they do not offer stamping there.
- `/passport?view=guest`, `/stats?view=guest`, and `/profile?view=guest` are optional guest design previews alongside real authentication. Keep them distinct from signed-in empty-data states.
- Guest Passport, Stats and Profile show Login without a separate “ค้นหาสถานที่” link.
- Stats and Profile derive personal counts from the current user's records. Stats shows travel, place, province, region, national park, and place-type counts; the badge teaser and collection are deferred. The national-park progress card sits below province progress. Its total comes from catalog places marked `isNationalPark`, independent of their display type. Visited progress counts each eligible place once; adding another park changes the total automatically. The place-type section uses progress bars and remaining catalog counts. Region progress bars and remaining counts use national parks in each region. Profile uses a real photo count in place of the former badge count. Profile photo tiles link to Place Details with `from=profile`.
- The Profile edit button opens `/profile/edit`; its form offers live preview, validates display name and username, accepts optional bio plus JPG/PNG/WebP avatar and cover images up to 1 MB each, and saves to Supabase. The form verifies the account before saving; profile text and photo metadata commit together, and replaced objects are cleaned afterward.
- New registrations set Auth user metadata `profile_setup_pending: true`. Login and email confirmation open profile setup first; recovery always opens `/reset-password`. After a successful profile save, a same-origin authenticated handler clears that flag and returns Search. It is an onboarding preference, independent of access control/RLS; existing accounts without the flag skip setup.
- Profile logout revokes the current session with `scope: local`, clears its cookies, notifies other tabs and reloads the guest Profile. It preserves local originals and account-scoped memories; other device sessions are not intentionally signed out.
- Keep ratings personal, avoid public review or social features.

## Architecture and quality rules

- Client navigation keeps the current page visible with a slim top progress bar; the hiker overlay covers only the first load. There is no `app/loading.tsx`, which would blank the page between routes.
- Server Components by default; use client components for browser APIs, account-snapshot subscriptions, Leaflet, form/filter state, and active navigation. Keep `PlaceCard` a Server Component with a Next `Link`.
- Keep data operations in services/hooks. Use strict TypeScript; avoid `any`, magic constants, huge components, and unnecessary client fetching.
- Every changed interaction should handle its relevant loading, empty, error, focus, and disabled states. Use semantic elements, image alt text, keyboard-accessible controls, and WCAG AA contrast.
- Avoid new global scrolling caused by decorative glows; the mobile bottom bar needs content clearance. Test responsive changes on desktop and a mobile viewport.
- Do not remove map attribution or treat the guest preview as real authentication.
- Before implementing a feature, check the user goal, journey, components, data flow, responsive behavior, and accessibility. Ask only for a genuinely unresolved product/design/data decision.

## MVP boundary

**In scope:** personal search/discovery, Place Details, stamping visits, travel records, Passport, visited-place map, personal stats, profile.

**Out of scope until explicitly approved:** badge collection, social interactions, public profiles/reviews or aggregate ratings, booking/payment, trip planning and routing, live GPS, weather, gear management, recommendation/popularity engines, activity feed, messaging.

## Verification and workflow

- Use `pnpm dev` only if a dev server is not already running. Reuse the user's existing localhost server when available; do not stop it without a reason.
- Run `pnpm exec tsc --noEmit`, `pnpm lint`, and `git diff --check` for code changes. `pnpm build` is the production build check when appropriate. There is **no `pnpm type-check` script** in `package.json`.
- Before changing or running test workflows, read [docs/testing.md](docs/testing.md). `pnpm test` checks catalog reads and runs migration/seed/RLS tests in isolated PGlite; browser tests require the configured catalog and local QA account file. Email-token tests create temporary users through Admin API and delete them afterward; credentials and administrative keys never belong in Git or app bundles. `pnpm import:places:check` verifies the generated seed without uploading it.
- For rendered UI changes, verify the actual route and interaction on desktop and mobile; source inspection and lint alone are not visual QA.
- The project history uses separate commits with `feat:`, `fix:`, `style:`, or `copy:` prefixes for distinct changes. Check the worktree before editing and do not include unrelated changes.
- When accepted changes alter storage, data flow or page behavior, update the affected instructions here in the same implementation change.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
