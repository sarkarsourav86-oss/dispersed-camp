# DispersedCamp

A mobile-first PWA for vanlifers and overlanders to find dispersed camping, water, dump stations, propane, mechanics, and other services across the US and Canada.

## Features

- **Homepage** — Landing screen with hero image, logo, search bar, category filter chips, and nearby spots preview
- **77k+ Spots** — iOverlander data (US + Canada) with category-colored markers: camping, water, dump stations, propane, mechanics, WiFi, showers, restaurants, parking
- **Interactive Map** — Leaflet map with viewport-based spot loading, marker clustering, and BLM/USFS land overlays
- **Category Filters** — Toggle iOverlander categories on/off with per-category colored markers
- **AI Trip Planner** — OpenAI-powered vanlife trip planner with 9 actionable sections (route, water/fuel math, rig access, arrival strategy, camp conditions, resupply, connectivity, rules, backup plan)
- **Van Profile** — One-time setup for your rig (vehicle type, clearance, drivetrain, tank sizes, crew, solar, internet needs) for personalized trip plans
- **Trip Readiness** — Instant "good if / not ideal if" assessment for each spot based on your van
- **Drive Time** — Routing from your location via OpenRouteService
- **Weather** — 5-day forecast at any spot via Open-Meteo
- **Google Earth** — Direct link to aerial 3D view of each spot for scouting terrain
- **Visitor Tips** — Auto-extracted tips from iOverlander descriptions (price, road conditions, cell signal, noise, water, fire)
- **Fire Restrictions** — Real-time fire restriction alerts from BLM GIS data
- **Save Spots** — Save spots to "My Trip" for later reference
- **PWA / Offline** — Installable to phone home screen; iOverlander data cached via Workbox for offline use

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| State (local/UI) | Zustand |
| State (server) | TanStack React Query |
| Mapping | Leaflet.js + leaflet.markercluster |
| Styling | Tailwind CSS v4 |
| Icons | Bootstrap Icons (react-bootstrap-icons) |
| Offline | vite-plugin-pwa (Workbox) |
| Backend | .NET 10 Minimal API |
| AI | OpenAI GPT-4o-mini |
| Caching | IMemoryCache |

## Prerequisites

- Node.js 20+
- .NET 10 SDK

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd dispersed-camp

# Install frontend deps
cd client && npm install && cd ..
```

### 2. Configure API keys (backend)

Edit `server/appsettings.json`:

```json
{
  "ORS_API_KEY": "your-openrouteservice-key",
  "OPENAI_API_KEY": "your-openai-key"
}
```

**Getting API keys:**

- **OpenRouteService**: Register at https://openrouteservice.org — free tier: 2,000 requests/day
- **OpenAI**: Get a key at https://platform.openai.com — pay-per-use (GPT-4o-mini is very cheap)

> **Note**: The app works without these keys. iOverlander spots, weather, and fire restrictions need no keys. ORS enables drive time; OpenAI enables the AI trip planner.

### 3. Set up iOverlander data

Download iOverlander JSON exports from https://app.ioverlander.com/countries/places_by_country (requires subscription), then run:

```bash
node scripts/convert-ioverlander.mjs data/us.json data/canada.json
```

This generates grid-indexed JSON files in `client/public/data/ioverlander/`.

### 4. Run locally

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
dotnet run

# Terminal 2 — Frontend
cd client
npm run dev
```

Open http://localhost:5173 on your phone (on same network) or use browser DevTools mobile emulation.

## Data Sources

| Source | Provides | Auth | Free? |
|---|---|---|---|
| iOverlander | 77k+ spots (camping, water, dump, propane, etc.) | Static JSON | Subscription for export |
| BLM GIS ArcGIS REST | Land boundaries (BLM) | None | Yes |
| USFS GIS Hub | Land boundaries (National Forest) | None | Yes |
| Open-Meteo | Weather forecast | None | Yes |
| OpenRouteService | Drive time + distance | API key | Yes (2k/day) |
| OpenAI | AI trip planner | API key | Pay-per-use |

## Project Structure

```
dispersed-camp/
├── client/                  # React PWA
│   ├── public/
│   │   ├── data/ioverlander/  # Grid-indexed spot data (generated)
│   │   ├── logo.png           # App logo
│   │   └── van.png            # Hero background image
│   └── src/
│       ├── components/      # UI components by domain
│       │   ├── map/         # CampingMap, MapControls
│       │   ├── spots/       # SpotCard, SpotDetail, TripPlanCard
│       │   ├── van/         # VanProfileSetup
│       │   ├── weather/     # WeatherWidget
│       │   ├── search/      # SearchBar
│       │   ├── rules/       # FireRestrictionBanner
│       │   └── shared/      # BottomSheet, LoadingSpinner, OfflineBanner
│       ├── hooks/           # React Query hooks
│       ├── store/           # Zustand stores
│       ├── services/        # API clients + iOverlander loader
│       ├── data/            # iOverlander category config, land rules
│       ├── pages/           # HomePage, MapPage, TripPlannerPage
│       └── types/           # Shared TypeScript types
├── server/                  # .NET 10 Minimal API
│   ├── Routes/              # LandRoutes, RoutingRoutes, FireRoutes, TripPlanRoutes
│   ├── Services/            # BlmGis, UsfsGis, OpenRoute, FireRestriction, OpenAi
│   └── Models/              # Response models
└── scripts/
    └── convert-ioverlander.mjs  # CSV/JSON → grid-indexed JSON converter
```

## Deployment

### Frontend (Vercel)

```bash
cd client && npm run build
# Deploy dist/ to Vercel
```

### Backend (Azure App Service)

```bash
cd server && dotnet publish -c Release
# Set ORS_API_KEY, OPENAI_API_KEY, CORS_ORIGIN in App Settings
```

## Refreshing iOverlander Data

1. Download JSON exports from iOverlander (US, Canada, or any country)
2. Place files in `data/` directory
3. Run: `node scripts/convert-ioverlander.mjs data/file1.json data/file2.json ...`
4. Output goes to `client/public/data/ioverlander/`
5. Redeploy frontend
