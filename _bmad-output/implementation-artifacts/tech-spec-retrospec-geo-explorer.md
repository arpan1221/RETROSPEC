---
title: 'RETROSPEC Geographic Explorer'
slug: 'retrospec-geo-explorer'
created: '2026-03-22'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['next.js 14+ app router', 'typescript', 'tailwind css v4', 'mapbox-gl', 'react-map-gl', 'framer-motion', 'vercel']
files_to_modify: []
files_to_create:
  - 'web/package.json'
  - 'web/tsconfig.json'
  - 'web/next.config.js'
  - 'web/tailwind.config.ts'
  - 'web/.env.local'
  - 'web/app/layout.tsx'
  - 'web/app/page.tsx'
  - 'web/app/globals.css'
  - 'web/components/Hero.tsx'
  - 'web/components/Map.tsx'
  - 'web/components/MapClusters.tsx'
  - 'web/components/CityPanel.tsx'
  - 'web/components/MapProvider.tsx'
  - 'web/components/EntityDetail.tsx'
  - 'web/components/EntityDetail/EventDetail.tsx'
  - 'web/components/EntityDetail/PersonDetail.tsx'
  - 'web/components/EntityDetail/OrgDetail.tsx'
  - 'web/components/EntityDetail/ModelDetail.tsx'
  - 'web/components/ConnectionsGraph.tsx'
  - 'web/components/EpochTimeline.tsx'
  - 'web/components/Sidebar.tsx'
  - 'web/components/SearchBar.tsx'
  - 'web/components/ContributeCTA.tsx'
  - 'web/lib/data.ts'
  - 'web/lib/locations.ts'
  - 'web/lib/types.ts'
  - 'web/lib/flyover.ts'
  - 'web/data/locations.json'
code_patterns: ['app-router', 'server-components', 'static-generation', 'client-islands']
test_patterns: []
---

# Tech-Spec: RETROSPEC Geographic Explorer

**Created:** 2026-03-22

## Overview

### Problem Statement

RETROSPEC's 170+ entries exist as raw JSON files on GitHub. Human users (educators, journalists, policymakers) need a visual, explorable interface to discover AI history. No web interface exists yet. The geographic dimension of AI history — where breakthroughs happened — is completely invisible in the current file-based structure.

### Solution

A Next.js web app with an interactive Mapbox GL geographic map as the hero feature. AI history events, people, organizations, and models are plotted on a world map with clustered city pins. Clicking a city expands to show all entries at that location. A timeline slider filters by epoch, a sidebar provides epoch exploration and search, and entity detail panels show full entry data with navigation to connected entries.

### Scope

**In Scope:**
- Next.js 14+ App Router with Tailwind CSS, deployed on Vercel
- Mapbox GL JS map (via react-map-gl) with clustered city pins
- Location index file mapping cities to coordinates + associated entities
- Click-to-expand city clusters showing all entries at that location
- Epoch timeline slider for filtering
- Sidebar with epoch explorer and entity search
- Entity detail panel/modal with full data and connected entry navigation
- Hero section with RETROSPEC branding and tagline
- Static data loading from JSON files at build time
- Auto-redeploy on Vercel on push to main

**Out of Scope:**
- MCP server (Phase 2)
- npm/Python packages (Phase 2)
- User authentication
- Real-time data / API endpoints
- Embeddings / semantic search (Phase 2)
- Mobile-native app

## Context for Development

### Confirmed Clean Slate

No existing frontend. No package.json, no Next.js config. The web app will live in a `web/` subdirectory to keep the data repository root clean.

### Data Layer (Existing)

| Category | Count | Location |
|---|---|---|
| Events | 46 | `events/*.json` |
| People | 29 | `entities/people/*.json` |
| Organizations | 12 | `entities/organizations/*.json` |
| Models | 5 | `entities/models/*.json` |
| Papers | 8 | `papers/*.json` |
| Concepts | 8 | `concepts/*.json` |
| Cycles | 6 | `cycles/*.json` |
| Lineage | 34 | `lineage/**/*.json` |
| Graphs | 4 | `graphs/*.json` |
| Epochs | 11 | `epochs/*/epoch.json` |

### Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App location | `web/` subdirectory | Keep data repo root clean |
| Rendering | Static Generation (SSG) | Data changes only on commits, not runtime |
| Data loading | Build-time import from `../` | JSON files read at build, bundled as static props |
| Map library | react-map-gl (Mapbox GL JS) | Beautiful, customizable, clustering built-in |
| Clustering | Mapbox supercluster via react-map-gl | Native cluster support with count badges |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration |
| Animations | Framer Motion | Smooth panel slides, cluster expansion |
| Location data | `web/data/locations.json` | Single source of truth for city → coords + entities |
| TypeScript | Yes | Type safety for JSON data shapes |
| Deployment | Vercel | Auto-deploy on push, Next.js optimized |

### Location Index Design

`web/data/locations.json` — maps cities to coordinates and associated entities:
```json
{
  "locations": [
    {
      "id": "san_francisco",
      "name": "San Francisco, USA",
      "lat": 37.7749,
      "lng": -122.4194,
      "entities": ["org_openai", "org_anthropic"],
      "events": ["evt_2022_chatgpt_launch", "evt_2023_gpt4_released"],
      "significance_sum": 26,
      "epoch_range": ["08_transformer_age", "09_generative_explosion"]
    }
  ]
}
```

### Component Architecture

```
web/
├── app/
│   ├── layout.tsx          — Root layout, Mapbox CSS, fonts, metadata
│   ├── page.tsx            — Main page (SSG, loads all data at build)
│   └── globals.css         — Tailwind base + custom map styles
├── components/
│   ├── Hero.tsx            — Branding, tagline, animated stats, constellation bg
│   ├── MapProvider.tsx     — React context: selectedLocation, selectedEntity, activeEpoch
│   ├── Map.tsx             — Mapbox GL wrapper, camera, flyTo transitions
│   ├── MapClusters.tsx     — Cluster layer with pulsing glow pins, count badges
│   ├── CityPanel.tsx       — Slide-in panel: entries at a location
│   ├── EntityDetail.tsx    — Router delegating to type-specific detail components
│   ├── EntityDetail/
│   │   ├── EventDetail.tsx     — Event-specific layout (counterfactual, timeline)
│   │   ├── PersonDetail.tsx    — Person-specific layout (influence chains)
│   │   ├── OrgDetail.tsx       — Org-specific layout (models, founders)
│   │   └── ModelDetail.tsx     — Model-specific layout (lineage path)
│   ├── ConnectionsGraph.tsx — Mini radial graph of immediate entity connections
│   ├── EpochTimeline.tsx   — Horizontal slider with animated camera + fade transitions
│   ├── Sidebar.tsx         — Epoch list, category filters
│   ├── SearchBar.tsx       — Fuzzy search across all entities
│   └── ContributeCTA.tsx   — "Know AI history? Contribute" banner
├── lib/
│   ├── data.ts             — Build-time JSON loading + indexing
│   ├── locations.ts        — Location filtering + epoch range logic
│   ├── types.ts            — TypeScript interfaces for all entry types
│   └── flyover.ts          — Keyframe sequence for automated city flyover
├── data/
│   └── locations.json      — Geographic index
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── .env.local              — NEXT_PUBLIC_MAPBOX_TOKEN
```

### Visual Design System (Party Mode Recommendations)

**Color Palette:**
- Background: `#0a0a0f` (near-black with blue hint)
- Surface: `#141420` (cards, panels)
- Amber primary: `#f59e0b` (pins, highlights, active states)
- Amber glow: `#f59e0b33` (halos behind high-significance pins)
- Text primary: `#e2e8f0` (warm off-white)
- Text muted: `#94a3b8`
- Epoch-specific hue shifts: cool blue (early eras) → warm amber (modern)

**Typography:**
- Title/brand: Playfair Display (serif) — historical gravitas
- Body/UI: Inter (sans-serif) — modern clarity
- Contrast says "historical archive meets cutting-edge technology"

**Pin Design:**
- High-significance cities (significance_sum > 20): **pulsing glow effect** with radial gradient animation
- Standard pins: solid amber dots sized by significance
- On hover: scale 1.1 lift with tooltip (city name + entry count)
- Cluster pins: larger circle with count badge, slight glow

**Map Atmosphere:**
- Subtle latitude/longitude grid lines via Mapbox custom layer
- Dark map style (`mapbox://styles/mapbox/dark-v11`)
- Hero background: animated constellation/neural network pattern (subtle nodes + edges)

**Animation Principles:**
- Pin filtering: 300ms fade transitions (not instant toggle)
- Camera: auto-fly to epoch's geographic center of gravity when timeline scrubbed
- Year counter sweeping across map top during timeline scrub
- CityPanel: slide from right with Framer Motion
- EntityDetail: fade + scale modal

**Critical UX Rule:**
- Hero renders server-side (instant, no JS needed)
- Map loads below the fold while user reads hero
- NEVER show a loading spinner above the fold

### User Flow

1. **Land** → Hero with tagline + animated entry count stats
2. **Scroll** → World map with clustered pins sized by significance
3. **Click pin** → CityPanel slides in showing entries at that location
4. **Click entry** → EntityDetail modal with full data + connections
5. **Navigate** → Click linked entities to jump between entries
6. **Filter** → Timeline slider filters pins by epoch
7. **Search** → Fuzzy search finds any entity
8. **Browse** → Sidebar lists epochs with entry counts

## Implementation Plan

### Tasks

- [ ] **Task 1: Project scaffolding**
  - File: `web/package.json`
  - Action: Initialize Next.js 14+ project with dependencies: `next`, `react`, `react-dom`, `react-map-gl`, `mapbox-gl`, `framer-motion`, `fuse.js` (for fuzzy search). Dev deps: `typescript`, `@types/react`, `tailwindcss`, `postcss`, `autoprefixer`
  - File: `web/tsconfig.json` — Standard Next.js TypeScript config with path alias `@/` → `./`
  - File: `web/next.config.js` — Enable transpilePackages for mapbox-gl if needed, configure static export
  - File: `web/tailwind.config.ts` — Content paths, custom RETROSPEC color theme (dark background, amber/gold accents for historical feel)
  - File: `web/.env.local` — `NEXT_PUBLIC_MAPBOX_TOKEN=<placeholder>` (user supplies real token)
  - Notes: Run `npm install` after creation to verify dependencies resolve

- [ ] **Task 2: TypeScript types**
  - File: `web/lib/types.ts`
  - Action: Define interfaces matching all JSON schemas: `RetroEvent`, `Person`, `Organization`, `Model`, `Paper`, `Concept`, `Cycle`, `Epoch`, `LineageEntry`, `GraphData`, `Location`. Define `EntityType` union. Define `LocationData` with lat/lng/entities/events/significance_sum/epoch_range.
  - Notes: Derive from actual schema files. Every field in every schema must have a corresponding TS type.

- [ ] **Task 3: Location index data file**
  - File: `web/data/locations.json`
  - Action: Create location index with ~20 cities mapping all RETROSPEC entities to geographic coordinates. Include: San Francisco (OpenAI, Anthropic, ChatGPT, GPT-4), Mountain View (Google Brain, Transformer), Menlo Park (Meta AI, LLaMA), Cambridge MA (MIT AI Lab, Minsky, Perceptrons), Hanover NH (Dartmouth Conference), Armonk NY (IBM, Deep Blue), London (DeepMind, AlphaGo, Babbage, Lovelace, Lighthill), Manchester (Turing), Toronto (Hinton, AlexNet, U of Toronto), Montreal (Bengio, MILA, attention mechanism, Bahdanau), Palma Mallorca (Llull), Leipzig (Leibniz), Cork Ireland (Boole), Seoul (AlphaGo match), Hangzhou China (DeepSeek), Tokyo (Fifth Generation), Pittsburgh (CMU, Newell, Simon), Stanford (McCarthy, LISP, Shakey, Stanford Cart), Zurich (LSTM, Schmidhuber), Paris (LeCun early work)
  - Notes: Every entity and event in the repo should map to at least one location. Use accurate lat/lng. Calculate significance_sum per city.

- [ ] **Task 4: Data loading layer**
  - File: `web/lib/data.ts`
  - Action: Create build-time data loading functions that read JSON files from the parent directory (`../events/*.json`, `../entities/**/*.json`, etc.). Export: `getAllEvents()`, `getAllPeople()`, `getAllOrgs()`, `getAllModels()`, `getAllPapers()`, `getAllConcepts()`, `getAllCycles()`, `getAllEpochs()`, `getAllLineage()`, `getGraphData()`, `getEntityById(id)`. Each reads from filesystem at build time using `fs.readFileSync` + `JSON.parse`.
  - File: `web/lib/locations.ts`
  - Action: Functions for location data: `getAllLocations()`, `getLocationById(id)`, `filterLocationsByEpoch(epoch)`, `getEntitiesAtLocation(locationId)`. Joins location index with actual entity data.
  - Notes: These run only at build time (server-side). Client components receive pre-loaded data as props.

- [ ] **Task 5: Root layout and global styles**
  - File: `web/app/layout.tsx`
  - Action: Root layout with: HTML metadata (title: "RETROSPEC — AI History Explorer", description, OG tags), Mapbox GL CSS import, Google Fonts (Inter or similar), dark theme body background
  - File: `web/app/globals.css`
  - Action: Tailwind directives, custom CSS for Mapbox container sizing, cluster pin styles, dark theme variables, smooth scroll behavior
  - Notes: Dark background (#0a0a0f or similar) with amber/gold accents for a "historical archive" feel

- [ ] **Task 6: Hero component**
  - File: `web/components/Hero.tsx`
  - Action: Client component with: RETROSPEC logo/title, Santayana quote, tagline "AI's own history, mapped across the world", animated counters (46 events, 29 people, 12 orgs, 11 epochs — counting up on mount using Framer Motion), "Explore the Map" CTA button that smooth-scrolls to map section. Visual: semi-transparent dark overlay, subtle grid/constellation background pattern.
  - Notes: Should feel dramatic and archival. The stats counter creates a sense of scale.

- [ ] **Task 7: Map component**
  - File: `web/components/Map.tsx`
  - Action: Client component wrapping `react-map-gl` `<Map>`. Props: locations data, active epoch filter, onLocationClick callback. Config: dark map style (`mapbox://styles/mapbox/dark-v11`), initial viewport centered on Atlantic (lat: 30, lng: -20, zoom: 2), scroll zoom enabled, navigation controls. Manages viewport state and passes location data to MapClusters child.
  - Notes: Mark as `"use client"`. Map container should be full viewport width, ~70vh height. Include loading state while Mapbox initializes.

- [ ] **Task 8: Map clusters component**
  - File: `web/components/MapClusters.tsx`
  - Action: Client component using react-map-gl's `<Source>` + `<Layer>` for clustered GeoJSON points. Convert locations.json to GeoJSON FeatureCollection at build time. Cluster config: radius 50px, max zoom 14. Unclustered pins: circle sized by `significance_sum` (min 8px, max 24px), amber/gold color. Cluster pins: larger circle with count badge. Click handler: on cluster click → zoom in; on single pin click → call `onLocationClick(locationId)`. Hover tooltips showing city name.
  - Notes: Use Mapbox's built-in clustering. Pin size formula: `Math.max(8, Math.min(24, significance_sum / 3))`.

- [ ] **Task 9: City panel component**
  - File: `web/components/CityPanel.tsx`
  - Action: Client component. Slide-in panel from right side (Framer Motion `AnimatePresence` + slide animation). Props: location data, all entities at location, onEntityClick, onClose. Content: city name header, epoch badges, grouped list of entities (events sorted by date, people, orgs, models). Each entry shows: title/name, type badge, significance indicator (1-10 dots or bar), date, 1-line summary. Click any entry → calls onEntityClick(entityId).
  - Notes: Panel width: 400px on desktop, full width on mobile. Scrollable content area. Close button + click-outside-to-close.

- [ ] **Task 10: Entity detail modal (router + type components)**
  - File: `web/components/EntityDetail.tsx`
  - Action: Client component. Full-screen modal overlay (Framer Motion fade + scale). Routes to type-specific sub-components based on entity `type` field. Manages a navigation stack (array of entity IDs) for back button support. Includes ConnectionsGraph mini-component at the bottom.
  - File: `web/components/EntityDetail/EventDetail.tsx`
  - Action: Event-specific layout: title, date, epoch badge, significance bar, summary, **counterfactual** (highlighted box), entities involved (clickable), preceded/succeeded timeline links, query hooks.
  - File: `web/components/EntityDetail/PersonDetail.tsx`
  - Action: Person-specific layout: name, dates, nationality, photo placeholder, affiliations (clickable orgs), key contributions, influenced_by/influenced chains (clickable), papers list.
  - File: `web/components/EntityDetail/OrgDetail.tsx`
  - Action: Org layout: name, founded, founders (clickable people), headquarters, key models (clickable), key papers.
  - File: `web/components/EntityDetail/ModelDetail.tsx`
  - Action: Model layout: name, org (clickable), release date, architecture, parameter count, **lineage path** (visual chain), parent/child models (clickable), key innovations, benchmarks, cultural impact.
  - Notes: Each sub-component renders the connected entities section with clickable links. Navigation stack in EntityDetail router enables back button traversal.

- [ ] **Task 11: Epoch timeline slider**
  - File: `web/components/EpochTimeline.tsx`
  - Action: Client component. Horizontal bar at bottom of map section. Shows all 11 epochs as labeled segments on a timeline (1300s → 2026). Each segment clickable to filter map pins to that epoch. "All" button to reset filter. Active epoch highlighted with amber accent. Epoch names abbreviated to fit (e.g., "Roots", "Dawn", "Golden", "Winter 1", "Expert", "Winter 2", "Quiet", "Deep Learning", "Transformer", "GenAI", "Agentic").
  - Notes: Fixed position below map. Smooth filter transitions on the map (Framer Motion for pin opacity changes).

- [ ] **Task 12: Sidebar component**
  - File: `web/components/Sidebar.tsx`
  - Action: Client component. Left sidebar (collapsible on mobile). Sections: SearchBar at top, Epoch browser (11 epochs with entry counts and date ranges, clickable to filter), Category filters (events, people, orgs, models — toggleable), Repository stats (total entries, graph edges, epochs covered).
  - Notes: Width: 300px desktop, slide-in drawer on mobile. Should feel like a table of contents for AI history.

- [ ] **Task 13: Search bar component**
  - File: `web/components/SearchBar.tsx`
  - Action: Client component using `fuse.js` for fuzzy search across all entity names, titles, and summaries. Search input with results dropdown. Each result shows: name/title, type badge, significance. Click result → opens EntityDetail for that entry. Keyboard navigation (arrow keys + enter).
  - Notes: Index built from all entities at page load. Fuse.js threshold: 0.3 (moderate fuzziness). Max 10 results shown.

- [ ] **Task 14: MapProvider context**
  - File: `web/components/MapProvider.tsx`
  - Action: React context provider managing shared state: `selectedLocation`, `selectedEntity`, `activeEpoch`, `sidebarOpen`, `cityPanelOpen`. Exposes `useMapState()` hook. Wraps the entire map section. Eliminates prop drilling between Map, CityPanel, EntityDetail, Sidebar, and EpochTimeline.
  - Notes: All client components consume state via context, not props.

- [ ] **Task 15: ConnectionsGraph mini-component**
  - File: `web/components/ConnectionsGraph.tsx`
  - Action: Small radial graph (CSS-based or lightweight D3) showing immediate connections of the selected entity. Renders inside EntityDetail. Shows: entity at center, connected entities as nodes radiating outward, edges labeled with relationship type. Each node clickable to navigate.
  - Notes: Keep lightweight — no full force simulation. CSS grid-based radial layout or simple SVG.

- [ ] **Task 16: ContributeCTA component**
  - File: `web/components/ContributeCTA.tsx`
  - Action: Subtle banner that appears after the user has viewed 3+ entities. Text: "Know AI history? This is open source. Add an entry." Links to CONTRIBUTING.md on GitHub. Dismissable. Uses Framer Motion slide-up.
  - Notes: Track entity view count in MapProvider context. Show after threshold.

- [ ] **Task 17: Main page assembly**
  - File: `web/app/page.tsx`
  - Action: Server component that loads all data at build time using `lib/data.ts`. Renders: Hero (server-rendered, instant) → MapProvider wrapping: Map section (Map + MapClusters + EpochTimeline) + Sidebar + CityPanel + EntityDetail + ContributeCTA. Hero is above fold; map loads below fold.
  - Notes: Hero renders without JS. Map and interactive components load as client islands below the fold. Never show a spinner above the fold.

- [ ] **Task 18: Flyover animation system**
  - File: `web/lib/flyover.ts`
  - Action: Define an array of ~15 `flyTo` keyframes: `{center: [lng, lat], zoom, bearing, pitch, duration, label}`. Sequence: Palma (1305) → Leipzig (1673) → London (1837) → Cambridge UK (1950) → Hanover NH (1956) → Cambridge MA (1960s) → Toronto (2006) → Montreal (2014) → London (2016, AlphaGo) → Mountain View (2017, Transformer) → SF (2022, ChatGPT) → Hangzhou (2025, DeepSeek). Export `runFlyover(map)` function. Add "Watch the Story" button to Hero or map controls.
  - Notes: Post-MVP enhancement but define the data structure now. Uses Mapbox's native `flyTo()` with easing.

- [ ] **Task 15: Vercel deployment config**
  - File: `web/vercel.json` (if needed)
  - Action: Configure Vercel: root directory `web/`, build command `npm run build`, output directory `.next`. Ensure the `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable is set in Vercel project settings.
  - File: Update root `.gitignore` to include `web/node_modules/`, `web/.next/`, `web/.env.local`
  - Notes: User needs to create Vercel project, connect repo, set root to `web/`, add Mapbox token as env var.

## Acceptance Criteria

- [ ] **AC1:** Given a user visits the site, when the page loads, then the Hero section displays with RETROSPEC branding, animated entry count stats, and an "Explore the Map" button.
- [ ] **AC2:** Given the Hero section is visible, when the user clicks "Explore the Map", then the page smooth-scrolls to the map section.
- [ ] **AC3:** Given the map section is visible, when the map initializes, then a dark-themed Mapbox map renders showing clustered city pins across the world.
- [ ] **AC4:** Given pins are visible on the map, when a cluster pin is clicked, then the map zooms in to reveal individual city pins within the cluster.
- [ ] **AC5:** Given an individual city pin is visible, when it is clicked, then a CityPanel slides in from the right showing all AI history entries at that location, grouped by type.
- [ ] **AC6:** Given the CityPanel is open, when an entry is clicked, then an EntityDetail modal opens showing the full entry data including title, date, significance, summary, and counterfactual (for events).
- [ ] **AC7:** Given the EntityDetail modal is open, when a connected entity link is clicked (e.g., a person referenced in an event), then the modal navigates to show that entity's detail with a back button to return.
- [ ] **AC8:** Given the epoch timeline is visible, when an epoch segment is clicked, then only map pins with entries from that epoch remain visible, and others fade out.
- [ ] **AC9:** Given the epoch timeline has a filter active, when "All" is clicked, then all pins become visible again.
- [ ] **AC10:** Given the search bar is focused, when the user types a query, then fuzzy search results appear showing matching entities with name, type badge, and significance.
- [ ] **AC11:** Given search results are showing, when a result is clicked, then the EntityDetail modal opens for that entity.
- [ ] **AC12:** Given the sidebar is visible, when an epoch is clicked in the epoch browser, then the map filters to that epoch and the timeline highlights the selected epoch.
- [ ] **AC13:** Given the site is deployed on Vercel, when a commit is pushed to main, then Vercel auto-rebuilds and redeploys within 5 minutes.
- [ ] **AC14:** Given a location has multiple entity types, when the CityPanel renders, then entries are grouped by type (events first sorted by date, then people, then organizations, then models).
- [ ] **AC15:** Given the page loads on mobile (<768px), when the user views the site, then the map is full width, the sidebar is a collapsible drawer, and the CityPanel is full width overlay.

## Additional Context

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| next | ^14.0.0 | App framework |
| react / react-dom | ^18.0.0 | UI library |
| react-map-gl | ^7.0.0 | Mapbox GL React wrapper |
| mapbox-gl | ^3.0.0 | Map rendering engine |
| framer-motion | ^11.0.0 | Animations |
| fuse.js | ^7.0.0 | Fuzzy search |
| typescript | ^5.0.0 | Type safety |
| tailwindcss | ^4.0.0 | Styling |

**External services:**
- Mapbox GL JS — requires free API token (50,000 map loads/month on free tier)
- Vercel — free tier supports this project

### Testing Strategy

- **Manual testing:** Verify all 15 acceptance criteria manually in browser
- **Build verification:** `npm run build` must succeed with zero errors
- **Lighthouse audit:** Target 90+ performance score, 100 accessibility
- **Cross-browser:** Test Chrome, Safari, Firefox
- **Mobile:** Test on iPhone and Android viewport sizes

### Notes

**High-risk items:**
- Mapbox GL JS bundle size (~200KB) — mitigate with dynamic import
- Build-time data loading from parent directory (`../`) — verify Next.js allows this path resolution
- GeoJSON conversion at build time must handle all location edge cases

**Future considerations:**
- Phase 2: Replace fuzzy search with embeddings-based semantic search
- Phase 2: Add MCP query playground to the web app
- Consider adding a "time travel" animation that flies the camera between cities chronologically

**Mapbox token:**
User must obtain a free Mapbox token at https://account.mapbox.com/access-tokens/ and add it to `web/.env.local` as `NEXT_PUBLIC_MAPBOX_TOKEN`.
