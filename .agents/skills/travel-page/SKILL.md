---
name: Travel Page Architecture
description: >-
  Architecture, data schema, component patterns, and CSS conventions for the
  /travel page redesign. Use this skill when implementing the travel page
  redesign, adding new countries, adding new destinations, adding new
  destination types (trek/hike/city/etc.), updating TravelPage.tsx, Travel.css,
  or the travelData section of portfolio.ts. Triggers on "travel page",
  "travelData", "add country", "add destination", "trek card", "hike card",
  "country tabs", "type filter", "destination grid".
---

# Travel Page Architecture

The `/travel` page uses a **fully scalable, country-agnostic architecture**. Adding any new country or destination type requires editing only `portfolio.ts` — zero changes to `TravelPage.tsx` or `Travel.css`.

**Full design plan:** `docs/Travel_Page_Redesign_Plan.local.md`

---

## Core Principle

All page content is driven by `travelData.countries[]` in `src/portfolio.ts`. The UI auto-generates:

- Country tabs from `countries[]`
- Type filter chips from unique `destinations[].type` values per country
- Destination cards from `destinations[]` with smart field rendering per `type`

---

## Data Schema (`src/portfolio.ts`)

### `travelData` top-level shape

```typescript
export const travelData = {
  tagline: string,
  heroStats: Array<{ value: string; label: string }>,
  countries: CountryEntry[],
};
```

### `CountryEntry` shape

```typescript
{
  id: string,           // URL-safe slug, used as tab ID and anchor
  name: string,         // Display name
  flag: string,         // Emoji flag
  tagline: string,      // One-line country tagline shown in story section
  accentColor: string,  // Hex color, drives tab highlight + card hover glow
  coverTheme: string,   // CSS class suffix for cover background variant
  destinations: DestinationEntry[],
}
```

### `DestinationEntry` shape

```typescript
{
  id: string,
  name: string,
  type: DestinationType,     // see type registry below
  region: string,
  emoji: string,
  description: string,
  blogSlug: string | null,   // null = "Coming Soon"; string = "Read Story" link

  // Trek-specific optional fields (type === "trek")
  elevation?: string,        // e.g. "4,130m"
  duration?: string,         // e.g. "12 days"
  difficulty?: "Easy" | "Moderate" | "Strenuous",
  highlight?: string,        // one-sentence memorable moment (shown as italic quote)

  // Hike-specific optional fields (type === "hike")
  elevation?: string,        // shown as plain stat, no gradient bar
  duration?: string,         // e.g. "Half day", "Full day", "1-2 days"
  difficulty?: "Easy" | "Moderate" | "Strenuous",
  highlight?: string,
}
```

### Destination Type Registry

| Type        | Description                      | Card shows                                                                  |
| ----------- | -------------------------------- | --------------------------------------------------------------------------- |
| "trek"      | Multi-day mountain expedition    | Elevation gradient bar + days + difficulty badge + highlight quote          |
| "hike"      | Short or day hike (1-2 days max) | Duration badge (clock icon) + plain elevation stat + difficulty + highlight |
| "city"      | City or region visit             | Emoji + region badge + description only                                     |
| "road-trip" | Driving route or road adventure  | Emoji + region badge + description only                                     |
| "nature"    | Nature site, national park, lake | Emoji + region badge + description only                                     |
| "moto"      | Motorcycle route                 | Emoji + region badge + description only                                     |

To add a new type: add the type string to portfolio.ts and a .dest-type-{typename} CSS class. No TSX logic changes needed.

---

## Current Country Data

### Nepal (id: "nepal", accentColor: "#DC143C")

| Name                 | Type | Region    | Elevation | Duration | Difficulty |
| -------------------- | ---- | --------- | --------- | -------- | ---------- |
| Annapurna Base Camp  | trek | Annapurna | 4,130m    | 12 days  | Moderate   |
| Tilicho Lake         | trek | Annapurna | 4,919m    | 14 days  | Strenuous  |
| Gosaikunda           | trek | Langtang  | 4,380m    | 7 days   | Moderate   |
| Upper Mustang        | trek | Mustang   | 3,800m    | 10 days  | Moderate   |
| Badimalika           | trek | Far West  | 4,542m    | 8 days   | Strenuous  |
| Aama Yangri          | hike | Langtang  | 2,520m    | 1-2 days | Easy       |
| Pokhara Day Hike     | hike | Annapurna | 827m      | Half day | Easy       |
| Pokhara              | city | Annapurna | n/a       | n/a      | n/a        |
| Nepal Mountain Roads | moto | Far West  | n/a       | n/a      | n/a        |

### USA (id: "usa", accentColor: "#1E6FA8")

| Name                  | Type      | Region            |
| --------------------- | --------- | ----------------- |
| Crater Lake Rim Walk  | hike      | Oregon            |
| California Dunes Hike | hike      | Pacific Coast     |
| Corvallis, Oregon     | city      | Pacific Northwest |
| Oregon Coast Drive    | road-trip | Pacific Coast     |
| Texas                 | city      | South             |
| Bentonville, Arkansas | city      | Midwest           |
| Iowa                  | city      | Midwest           |
| Virginia / DC Metro   | city      | East Coast        |
| Las Vegas, Nevada     | city      | Southwest         |
| Arizona               | nature    | Southwest         |

---

## Component Architecture (TravelPage.tsx)

### State

```typescript
const [activeCountry, setActiveCountry] = useState(travelData.countries[0].id);
const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");
// Reset activeTypeFilter to "all" whenever activeCountry changes
```

### Render functions

| Function                                   | Purpose                                                         |
| ------------------------------------------ | --------------------------------------------------------------- |
| renderHero()                               | 100vh cinematic hero, auto-reads travelData.heroStats[]         |
| renderStorySection()                       | Personal narrative split layout                                 |
| renderCountryTabs()                        | Maps over travelData.countries[] to generate tabs               |
| renderTypeFilterChips(country)             | Derives unique types from country.destinations[], renders chips |
| renderDestinationGrid(country, typeFilter) | Filters destinations by type, maps to cards                     |
| renderDestinationCard(dest, accentColor)   | Smart card with conditional fields per dest.type                |
| renderMissionStatement()                   | Nepal tourism callout (hardcoded, personal)                     |
| renderMotoSection()                        | Full-width cinematic moto banner                                |
| renderSubscribeCta()                       | Subscribe CTA strip                                             |

### Type filter chip generation

```typescript
const renderTypeFilterChips = (country: CountryEntry) => {
  const types = [
    "all",
    ...Array.from(new Set(country.destinations.map((d) => d.type))),
  ];
  return types.map((type) => (
    <button
      key={type}
      className={`type-chip ${activeTypeFilter === type ? "active" : ""}`}
      style={
        activeTypeFilter === type
          ? { backgroundColor: country.accentColor }
          : {}
      }
      onClick={() => setActiveTypeFilter(type)}
    >
      {TYPE_LABELS[type] ?? type}
    </button>
  ));
};
```

### Card smart conditional rendering

```typescript
const renderDestinationCard = (dest: DestinationEntry, accentColor: string) => {
  const isTrek = dest.type === "trek";
  const isHike = dest.type === "hike";
  const hasTrail = isTrek || isHike;
  return (
    <div
      className={`destination-card dest-type-${dest.type}`}
      style={{ "--travel-accent": accentColor } as React.CSSProperties}
    >
      <span className="dest-emoji">{dest.emoji}</span>
      <span className="dest-region-badge">{dest.region}</span>
      <h3 className="dest-name">{dest.name}</h3>
      {isTrek && dest.elevation && (
        <div
          className="trek-elevation-bar"
          style={
            {
              "--elevation-pct": getElevationPct(dest.elevation),
            } as React.CSSProperties
          }
        />
      )}
      {hasTrail && dest.difficulty && (
        <span
          className={`difficulty-badge diff-${dest.difficulty.toLowerCase()}`}
        >
          {dest.difficulty}
        </span>
      )}
      {hasTrail && dest.duration && (
        <span className="duration-badge">{dest.duration}</span>
      )}
      {isHike && dest.elevation && (
        <span className="hike-elevation-stat">{dest.elevation}</span>
      )}
      {hasTrail && dest.highlight && (
        <p className="dest-highlight">{dest.highlight}</p>
      )}
      <p className="dest-description">{dest.description}</p>
      {dest.blogSlug ? (
        <a href={`/blogs/${dest.blogSlug}`} className="read-story-btn">
          Read Story
        </a>
      ) : (
        <span className="coming-soon-badge">Coming Soon</span>
      )}
    </div>
  );
};

// Elevation gradient bar helper
const getElevationPct = (elevation: string): string => {
  const meters = parseInt(elevation.replace(/[^0-9]/g, ""), 10);
  const MAX_ELEV = 6000; // 6000m = 100%
  return `${Math.min((meters / MAX_ELEV) * 100, 100)}%`;
};
```

---

## CSS Architecture (Travel.css)

### CSS Custom Properties

```css
.travel-page {
  --travel-accent: #dc143c; /* overridden per-country via inline style */
  --travel-bg-deep: #0a0f1e;
  --travel-amber: #f5a623;
  --travel-snow: #f8f9fa;
  --travel-mist: #8b9bb4;
}
```

### Key CSS Classes

| Class                            | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| .travel-hero                     | 100vh hero with background image + overlay gradient              |
| .travel-hero-stats               | Bottom stats strip (flex row of stat items)                      |
| .travel-story-section            | Two-column personal narrative split                              |
| .travel-country-tabs             | Large country tab bar (flag + name)                              |
| .travel-country-tab.active       | Active tab: border-bottom + accent color text                    |
| .travel-type-chips               | Smaller secondary chip row                                       |
| .type-chip.active                | Active chip: background = var(--travel-accent)                   |
| .destination-grid                | CSS Grid: 3-col to 2-col at 900px to 1-col at 480px              |
| .destination-card                | Base card: border, radius 14px, hover lift                       |
| .dest-type-trek                  | Trek card modifier (adds elevation bar layout space)             |
| .dest-type-hike                  | Hike card modifier (lighter visual weight)                       |
| .dest-type-city                  | City card modifier                                               |
| .dest-type-road-trip             | Road trip card modifier                                          |
| .dest-type-nature                | Nature card modifier                                             |
| .dest-type-moto                  | Moto card modifier                                               |
| .trek-elevation-bar              | Gradient bar green to amber to red, width = var(--elevation-pct) |
| .difficulty-badge.diff-easy      | Green badge (#2ea043)                                            |
| .difficulty-badge.diff-moderate  | Amber badge (#d29922)                                            |
| .difficulty-badge.diff-strenuous | Red badge (#da3633)                                              |
| .coming-soon-badge               | Red pill badge                                                   |
| .read-story-btn                  | Accent-colored "Read Story" link button                          |
| .travel-mission-statement        | Nepal tourism callout with left red border                       |
| .travel-moto-banner              | Full-width dark moto section                                     |
| .travel-subscribe-cta            | Subscribe strip                                                  |

### Hover glow (country-specific accent color)

```css
.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--travel-accent) 20%, transparent);
}
```

### Responsive breakpoints

```css
@media (max-width: 900px) {
  .destination-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .destination-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .travel-story-section {
    flex-direction: column;
  }
}
```

---

## How to Add a New Country

Step 1: Add to portfolio.ts inside travelData.countries[]:

```typescript
{
  id: "japan",
  name: "Japan",
  flag: "JP_EMOJI",
  tagline: "Temples, ramen, and bullet trains.",
  accentColor: "#BC002D",
  coverTheme: "japan",
  destinations: [
    {
      id: "fuji",
      name: "Mt. Fuji",
      type: "hike",
      region: "Chubu",
      emoji: "MOUNTAIN_EMOJI",
      description: "Iconic volcanic summit hike at dawn.",
      elevation: "3,776m",
      duration: "1 day",
      difficulty: "Moderate",
      highlight: "Watching sunrise above the clouds from the summit.",
      blogSlug: null,
    },
  ],
},
```

Step 2: Update docs/travel-content-plan.local.md with planned post outlines.

Step 3: Done. New tab and cards auto-appear. No TSX changes needed.

When publishing a blog post, set blogSlug: "your-blog-slug". Coming Soon auto-converts to Read Story.

---

## How to Add a New Destination Type

1. Add the destination to portfolio.ts with the new type string (e.g. "beach")
2. Add TYPE_LABELS["beach"] = "Beach" to the label map in TravelPage.tsx
3. Add .dest-type-beach CSS class in Travel.css
4. No other changes needed, the chip and grid auto-include it

---

## Content Plan Tracking

Travel post planning is tracked in `docs/blog-content-plan.local.md` under Phases 9 & 10.

When a post is drafted:

1. Create `docs/blog{N}_content.local.md` with the full draft
2. Follow Blog Writing Patterns skill conventions
3. When published: set `blogSlug` in `portfolio.ts` to convert "Coming Soon" badge to "Read Story" link

---

## Design Tokens

| Token           | Value     | Usage                                     |
| --------------- | --------- | ----------------------------------------- |
| Nepal accent    | `#DC143C` | Nepal tabs, card glow, mission border     |
| USA accent      | `#1E6FA8` | USA tabs, card glow                       |
| Deep night      | `#0A0F1E` | Hero background, moto banner              |
| Amber           | `#F5A623` | Hero stats strip, elevation bar mid-point |
| Snow            | `#F8F9FA` | Hero headline text                        |
| Mountain mist   | `#8B9BB4` | Subtitle text, meta labels                |
| Easy badge      | `#2ea043` | Green                                     |
| Moderate badge  | `#d29922` | Amber                                     |
| Strenuous badge | `#da3633` | Red                                       |

---

## Architecture Roadmap (Phases 1-5)

| Phase | Feature                                      | Status     | Tech Stack            |
| ----- | -------------------------------------------- | ---------- | --------------------- |
| 1     | `TravelPage` redesign & `countries[]` schema | ✅ Merged  | React, CSS            |
| 2     | Interactive Travel Map                       | ⏳ Planned | Mapbox GL, GeoJSON    |
| 3     | S3 Photo Galleries + Lightbox                | ⏳ Planned | S3, CloudFront WebP   |
| 4     | Destination Detail Pages (`/travel/:c/:d`)   | ⏳ Planned | React Router, JSON-LD |
| 5     | D3.js Elevation Profiles                     | ⏳ Planned | D3.js, SVG            |

### Schema Additions (Phases 2-5)

The `DestinationEntry` interface will be extended with:

- `coordinates?: [number, number]` (Phase 2)
- `galleryImages?: GalleryImage[]` (Phase 3)
- `elevationProfile?: ElevationPoint[]` (Phase 5)
