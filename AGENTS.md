# 🥾 Doen Pa — AGENTS.md

## Project Overview

**Doen Pa** is a Digital Hiking Passport web app for Thai hikers.

> "Document the journey, not plan the journey."

Users record places they have visited, upload photos, write memories, and build their personal hiking passport. This is **not** a trip planner or booking system.

---

## Design Philosophy — How to Use Figma

Figma mockups exist for **mobile only** and were drawn as low-fidelity structural references.

**What to take from Figma:**
- Page structure — what sections exist, in what order
- Content hierarchy — what information matters most on each screen
- Component composition — e.g. "a card with thumbnail + name + location"
- User flow between screens

**What NOT to copy literally:**
- Flat full-bleed color blocks (e.g. red search hero, yellow filter bar, brown stats hero) — these were quick mobile placeholders, not a final palette
- Exact pixel layout — Figma is mobile-width (~375px); do not stretch it to desktop
- 1:1 visual styling — desktop should look like a considered desktop product, not a scaled-up phone screen

**Desktop layout and visual design are designed fresh**, using the Liquid Glass design system below, with good judgment for larger viewports (multi-column layouts, sidebars, appropriate whitespace, hover states). Structure/content from Figma stays the same — the visual execution for desktop does not.

**Workflow:** build desktop first using Liquid Glass (this file is the source of truth for desktop styling) → once all desktop pages are done, do a mobile responsive pass referencing Figma's mobile structure more closely.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| State | Zustand |
| Icons | Lucide React |
| Rendering | Server Components by default |

---

## Core Product Principle

```
Search place → Add to Passport → Fill Travel Record → View Passport
```

Every feature must serve this journey. If it doesn't help users **record hiking memories**, it does not belong in MVP.

---

## Routes (Source of Truth)

| Route | Page | Notes |
|-------|------|-------|
| `/` | redirect | → `/search` |
| `/search` | Home / Search | Search bar + type filter chips + place list |
| `/places/[id]` | Place Details | **Full page, NOT a dialog/modal** |
| `/records/new` | Travel Record Form | Opened via `?placeId=[id]` query param |
| `/map` | Map | Thailand map, provinces highlighted by visited status |
| `/passport` | Passport | Filterable grid of TravelRecordCards |
| `/stats` | Stats | Hero stats, badges, province/category/region breakdown |
| `/profile` | Profile | Cover + avatar + stats + Post Gallery |

### User Flow

```
/search → click PlaceCard (via <Link>, no dialog)
        → /places/[id]
        → click "+ เพิ่มบันทึกใหม่"
        → /records/new?placeId=[id]
        → submit → /passport
```

`/map`, `/stats`, `/profile` are reachable anytime from TopNav (desktop) / BottomNav (mobile).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # TopNav + BottomNav wrapper
│   ├── page.tsx                # redirect('/search')
│   ├── search/page.tsx
│   ├── places/[id]/page.tsx    # Server Component, notFound() if missing
│   ├── records/new/page.tsx    # reads ?placeId= from searchParams
│   ├── map/page.tsx
│   ├── passport/page.tsx
│   ├── stats/page.tsx
│   └── profile/page.tsx
│
├── components/
│   ├── ui/                     # StatCard, FilterChip, GlassCard, GlassButton, GlassInput
│   ├── navigation/              # TopNav, BottomNav
│   ├── search/                  # SearchBar, FilterSection, PlaceCard, PlaceList
│   ├── place/                   # PlaceHero, PlaceInfo, PlaceChips, PlaceDescription, PlaceRecord, PlaceActions
│   ├── records/                 # TravelRecordForm, PhotoUploader
│   ├── map/                     # ThailandMap
│   ├── passport/                # PassportHeader, PassportFilter, TravelRecordCard
│   ├── stats/                   # StatsHero, BadgeTeaser, BadgeGrid, ProvinceProgress, CategoryStats, RegionStats
│   └── profile/                 # ProfileHeader, ProfileStats, PostGallery
│
├── services/
│   ├── place.service.ts        # searchPlaces, getPlaceById, filterByType
│   ├── travel-record.service.ts# getRecordsByUser, getRecordByPlace, createRecord
│   ├── user.service.ts         # getCurrentUser
│   └── stats.service.ts        # calculateStats
│
├── stores/                     # Zustand stores (search, passport filters)
├── types/                      # TypeScript interfaces
├── lib/                        # utils.ts (formatThaiDate, etc.)
└── mocks/
    ├── places.ts                # 20 places, all types & regions covered
    ├── users.ts
    └── travel-records.ts
```

**Note:** `/places/[id]` is a real page, not a bottom-sheet dialog. `PlaceCard` links to it with Next.js `<Link>` (stays a Server Component — do not add `"use client"` to `PlaceCard` just to navigate).

---

## Data Models

```typescript
type PlaceType = 'mountain' | 'waterfall' | 'cave' | 'island' | 'national_park'
type Region = 'north' | 'central' | 'south' | 'northeast' | 'east' | 'west'

interface User {
  id: string
  name: string
  username: string
  avatar?: string
  bio?: string
}

interface Place {
  id: string
  name: string
  location: string        // e.g. "Uttaradit Northern"
  province: string
  region: Region
  description: string
  image: string
  type: PlaceType
  altitude?: string        // e.g. "1663 m" — shown as a chip on Place Details
  distance?: string        // e.g. "6.5 m" — shown as a chip on Place Details
}

interface TravelRecord {
  id: string
  userId: string
  placeId: string
  visitedAt: Date
  note: string
  photos: string[]
  rating: number   // 1–5, personal only (not public review)
  createdAt: Date
}

interface Stats {
  totalPlaces: number
  totalProvinces: number
  totalPhotos: number
  totalRegions: number
  byType: Record<PlaceType, number>
  byRegion: Record<Region, { count: number; provinces: string[] }>
}
```

**Filter chip labels (Thai, used across Search + Passport):** ทั้งหมด, ภูเขา, น้ำตก, ถ้ำ, หมู่เกาะและทะเล

---

## Design System — Liquid Glass (Desktop Source of Truth)

This is the palette and visual language for **desktop**. Do not substitute Figma's mobile flat colors (red/yellow/brown full-bleed sections) for desktop layouts.

### Color Palette
```
Forest Green:   #2D5F4F   primary — nav, primary buttons, headings
Mountain Beige: #D4C5B0   neutral — borders, subtle backgrounds
Sunrise Gold:   #FFB347   accent — badges, highlights, progress fills
Misty Slate:    #7A8FA3   secondary text
Cream:          #F5F1E8   page background
```

Desktop pages use a light `cream`/white background with **glass cards** floating on top — not full-bleed saturated color blocks. Color is used with restraint: forest green for structure/primary actions, gold as a sparing accent (badges, active states, progress).

### Glass Effects
```css
/* Card */
.card-glass {
  backdrop-filter: blur(10px);              /* 8px on mobile */
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(45, 95, 79, 0.12);
}

/* Button */
.glass-button {
  backdrop-filter: blur(8px);
  background: rgba(45, 95, 79, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
}

/* Input */
.glass-input {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.80);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

/* Navigation */
.nav-glass {
  backdrop-filter: blur(8px);
  background: rgba(245, 241, 232, 0.90);
  border-bottom: 1px solid rgba(212, 197, 176, 0.3);
}
```

### Tailwind Extensions (tailwind.config.ts)
```typescript
extend: {
  colors: {
    forest: '#2D5F4F',
    beige:  '#D4C5B0',
    gold:   '#FFB347',
    slate:  '#7A8FA3',
    cream:  '#F5F1E8',
  },
  boxShadow: {
    'glass':    '0 8px 24px rgba(45, 95, 79, 0.12)',
    'glass-md': '0 12px 32px rgba(45, 95, 79, 0.15)',
    'glass-lg': '0 20px 48px rgba(45, 95, 79, 0.20)',
    'glow':     '0 4px 16px rgba(45, 95, 79, 0.08)',
  },
  animation: {
    'glass-in':   'glass-slide-up 0.5s ease-out',
    'soft-scale': 'soft-scale 0.4s ease-out',
  },
}
```

### Border Radius
```
Cards:   16–24px (rounded-xl / rounded-2xl)
Buttons: 8–12px  (rounded / rounded-lg)
Inputs:  8px     (rounded)
Modals:  20px    (rounded-2xl)
```

### Animations
```
Fast:   150ms ease-out   — quick feedback
Normal: 300ms ease-out   — standard transitions
Slow:   500ms ease-out   — emphasis
```

---

## Navigation

**Desktop (≥768px):** `TopNav` shows the logo on the left and **full horizontal nav links** on the right — no hamburger. Links: ค้นหา (`/search`), แผนที่ (`/map`), แพสพอร์ต (`/passport`), สถิติ (`/stats`), โปรไฟล์ (`/profile`). Active link is highlighted (`text-forest font-semibold` + underline/border-bottom); inactive links are `text-slate hover:text-forest`. Background is `nav-glass` (light, not solid forest green). Use `usePathname()` to detect the active route.

**Mobile (<768px):** `TopNav` shows only the logo + hamburger icon (nav links hidden via `hidden md:flex`). `BottomNav` (5 tabs, same routes as above) is the primary navigation on mobile — shown only below the `md` breakpoint.

```tsx
<nav className="h-16 nav-glass flex items-center justify-between px-6 sticky top-0 z-40">
  <Logo />
  <NavLinks className="hidden md:flex gap-6" />      {/* desktop only */}
  <HamburgerButton className="md:hidden" />           {/* mobile only */}
</nav>
```

`TopNav` must be a Client Component (`usePathname()`).

---

## Component Rules

### Server vs Client Components

**Server Components (default):**
- All page layouts
- Place listings and details
- Static profile data
- Passport grid (data only)

**Client Components (only when needed):**
- `TopNav` — uses `usePathname()` to highlight the active nav link
- `SearchBar`, `FilterSection`, `FilterChip` — interactive input/filter state
- `TravelRecordForm`, `PhotoUploader` — form state, FileReader API
- `ThailandMap` — Leaflet requires the browser; also needs `dynamic(() => import(...), { ssr: false })` in the page that renders it
- `PassportFilter` / `/passport/page.tsx` — client-side filtering by type
- `BottomNav` — uses `usePathname()` to highlight active tab
- `PlaceActions` — uses `useRouter()` to navigate to `/records/new`
- Anything using `useState`, `useEffect`, Browser APIs

```typescript
// ✅ Correct — PlaceCard stays a Server Component, navigation via <Link>
export function PlaceCard({ place }: Props) {
  return (
    <Link href={`/places/${place.id}`}>
      {/* card content */}
    </Link>
  )
}

// ❌ Wrong — don't make PlaceCard a Client Component just to navigate
'use client'
export function PlaceCard({ place }: Props) { ... }
```

### Component Architecture
- No Giant Components — split by responsibility
- No API calls inside UI Components — use service layer
- No hardcoded data inside components — use mocks or services
- Every component must handle: default, loading, empty, error states

---

## Page Specs (Desktop)

Build desktop layout first with `max-w-1280px mx-auto`, `bg-cream` page background, Liquid Glass cards for content sections. Structure/content below is informed by Figma; **visual styling (color, section backgrounds) follows the Liquid Glass system above, not Figma's flat mobile colors.**

### `/search`
- Search section: `card-glass` container with heading + `SearchBar` (debounced 300ms) — not a full-bleed red block
- `FilterSection`: horizontal row of circular `FilterChip`s — ทั้งหมด / ภูเขา / น้ำตก / ถ้ำ / หมู่เกาะและทะเล
- `PlaceList`: `card-glass` `PlaceCard`s (thumbnail + name + location + province/region), desktop 3-col grid
- Each `PlaceCard` wrapped in `<Link href={/places/[id]}>` — no dialog

### `/places/[id]`
- Full page (not a modal). `notFound()` if place doesn't exist.
- Desktop: two-column layout — image left (or top), info right — rather than a single narrow mobile column
- `PlaceHero` (image) → `PlaceInfo` (name, province, region) → `PlaceChips` (altitude, distance, type) → `PlaceDescription` → `PlaceRecord` (only if user already has a TravelRecord for this place — shows date + note) → `PlaceActions` ("+ เพิ่มบันทึกใหม่" button + bookmark button)
- Primary button navigates to `/records/new?placeId=[id]`

### `/records/new`
- Reads `placeId` from `searchParams`; redirect to `/search` if place not found
- `TravelRecordForm` (Client) inside a `card-glass` container, centered, max-w-xl: place info (read-only) → date → `PhotoUploader` (max 5 photos, 5MB each, jpg/png/webp) → note textarea → optional 1–5 star rating → submit
- On submit: `travelRecordService.createRecord()` then redirect to `/passport`

### `/map`
- Full-viewport Leaflet map of Thailand (`ThailandMap`, dynamic-imported with `ssr: false`)
- Visited provinces: `fillColor #2D5F4F`; not visited: `fillColor #D4C5B0` (beige, lighter)
- Floating `card-glass` badge pill top-center: "อุทยานที่ไปแล้ว X แห่ง"
- Desktop: optional side panel listing visited provinces next to the map
- GeoJSON source: Thailand provinces (e.g. `apisit/thailand.json`), stored at `public/data/thailand.json`

### `/passport`
- `PassportHeader`: avatar + username + 3 `StatCard` in a `card-glass` container
- `PassportFilter`: same circular chips as Search
- Grid of `TravelRecordCard` (type badges + date + image + place name/province + note quote) as `card-glass` cards, desktop 2–3 col
- Empty state: "แพสพอร์ตของคุณยังว่างเปล่า" + CTA to `/search`

### `/stats`
- `StatsHero`: "X การเดินทาง" + 3 `StatCard` in a `card-glass` container — provinces / regions / photos
- `BadgeTeaser`: next badge to earn + progress bar, `card-glass` with a subtle gold accent border
- `BadgeGrid`: "ตราสะสม (X/14)" + see-all link, circles in a grid
- `ProvinceProgress`: "X/77 จังหวัด" progress bar + hint text
- `CategoryStats`: grid — ภูเขา / น้ำตก / ถ้ำ / หมู่เกาะและทะเล, count per type
- `RegionStats`: list per region, progress bar + visited provinces; regions with 0 visits shown at reduced opacity
- Desktop: 2-column grid for these sections rather than a single stacked column

### `/profile`
- `ProfileHeader`: cover area + "แก้ไขโปรไฟล์" button (top-right) + avatar overlapping cover + name + bio
- `ProfileStats`: 3 `StatCard` — places / provinces / badges
- `PostGallery`: "Post Gallery" grid of all photos across the user's TravelRecords, each tile links to `/places/[placeId]`
- Desktop: left column for profile info, right column (wider) for the gallery grid

---

## Map Integration

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

- GeoJSON: download Thailand provinces boundary data, save to `public/data/thailand.json`
- `ThailandMap` must be dynamically imported with `{ ssr: false }` — Leaflet does not support SSR:

```typescript
const ThailandMap = dynamic(() => import('@/components/map/ThailandMap'), { ssr: false })
```

- Province styling is driven by `visitedProvinces: string[]`, derived server-side from `travelRecordService.getRecordsByUser()` joined with `placeService` to resolve `placeId → province`.

---

## Coding Standards

### Do
```typescript
// Typed interfaces
interface PassportEntryProps {
  record: TravelRecord
  place: Place
}

// Meaningful naming
const getVisitedProvinces = (records: TravelRecord[]) => { ... }

// Service layer abstraction
const places = await placeService.search(query)
```

### Don't
```typescript
// No any
const data: any = await fetch(...)

// No magic numbers
const blur = 10    // ❌
const GLASS_BLUR_DESKTOP = 10   // ✅

// No arbitrary Tailwind values (unless design-justified)
className="text-[13px] mt-[17px] w-[437px]"   // ❌
className="text-sm mt-4 w-full"                 // ✅

// No "use client" everywhere
'use client'   // only when actually needed
```

---

## Before Writing Any Code

Follow this order every time:

```
1. User Goal      — What is the user trying to do?
2. User Journey   — What steps do they take?
3. Features       — What stories make up this feature?
4. Components     — What components are needed?
5. Data Flow      — How does data move through the system?
6. Responsive     — Mobile / Tablet / Desktop behavior?
7. Accessibility  — Semantic HTML, ARIA, keyboard, contrast?
8. Implementation — Write the code
```

---

## Responsive Breakpoints

```
Mobile:        320–767px   → 1 column, 16px padding, blur 8px
Tablet:        768–1023px  → 2 columns, 20px padding, blur 10px
Desktop:       1024px+     → 3–4 columns, 24px padding, blur 10–12px
Large Desktop: 1440px+     → max-width 1280px, centered
```

Mobile responsive pass references Figma's mobile structure more literally (section order, content grouping). Desktop is built first and is the primary target for initial development.

Mobile performance:
- Reduce `backdrop-filter` blur to `8px`
- Touch targets minimum `44×44px`
- No hover-only interactions

---

## Accessibility Requirements

Every component must have:
- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`, etc.)
- `aria-label` on icon-only buttons
- `alt` text on all images
- Visible focus states (`focus:ring-2 ring-forest`)
- Color contrast WCAG AA minimum
- `prefers-reduced-motion` support — disable blur animations

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## UI States (Required for Every Interactive Component)

| State | Required |
|-------|----------|
| Default | ✅ |
| Hover | ✅ |
| Active / Pressed | ✅ |
| Focus | ✅ |
| Disabled | ✅ |
| Loading | ✅ |
| Empty | ✅ |
| Error | ✅ |
| Success | ✅ |

Empty state example:
```tsx
<EmptyState
  icon={<BookOpen />}
  title="แพสพอร์ตของคุณยังว่างเปล่า"
  description="เริ่มต้นด้วยการเพิ่มสถานที่ที่คุณเคยไป"
  action={<Button>สำรวจสถานที่</Button>}
/>
```

---

## Image Upload Rules

PhotoUploader must support:
- File type validation: `jpg`, `png`, `webp` only
- Max size: 5MB per image
- Max count: 5 images per TravelRecord
- Preview before save
- Remove / Replace per image
- Accessible `alt` text input
- Upload progress state
- Error state with message

For MVP (no backend): use `FileReader` API + localStorage

---

## Performance Checklist

Before shipping any page:
- [ ] Is this a Server Component where possible?
- [ ] Images use `next/image` with proper `width`, `height`, `alt`
- [ ] Heavy components use `React.lazy` or `dynamic()`
- [ ] Suspense boundaries in place for async data
- [ ] No unnecessary `useEffect` or client-side fetching
- [ ] Bundle size checked with `@next/bundle-analyzer`
- [ ] Lighthouse mobile score ≥ 90

---

## Design Review Checklist

When reviewing a screenshot or existing UI:

- [ ] Layout — alignment, grid, hierarchy
- [ ] Spacing — padding, margins, gaps consistent?
- [ ] Typography — size, weight, line-height, contrast
- [ ] Color — Liquid Glass palette used correctly (desktop), not raw Figma mobile colors
- [ ] Liquid Glass — blur, border, shadow correct?
- [ ] Component consistency — same components used throughout?
- [ ] Responsive — works on mobile?
- [ ] Accessibility — readable, navigable by keyboard?
- [ ] Empty / Error / Loading states — handled?

Be direct. Identify problems and propose fixes.

---

## MVP Scope Boundary

Always ask: **"Does this help users record their hiking memories?"**

```
✅ IN MVP:
   Search & Discovery
   Place Details
   Add to Passport
   Travel Record (date, photos, note, rating)
   Passport View
   Map — visited-provinces overview (Leaflet, no GPS/routing)
   Stats + Badge Collection
   Profile

❌ NOT IN MVP:
   Social features (follow, like, comment, share)
   Public profiles
   Booking or payment
   Trip planning / route navigation / turn-by-turn directions
   Live GPS tracking
   Weather data
   Gear management
   Recommendation engine
   Activity feed
   Messaging
```

**Note:** `/map` is a *visited-provinces overview*, not a trip planner or GPS navigator — it stays within "document the journey" (see Core Product Principle above). Do not add routing, directions, or live location features to it.

---

## Architecture Scalability

Build MVP cleanly so Phase 2 social features can be added without refactoring:

```
Phase 1 (MVP)
├── Personal Passport
└── Travel Records

Phase 2 (Future)
├── Public Profiles
├── Reviews & Ratings
├── Follow System
├── Activity Feed
└── Hiking Community
```

Service layer must be abstracted so switching from mock data to real API requires only changing the service file, not the UI components.

---

## Quick Reference

```bash
# Run dev
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build
```

---

> 🥾 **Doen Pa** — Your hikes. Your memories. Your passport.
