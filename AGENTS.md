# 🥾 Doen Pa — AGENTS.md

## Purpose and working agreement

Doen Pa is a personal Digital Hiking Passport for Thai hikers: **document the journey, not plan the journey**. The core flow is search for a place → stamp a visit by creating a travel record → view memories in the Passport, Place Details, Map, Stats, and Profile.

When product scope, design direction, or data modeling is genuinely ambiguous, ask the user before choosing. Use the latest user decision over older mockups or this document. For implementation details already settled in code and prior decisions, continue without repeating permission requests. Do not silently turn the app into a planner, booking product, or public review network.

This file describes the **current implementation and accepted behavior**, not a promise that every older mockup element has been built. When it differs from the code, inspect the relevant component and recent commits before changing either one.

## Current stack and repository

- Next.js **16.3.4** App Router, React **19**, TypeScript strict mode, Tailwind CSS **4**, Lucide React, Leaflet 1.9/react-leaflet 5; package manager **pnpm**.
- Fonts: Kanit and Plus Jakarta Sans are bundled under `public/fonts/` and declared in `app/globals.css`; the production build uses Webpack so it does not fetch Google Fonts during compilation.
- Pages and global CSS live in root-level `app/`; components, services, mocks, types, and hooks live in `src/`. Do not create a second `src/app/`.
- State currently uses React hooks, URL query parameters, `useSyncExternalStore`, and localStorage. **Zustand is not installed**; do not assume a store layer exists.
- Source of truth for types: `src/types/index.ts`; for design tokens/effects: `app/globals.css` and `tailwind.config.ts`; for the searchable place catalog: `src/mocks/places.ts`.
- The app starts as a **new local user with zero records, photos, and visited places**. `userService.getCurrentUser()` returns a neutral local identity with any locally saved profile edits. There is **no real authentication or backend**. Never reintroduce seeded personal records or sample user photos.

## Routes and navigation

| Route | Current behavior |
|---|---|
| `/` | Redirects to `/search`. |
| `/search` | Search, category cards, visited filter, place cards. |
| `/places/[id]` | Full Place Details page. Missing IDs call `notFound()`. |
| `/records/new?placeId=[id]` | New travel record for the given place; invalid/missing place redirects to Search. |
| `/map` | Full-viewport visited-place terrain map. |
| `/passport` | Local user's Passport and travel-record cards; initially empty. |
| `/passport?view=guest` | **Preview** of the logged-out Passport screen. Login button opens `/login`; this URL is not a security boundary. |
| `/login` | Standalone login design with email/password and Google controls. Auth is not implemented; attempts show an unavailable message without sending or storing credentials. `from` keeps Back linked to the originating guest preview. |
| `/stats` | Personal travel statistics by province, place type, and region. Badge UI is deferred. |
| `/stats?view=guest` | Logged-out Stats preview with an empty state and a link to the local-user Stats page. |
| `/profile` | Personal profile and photo gallery. |
| `/profile/edit` | Edit the local user's display name, username, bio, avatar, and cover image, with a live preview. Changes persist in this browser's localStorage. |
| `/profile?view=guest` | Logged-out Profile preview with an empty state and a link to the local-user Profile page. |

Place Details receives an explicit origin when needed:

- Search opens `/places/[id]`: Back → `/search`; the Search nav item remains active; stamping is available.
- Passport cards open `/places/[id]?from=passport`: Back → `/passport`; the Passport nav item remains active; **read-only**, so no Stamp button.
- Profile photos open `/places/[id]?from=profile&photo=[index]` at the selected image: Back → `/profile`; the Profile nav item remains active.
- `src/components/navigation/activeNav.ts` owns active-tab mapping for TopNav and BottomNav. Preserve a visible active tab on nested pages and during client navigation.
- On `?view=guest` previews, TopNav shows a Login link instead of the local-user pill. TopNav and BottomNav preserve `view=guest` when navigating between main routes. This query parameter is a design preview, not real authentication or access control.
- Outside guest previews, the TopNav user pill reads the current local profile. Do not hardcode a sample person's name or avatar.
- `BackButton` uses an explicit href, never browser history. In the record form, `returnTo=search` returns to Search; otherwise Back returns to the place page. A successful record submission redirects to Passport.

Do not add a dialog version of Place Details. The map's selected-place card is display-only and does not navigate.

## Data and persistence

`Place` has `id`, `name`, `location`, `province`, `region`, `description`, `type`, optional coordinates, altitude, distance, season and camping text. The place catalog has **no sample image URLs**. `TravelRecord` has `userId`, `placeId`, `visitedAt`, `note`, `photos: string[]`, personal `rating`, and `createdAt`. Use the actual interfaces in `src/types/index.ts`; older fields such as `image`, `category`, `rankLabel`, `difficulty`, and `guidelines` are **not in the current Place model**.

`travelRecordService` starts with an **empty array** and persists new records under `doen-pa-travel-records-v2` in localStorage. `useTravelRecords` subscribes to changes. `userService` starts with a neutral local identity (`local-user`), stores profile edits under `doen-pa-current-user-v2`, and `useCurrentUser` subscribes so Profile and Passport show saved changes. `AppShell` removes the legacy pre-reset personal-data keys on load. Keep service access out of purely presentational components where practical.

Photo rules:

- A **new TravelRecord** accepts up to **5** JPG, PNG, or WebP images, each at most **5 MB**. `PhotoUploader` reads them as data URLs and offers preview/removal and alt-text entry.
- Revisiting the same place creates another record; do **not** cap the total photos shown for that place at five. `PlaceDetailContent` joins all matching records and passes every photo to `PlaceGallery` and `PhotoLightbox`.
- Passport cards represent records; Passport statistics count unique places/provinces and all saved photos.
- The current `TravelRecord.photos` schema stores image strings only. Uploader alt text is UI state and is **not persisted**; changing that needs an explicit data-model decision.
- localStorage is MVP storage and has browser quota limits. Do not claim uploads are backed up or synced.

The searchable place catalog remains local data; its sample image URLs were removed. Place images shown in personal surfaces must come from records the user creates, while empty images use neutral placeholders. Stitch `lh3.googleusercontent.com/aida-public/...` preview URLs must never be added as production image sources. The permanent place-photo strategy is undecided.

## Design system and references

The current visual language is **Design System v2**: forest-green `brand` tokens, light `canvas`, beige placeholders, rounded cards, soft contour dots, ambient glows, and Liquid Glass surfaces. Consult the implemented classes and tokens in `app/globals.css` and `tailwind.config.ts` rather than copying a long CSS snapshot into this document. Preserve `.liquid-glass`, `.liquid-glass-card`, `.liquid-glass-capsule`, `.hero-glass-console`, and the shared root background. Use the existing green type chips consistently on Search and Passport.

Use Figma mobile mockups as **structure/content references**. Stitch desktop mockups established the visual language. More recent accepted screenshots and explicit user decisions override older visual references. Do not copy generic booking, social, aggregate-rating, or recommendation UI from a mockup.

Desktop TopNav is a broad floating glass capsule with five links and a green active pill. Mobile has a full-width logo capsule **without a hamburger** and a floating Liquid Glass BottomNav with the same five routes, icons, labels, and safe-area spacing. Neither nav should lose its active state on Place Details. Keep mobile touch targets at least 44 × 44 px, visible focus states, readable contrast, and reduced-motion support.

## Current page behavior

### Search

- `app/search/page.tsx` filters mock places with `q`, `type`, and `visited` URL parameters. `SearchResults` combines server-rendered place cards with the current user's records for visited status.
- Category counts come from `placeService`, not invented numbers. On mobile, choosing a category scrolls to the first result area below the floating nav; desktop keeps its scroll position.
- Place cards link to full Place Details. Their green type chip is a place category, not booking status. The personal visit count appears only when positive. The card's Stamp action opens the record form with `returnTo=search`.
- No public aggregate rating, review count, booking badge, or popularity recommendation.

### Place Details and records

- Desktop Place Details uses a gallery column and a `.liquid-glass-card` info column. Show type → altitude → distance chips, description, optional season/camping tiles, and **all** matching personal records.
- Gallery shows one large photo at a time. Previous/next controls are dark frosted vertical rectangles, vertically centered and inset from the photo edges; a position counter sits near the top. No thumbnail row and no image zoom on hover.
- Clicking a gallery photo opens a fixed full-screen lightbox. Use the same style of controls; close by clicking outside the displayed photo or pressing Escape. There is no visible X button.
- If the user entered from Passport, suppress `PlaceActions` but keep the records and gallery visible.
- Record form: date, up to five photos **per record**, memory note, optional personal 1–5 star rating. On save, create a new record then route to Passport. Never turn personal ratings into public aggregates.

### Map

- `MapOverview` uses client-side records and deduplicates visited places by `placeId` when valid coordinates exist. `DynamicThailandMap` loads Leaflet without SSR.
- Map fills the viewport **behind** the floating nav. Terrain tiles use Stadia Maps' Stamen Terrain Background. Deployed domains need `NEXT_PUBLIC_STADIA_MAPS_API_KEY` or Stadia domain authentication.
- Keep Stadia Maps, Stamen Design, OpenMapTiles, and OpenStreetMap attribution visible; only Leaflet's optional prefix is hidden.
- Constrain panning to Thailand and its nearby region. Show visited-place pins only, neutral province outlines and small Thai province names from `public/data/thailand.json`, and noninteractive Thai labels for neighboring countries. Do not shade provinces by visit status.
- Selecting a pin shows a bottom card on desktop and mobile with record photo when available, place name, **province chip**, distance, and altitude. It displays information only.

### Passport, Stats, Profile

- Passport filter row is centered and may scroll horizontally on narrow screens. It filters record cards by place type. Cards open read-only Place Details with `from=passport`; they do not offer stamping there.
- `/passport?view=guest`, `/stats?view=guest`, and `/profile?view=guest` are logged-out design previews while auth is absent. Keep them distinct from signed-in empty-data states.
- Stats and Profile derive personal counts from the current user's records. Stats shows travel, province, place type, region, and photo counts; the badge teaser and collection are deferred. Profile uses a real photo count in place of the former badge count. Profile photo tiles link to Place Details with `from=profile`.
- The Profile edit button opens `/profile/edit`; its form offers live preview, validates display name and username, accepts optional bio plus JPG/PNG/WebP avatar and cover images up to 1 MB each, and saves locally. There is no backend sync or account authentication.
- The Profile logout control opens `/profile?view=guest` in the current auth-preview design, preserving local profile and travel records. It does not claim to end a real server session because authentication is not implemented yet.
- Keep ratings personal, avoid public review or social features.

## Architecture and quality rules

- Server Components by default; use client components for browser APIs, localStorage-backed subscriptions, Leaflet, form/filter state, and active navigation. Keep `PlaceCard` a Server Component with a Next `Link`.
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
- For rendered UI changes, verify the actual route and interaction on desktop and mobile; source inspection and lint alone are not visual QA.
- The project history uses separate commits with `feat:`, `fix:`, `style:`, or `copy:` prefixes for distinct changes. Check the worktree before editing and do not include unrelated changes.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
