# 🥾 Doen Pa — AGENTS.md

## Project Overview

**Doen Pa** is a Digital Hiking Passport web app for Thai hikers.

> "Document the journey, not plan the journey."

Users record places they have visited, upload photos, write memories, and build their personal hiking passport. This is **not** a trip planner, booking system, or social review platform.

**Working agreement:** when something is ambiguous or requires a judgment call (product scope, design direction, data modeling), ask the user first — do not decide unilaterally. This applies across sessions, not just once.

---

## Design Philosophy — How to Use Reference Mockups

Two kinds of design references may be provided. Treat them differently:

**1. Figma mockups (mobile-only, ~375px)** — structural/content reference only, for pages not yet covered by a Stitch mockup, and for the eventual mobile responsive pass. Do not copy flat colors or exact pixel layout to desktop from these.

**2. Stitch-generated HTML/Tailwind mockups (desktop)** — **this is now the primary design system for the whole project** ("Design System v2" below), not just the page it was first shown on. Convert HTML mockups directly:
- Map each HTML section (marked with `<!-- BEGIN: XSection -->` comments) to the matching component in `Project Structure`
- Keep exact Tailwind utility classes and custom effect class names (`.liquid-glass`, `.liquid-glass-card`, etc.) — move raw CSS into `globals.css` and custom colors/shadows into `tailwind.config.ts`
- Convert `<img>` → `next/image`, `<a href="#">` → Next.js `<Link>` with the real route, static counts/copy → real data from services
- **Before wiring anything to real data, flag content that conflicts with MVP Scope Boundary** rather than implementing it silently (see resolved examples below, and ask before making a similar call on new mockups)

### Resolved scope conflicts (apply this pattern to future mockups too)

A Stitch mockup for `/search` included generic travel-app elements that conflicted with Doen Pa's scope. Resolutions (already decided, apply consistently):

| Mockup element | Replaced with |
|---|---|
| `★ 4.9 (420)` aggregate rating/review count | `"เคยไปแล้ว N ครั้ง"` — personal, computed from the current user's own `TravelRecord`s for that place. Omit the line entirely if N = 0. |
| `"เปิดรับจองแล้ว • ไฮซีซั่น"` booking-style status badge | A plain place-type badge (e.g. "ภูเขา", "น้ำตก", "ถ้ำ", "หมู่เกาะและทะเล") — same as `place.type`, no booking language |
| `"ยอดนิยมประจำฤดูหนาว"` / `"เปิดเส้นทางใหม่"` popularity filter pills | Real filters sourced from the user's own data: **"เคยไปแล้ว"** / **"ยังไม่เคยไป"** |

Never implement an aggregate public rating/review count, a booking-style availability badge, or popularity-sorted recommendations — these are out of MVP scope regardless of what a mockup shows. Ask before making an equivalent call on new mockups rather than assuming the same resolution applies verbatim.

### Images from Stitch mockups

Stitch mockup image URLs (`lh3.googleusercontent.com/aida-public/...`) are design-preview placeholders — not stable for production and not to be hotlinked. Replace every such URL with a plain gray placeholder (`bg-beige-100` or similar neutral fill, no image) for now. Real photos come later (either user-uploaded via `PhotoUploader` or a proper image source to be decided).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| State | Zustand |
| Icons | Lucide React (mockups may use inline SVG — convert to Lucide equivalents where a matching icon exists) |
| Fonts | Kanit + Plus Jakarta Sans (Google Fonts, Thai-friendly pairing) |
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
| `/search` | Home / Search | Search hero + category filter + recommended place list |
| `/places/[id]` | Place Details | **Full page, NOT a dialog/modal** |
| `/records/new` | Travel Record Form | Opened via `?placeId=[id]` query param |
| `/map` | Map | Full-page terrain map with pins for unique visited places |
| `/passport` | Passport | Filterable grid of TravelRecordCards |
| `/stats` | Stats | Hero stats, badges, province/category/region breakdown |
| `/profile` | Profile | Cover + avatar + stats + Post Gallery |

### User Flow

```
/search → click PlaceCard (via <Link>, no dialog)
        → /places/[id]
        → click "+ เพิ่มลงแพสพอร์ต" / "+ สแตมป์"
        → /records/new?placeId=[id]
        → submit → /passport
```

`/map`, `/passport`, `/stats`, `/profile` are reachable anytime from the capsule TopNav.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # TopNav + BottomNav wrapper, ambient background + contour pattern
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
│   ├── ui/                     # StatCard, GlassCard, GlassButton, GlassInput
│   ├── navigation/              # TopNav (capsule), BottomNav
│   ├── search/                  # SearchHero, CategoryGrid, CategoryCard, PlaceList, PlaceCard, VisitedFilter
│   ├── place/                   # BackButton, PlaceGallery, PlaceInfoPanel, PlaceChips, PlaceDescription, PlaceMeta, PlaceRecord, PlaceGuidelines, PlaceActions
│   │                             # (PlaceBreadcrumb from an earlier design is unused — no category/rank line on this page anymore)
│   ├── records/                 # TravelRecordForm, PhotoUploader
│   ├── map/                     # ThailandMap
│   ├── passport/                # PassportHeader, PassportFilter, TravelRecordCard
│   ├── stats/                   # StatsHero, BadgeTeaser, BadgeGrid, ProvinceProgress, CategoryStats, RegionStats
│   └── profile/                 # ProfileHeader, ProfileStats, PostGallery
│
├── services/
│   ├── place.service.ts        # searchPlaces, getPlaceById, filterByType
│   ├── travel-record.service.ts# getRecordsByUser, getRecordByPlace, getVisitCount, createRecord
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
type Difficulty = 'easy' | 'moderate' | 'challenging'

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
  category: string         // breadcrumb label e.g. "อุทยาน & ป่าสงวน"
  rankLabel?: string        // e.g. "ยอดเขาสูงลำดับที่ 3"
  description: string
  image: string             // placeholder path for now — see "Images from Stitch mockups"
  type: PlaceType
  difficulty?: Difficulty
  altitude?: string         // e.g. "2,225 m"
  distance?: string         // e.g. "5.2 km"
  bestSeason?: string       // static copy for now, e.g. "เปิดให้บริการทุกวัน ควรหลีกเลี่ยงช่วงฤดูฝน"
  campingInfo?: string      // static copy for now, e.g. "มีลานกางเต็นท์ให้บริการภายในพื้นที่อุทยาน"
  guidelines?: PlaceGuideline[]
}

interface PlaceGuideline {
  icon: string    // Lucide icon name, e.g. 'FileText', 'Leaf', 'Zap'
  title: string
  description: string
}

interface TravelRecord {
  id: string
  userId: string
  placeId: string
  visitedAt: Date
  note: string
  photos: string[]
  rating: number   // 1–5, personal only — NEVER aggregated into a public score/count
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

**Category labels (Thai, used on `/search` and `/passport`):** ทั้งหมด, ภูเขา & ยอดดอย, น้ำตก & ลำธาร, ถ้ำ & ธรณีสัณฐาน, หมู่เกาะ & ทะเล — each with a real count from `placeService` (e.g. "156 อุทยาน"), not a fake/hardcoded number.

**Visited-status filter (`/search`):** "เคยไปแล้ว" / "ยังไม่เคยไป" — computed by cross-referencing `placeService` results against `travelRecordService.getRecordsByUser(currentUserId)`.

---

## Design System v2 (Stitch — current source of truth, whole project)

### Colors — `tailwind.config.ts`

```typescript
extend: {
  fontFamily: {
    sans: ['Kanit', 'Plus Jakarta Sans', 'sans-serif'],
  },
  colors: {
    brand: {
      50: '#f0f9f3', 100: '#dcf0e2', 200: '#b8e1c6',
      500: '#2d6a4f', 600: '#1b4332', 700: '#153728',
      800: '#0f291e', 900: '#081c14', 950: '#04110c',
    },
    canvas: '#F4F2EB',
    beige: { 100: '#EDE8DD' },   // neutral gray-placeholder fill for missing images
  },
  boxShadow: {
    glass:        '0 8px 32px 0 rgba(20,48,30,0.08), inset 0 1px 1px 0 rgba(255,255,255,0.8), inset 0 -1px 1px 0 rgba(255,255,255,0.2)',
    'glass-hover':'0 20px 48px -6px rgba(18,50,32,0.16), 0 0 20px 2px rgba(167,243,208,0.35), inset 0 1.5px 2px 0 rgba(255,255,255,0.95)',
    'glass-card': '0 16px 40px -8px rgba(15,38,25,0.10), 0 2px 6px -1px rgba(0,0,0,0.04), inset 0 1.5px 2px 0 rgba(255,255,255,0.9), inset 0 -1px 1px 0 rgba(0,0,0,0.03)',
    'glass-inner':'inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.06)',
    'glow-emerald':'0 0 28px -2px rgba(45,106,79,0.5), 0 4px 16px rgba(45,106,79,0.25)',
    'liquid-glow': '0 10px 30px -5px rgba(52,211,153,0.25), inset 0 1px 1px rgba(255,255,255,0.8)',
  },
}
```

**Accent colors** (icons, badges, hover states) use Tailwind's default palette directly — `emerald`, `amber`, `cyan`, `teal` — no custom tokens needed for these. `brand-500`/`brand-600` are the primary brand green; `canvas` is the page background.

The earlier flat "forest/beige/gold/slate/cream" palette is retired — use the tokens above everywhere.

### Glass Effect Classes — `globals.css`

Copy verbatim into `globals.css`:

```css
.liquid-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 100%);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255,255,255,0.85);
  box-shadow: 0 12px 36px 0 rgba(18,48,32,0.07), inset 0 1.5px 1.5px 0 rgba(255,255,255,0.95), inset 0 -1px 1px 0 rgba(0,0,0,0.03);
}
.liquid-glass-dark {
  background: linear-gradient(135deg, rgba(15,41,30,0.78) 0%, rgba(8,28,20,0.85) 100%);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.22);
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.45);
}
.liquid-glass-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.48) 50%, rgba(240,249,244,0.45) 100%);
  backdrop-filter: blur(26px) saturate(190%);
  -webkit-backdrop-filter: blur(26px) saturate(190%);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 16px 42px -6px rgba(14,42,28,0.09), 0 2px 8px -1px rgba(0,0,0,0.03), inset 0 1.5px 2px 0 rgba(255,255,255,0.95), inset 0 -1.5px 2px 0 rgba(20,60,40,0.04);
}
.liquid-glass-capsule {
  background: linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.52) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 8px 30px rgba(18,48,32,0.07), inset 0 1.5px 1.5px rgba(255,255,255,0.95);
}
.hero-glass-console {
  background: linear-gradient(135deg, rgba(255,255,255,0.76) 0%, rgba(245,250,247,0.48) 100%);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1.5px solid rgba(255,255,255,0.85);
  box-shadow: 0 20px 50px -10px rgba(10,32,22,0.25), inset 0 2px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.05);
}

/* Ambient glow orbs — decorative, behind content, pointer-events: none */
.ambient-glow-mesh-1 { position:absolute; width:650px; height:650px; background:radial-gradient(circle, rgba(110,231,183,0.38) 0%, rgba(52,211,153,0.18) 45%, rgba(244,242,235,0) 70%); filter:blur(75px); z-index:0; pointer-events:none; animation: floatSlow 18s ease-in-out infinite alternate; }
.ambient-glow-mesh-2 { position:absolute; width:580px; height:580px; background:radial-gradient(circle, rgba(252,211,77,0.28) 0%, rgba(217,249,157,0.15) 45%, rgba(244,242,235,0) 70%); filter:blur(85px); z-index:0; pointer-events:none; animation: floatSlow 22s ease-in-out infinite alternate-reverse; }
.ambient-glow-mesh-3 { position:absolute; width:700px; height:700px; background:radial-gradient(circle, rgba(167,243,208,0.32) 0%, rgba(110,231,183,0.12) 50%, rgba(244,242,235,0) 75%); filter:blur(90px); z-index:0; pointer-events:none; }
@keyframes floatSlow { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(40px,-30px) scale(1.08); } }

/* Shimmer sweep on hover, for primary buttons */
.shimmer-glass { position:relative; overflow:hidden; }
.shimmer-glass::after { content:''; position:absolute; top:-60%; left:-80%; width:60%; height:220%; background:linear-gradient(60deg, transparent, rgba(255,255,255,0.42), transparent); transform:rotate(25deg); transition: all 0.85s cubic-bezier(0.4,0,0.2,1); }
.shimmer-glass:hover::after { left:140%; }

/* Subtle dotted topographic background pattern */
.contour-pattern {
  background-image: radial-gradient(rgba(45,106,79,0.07) 1px, transparent 1px), radial-gradient(rgba(45,106,79,0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  background-position: 0 0, 14px 14px;
}
```

Apply `.contour-pattern` + ambient glow orb `<div>`s once in the root layout (`src/app/layout.tsx`), not per-page — they're a shared background treatment.

### Border Radius
```
Nav capsule:    rounded-full
Cards:          rounded-3xl (24px)
Buttons:        rounded-2xl (16px) primary, rounded-xl (12px) secondary
Badges/pills:   rounded-full
```

### Image placeholders
Anywhere a Stitch mockup used a real photo (`<img src="lh3.googleusercontent.com/...">`), render a plain neutral fill instead until real images are ready:
```tsx
<div className="w-full h-full bg-beige-100 flex items-center justify-center text-brand-800/30">
  {/* no icon needed — plain placeholder */}
</div>
```

---

## Navigation (capsule style)

**Desktop:** `TopNav` is a **floating capsule**, not an edge-to-edge bar — `sticky top-4`, wrapped in a `max-w-7xl mx-auto` container with horizontal padding, `.liquid-glass-capsule` background, `rounded-full`, `shadow-glass hover:shadow-glass-hover`.

```
[Logo + wordmark]   [pill nav: ค้นหา (active, filled gradient) | แผนที่ | พาสปอร์ต ● | สถิติ | โปรไฟล์]   [avatar pill: "N  นักท่องไพร"]
```

- Nav links sit inside an inner pill (`bg-brand-900/[0.04] rounded-full p-1.5`); the active link has a filled gradient background (`from-brand-600 to-emerald-700`), inactive links are transparent with `text-brand-800/80 hover:bg-white/70`
- A small animated ping dot next to "พาสปอร์ต" indicates unviewed activity (e.g. a new badge earned) — cosmetic only, not a notification system
- User avatar pill on the right shows initials + display name; this is mock/local user data, not real auth
- `TopNav` must be a Client Component (`usePathname()` for active state)

**Mobile:** collapses to logo + hamburger; `BottomNav` (same 5 routes) remains the primary mobile navigation.

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
- `SearchHero`'s search input, `CategoryGrid` filter state, `VisitedFilter` — interactive
- `TravelRecordForm`, `PhotoUploader` — form state, FileReader API
- `ThailandMap` — Leaflet requires the browser; also needs `dynamic(() => import(...), { ssr: false })` in the page that renders it
- `PassportFilter` / `/passport/page.tsx` — client-side filtering by type
- `BottomNav` — uses `usePathname()` to highlight active tab
- `PlaceActions` — uses `useRouter()` to navigate to `/records/new`
- `BackButton` — uses `router.back()`
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
- No hardcoded data inside components — use mocks or services (exception: `bestSeason`/`campingInfo` static copy, explicitly marked `// TODO` until real data exists)
- Every component must handle: default, loading, empty, error states

---

## Page Specs

### `/search`
- `SearchHero` (Server, wraps a Client search input): full-width `rounded-3xl` panel with a **gray placeholder background** (not a photo — see Image placeholders), dark gradient overlay for text contrast, centered headline + subheadline, `.hero-glass-console` search bar (icon + input + submit button with `.shimmer-glass`), row of popular-search tag pills below (must link to real search queries, not decorative)
- `CategoryGrid`: 5 `CategoryCard`s (`.liquid-glass-card`, `rounded-3xl`) — icon, label, real count from `placeService`. Active category gets `border-2 border-emerald-500/80` + `shadow-liquid-glow` + top gradient rim
- `VisitedFilter`: pill row — "เคยไปแล้ว" / "ยังไม่เคยไป" (real filter, see Data Models)
- `PlaceList`: section header ("สถานที่แนะนำ" + total count) + `VisitedFilter` + grid of `PlaceCard`s
- `PlaceCard` (`.liquid-glass-card`, `rounded-3xl`):
  - Image area: gray placeholder (see Image placeholders), gradient overlay, bookmark icon button top-right
  - Top-left badge over image: **place type** (ภูเขา / น้ำตก / ถ้ำ / หมู่เกาะและทะเล) — not a booking status
  - Altitude pill bottom-left over image (if `place.altitude` exists)
  - Body: title, location, description
  - Footer row: **"เคยไปแล้ว N ครั้ง"** (only rendered if N > 0, computed from the current user's own records — never a public count) • distance, then CTA button "+ สแตมป์" / "+ เพิ่มลงแพสพอร์ต"
  - Whole card wrapped in `<Link href={/places/[id]}>`

### `/places/[id]` (v2 — redesigned per Stitch mockup, decisions locked below)
- Full page (not a modal). `notFound()` if place doesn't exist.
- `BackButton` ("← ย้อนกลับ") above the two-column layout — pill shape (`.liquid-glass-capsule` or `.liquid-glass`), arrow icon slides left on hover
- Desktop: two columns, `gap-8` to `gap-12` —
  - **Left:** `PlaceGallery` (no box — image sits directly on page background, matching the gallery-only side)
  - **Right:** `PlaceInfoPanel` — **wrapped in a `.liquid-glass-card` box** (`rounded-3xl`, generous padding `p-6` to `p-9`, `shadow-glass-card`) — *this reverses an earlier "no boxed card" decision; the box is back, styled with Design System v2 classes, not the mockup's own `.ultra-glass-panel`*
- Inside `PlaceInfoPanel`, top to bottom: name → location row (province chip + region chip, each as a small `.liquid-glass` pill) → `PlaceChips` → `<hr>` → "เกี่ยวกับสถานที่" + description → `PlaceMeta` (two `.liquid-glass-card` tiles side by side: ช่วงเวลาเปิดปิด / จุดกางเต็นท์ — static copy for now) → `PlaceRecord` (only if user has a TravelRecord here) → `PlaceActions` (primary button + bookmark only — **no share button**)
- `PlaceChips` order (locked): **ประเภท → ความสูง → ระยะทาง** (type → altitude → distance) — each chip is a small icon-in-rounded-square + label, `.liquid-glass` pill background
- `PlaceRecord` (only if visited): pulsing green status dot + "คุณเคยไปที่นี่แล้ว" + date pill (right-aligned) → star rating (personal, read-only) → quote with a left accent border — no aggregate score anywhere
- `PlaceGallery`: main image area is a gray placeholder unless the user's own TravelRecord for this place has photos (then show the user's first uploaded photo); below it, a 3-up thumbnail row of the user's *other* uploaded photos for this place **only when they exist** — if the user has never uploaded photos here, no thumbnail row renders at all. Overflow beyond 3 thumbnails shows an empty `+N ภาพถ่าย` card (no photo behind the number, just the count)
- Below the two-column layout: `PlaceGuidelines` — 3-card grid, only rendered if `place.guidelines` has entries
- **Dropped from this page** (per redesign): trail-route breakdown section, "เกี่ยวกับสถานที่ & ข้อปฏิบัติ" regulations block, emergency contact card, aggregate rating display, booking-status breadcrumb badge, "Doen Pa Passport" digital stamp graphic widget — none of these are implemented

### `/records/new`
- Reads `placeId` from `searchParams`; redirect to `/search` if place not found
- `TravelRecordForm` (Client), centered `max-w-xl`: place info (read-only) → date → `PhotoUploader` (max 5 photos, 5MB each, jpg/png/webp) → note textarea → optional 1–5 star rating (**personal only** — never displayed elsewhere as an aggregate) → submit
- On submit: `travelRecordService.createRecord()` then redirect to `/passport`

### `/map`
- Full-viewport Leaflet map of Thailand (`ThailandMap`, dynamic-imported with `ssr: false`); the map extends behind the floating TopNav and mobile BottomNav
- Pins only for unique visited places with valid `latitude`/`longitude`; do not shade provinces by visited status
- Floating `.liquid-glass` badge pill top-center: "สถานที่ที่ไปแล้ว X แห่ง" (unique places)
- Selecting a pin opens a display-only place card at the bottom on mobile and desktop: user's record photo when available, name, distance, altitude. The card does not navigate.
- GeoJSON at `public/data/thailand.json` may show neutral province outlines as map context

### `/passport`
- `PassportHeader`: avatar + username + 3 `StatCard`
- Filter row: same category pills as `/search`
- Grid of `TravelRecordCard`, desktop 2–3 col
- Empty state: "แพสพอร์ตของคุณยังว่างเปล่า" + CTA to `/search`

### `/stats`
- `StatsHero`: "X การเดินทาง" + 3 `StatCard` — provinces / regions / photos
- `BadgeTeaser`: next badge to earn + progress bar
- `BadgeGrid`: "ตราสะสม (X/14)" + see-all link
- `ProvinceProgress`: "X/77 จังหวัด" progress bar + hint text
- `CategoryStats`: grid — count per type
- `RegionStats`: list per region, progress bar + visited provinces; 0-visit regions at reduced opacity

### `/profile`
- `ProfileHeader`: cover + "แก้ไขโปรไฟล์" button + avatar + name + bio
- `ProfileStats`: 3 `StatCard`
- `PostGallery`: grid of all photos across the user's TravelRecords, tiles link to `/places/[placeId]`

---

## Map Integration

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

- GeoJSON: download Thailand provinces boundary data, save to `public/data/thailand.json`
- `ThailandMap` is dynamically imported by `DynamicThailandMap` with `{ ssr: false }`:

```typescript
const ThailandMap = dynamic(() => import('@/components/map/ThailandMap'), { ssr: false })
```

- Pins are driven by the current user's valid TravelRecords joined with Places and deduplicated by `placeId`. Records with no matching Place do not count.

---

## Coding Standards

### Do
```typescript
interface PassportEntryProps {
  record: TravelRecord
  place: Place
}

const getVisitedProvinces = (records: TravelRecord[]) => { ... }

const places = await placeService.search(query)
```

### Don't
```typescript
const data: any = await fetch(...)          // no any

const blur = 10                               // ❌ magic number
const GLASS_BLUR_DESKTOP = 10                 // ✅

className="text-[13px] mt-[17px] w-[437px]"   // ❌ arbitrary values
className="text-sm mt-4 w-full"               // ✅

'use client'   // only when actually needed
```

---

## Before Writing Any Code

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

If any step surfaces a genuine ambiguity (scope, data shape, design intent), ask before proceeding rather than picking an assumption silently.

---

## Responsive Breakpoints

```
Mobile:        320–767px   → 1 column, 16px padding, blur 8-12px
Tablet:        768–1023px  → 2 columns, 20px padding, blur 12-16px
Desktop:       1024px+     → 3–4 columns, 24px padding, blur 20-30px (full glass effect)
Large Desktop: 1440px+     → max-width 1280–1440px, centered
```

Desktop is built first. Mobile responsive pass references Figma's mobile structure for pages without a Stitch mockup; for pages with a Stitch mockup, reduce blur/effect intensity for mobile performance but keep the same visual language.

Mobile performance:
- Reduce `backdrop-filter` blur (e.g. 24px → 12px) and disable ambient glow orb animation
- Touch targets minimum `44×44px`
- No hover-only interactions

---

## Accessibility Requirements

- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`, etc.)
- `aria-label` on icon-only buttons
- `alt` text on all meaningful images; empty `alt=""` for decorative backgrounds/glow orbs/placeholders
- Visible focus states
- Color contrast WCAG AA minimum — verify white text over dark overlays has sufficient contrast
- `prefers-reduced-motion` support — disable `ambient-glow-mesh` animation, `shimmer-glass`, and the nav ping dot

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## UI States (Required for Every Interactive Component)

| State | Required |
|-------|----------|
| Default / Hover / Active / Focus / Disabled | ✅ |
| Loading / Empty / Error / Success | ✅ |

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

- File types: `jpg`, `png`, `webp` only
- Max size: 5MB per image, max 5 images per TravelRecord
- Preview before save, remove/replace per image, accessible `alt` text input, upload progress + error states
- MVP (no backend): `FileReader` API + localStorage

---

## Performance Checklist

- [ ] Server Component where possible
- [ ] Images via `next/image` with proper `width`/`height`/`fill`, `alt` (once real images replace placeholders)
- [ ] Heavy components via `dynamic()`
- [ ] Suspense boundaries for async data
- [ ] No unnecessary client-side fetching
- [ ] Bundle size checked
- [ ] Lighthouse mobile score ≥ 90 (glass effects are blur-heavy — profile carefully)

---

## Design Review Checklist

- [ ] Layout, spacing, typography, contrast
- [ ] Design System v2 tokens used correctly (not legacy forest/beige/gold, not ad-hoc colors)
- [ ] Glass effects match the reference mockup's class names/values
- [ ] Component consistency across pages
- [ ] Responsive, accessible, all UI states handled
- [ ] **No public rating/review counts, no booking-style badges, no popularity-ranked recommendations** — flag and ask before implementing if a new mockup includes these

Be direct. Identify problems and propose fixes rather than silently implementing scope-conflicting content or making the call alone.

---

## MVP Scope Boundary

Always ask: **"Does this help users record their hiking memories?"**

```
✅ IN MVP:
   Search & Discovery
   Place Details
   Add to Passport
   Travel Record (date, photos, note, personal rating)
   Passport View
   Map — visited-place pins on a terrain map (Leaflet, no GPS/routing)
   Stats + Badge Collection
   Profile

❌ NOT IN MVP:
   Social features (follow, like, comment, share)
   Public profiles, public review system, aggregate ratings/review counts
   Booking or payment, booking-style availability badges
   Trip planning / route navigation / turn-by-turn directions
   Live GPS tracking
   Weather data
   Gear management
   Recommendation engine / popularity-based sorting
   Activity feed
   Messaging
```

**Note:** `/map` shows the user's visited places as pins, not a trip planner or GPS navigator. A visually appealing mockup (e.g. from Stitch) may include elements from the "NOT IN MVP" list purely because it's a generic template — always flag and ask before wiring such content to real data, even if a similar case was resolved before.

---

## Architecture Scalability

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

Service layer must be abstracted so switching from mock data to a real API requires only changing the service file, not the UI components.

---

## Quick Reference

```bash
pnpm dev
pnpm type-check
pnpm lint
pnpm build
```

---

> 🥾 **Doen Pa** — Your hikes. Your memories. Your passport.
