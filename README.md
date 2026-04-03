# DispersedCamp

A mobile-first PWA for finding and planning dispersed camping on BLM and National Forest land in the United States.

## Features

- **Map** — Interactive Leaflet map with color-coded BLM (amber) and National Forest (green) land overlays
- **Find Spots** — GPS-based search using OpenStreetMap Overpass API for community-tagged camp sites
- **Drive Time** — Routing from your location to any spot via OpenRouteService
- **Weather** — 7-day forecast at any campsite via Open-Meteo (free, no key)
- **Gear Checklist** — Smart packing list filtered by season, terrain, trip length, water availability, and fire restrictions
- **Land Rules** — BLM and USFS regulations displayed per spot, works offline
- **Fire Restrictions** — Real-time fire restriction alerts from BLM GIS data
- **PWA / Offline** — Installable to phone home screen; map tiles and gear checklist work without signal

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| State (local/UI) | Zustand |
| State (server) | TanStack React Query |
| Mapping | Leaflet.js + leaflet.markercluster |
| Styling | Tailwind CSS v4 |
| Offline | vite-plugin-pwa (Workbox) |
| Backend | .NET 10 Minimal API |
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
  "RIDB_API_KEY": "your-ridb-key",
  "ORS_API_KEY": "your-ors-key"
}
```

**Getting API keys (both free):**

- **RIDB (Recreation.gov)**: Register at https://ridb.recreation.gov/landing — click "Get API Key"
- **OpenRouteService**: Register at https://openrouteservice.org — free tier: 2,000 requests/day

> **Note**: The app works without these keys. OSM Overpass (camp spots) and Open-Meteo (weather) need no keys. RIDB adds developed campground data; ORS enables drive time calculation.

### 3. Run locally

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
dotnet run
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev
# Runs on http://localhost:5173 (proxies /api/* to :5000)
```

Open http://localhost:5173 on your phone (on same network) or use browser DevTools mobile emulation.

## API Data Sources

| Source | Provides | Auth | Free? |
|---|---|---|---|
| BLM GIS ArcGIS REST | Land boundaries (BLM) | None | ✅ |
| USFS GIS Hub | Land boundaries (National Forest) | None | ✅ |
| OSM Overpass | Community camp spots | None | ✅ |
| Open-Meteo | Weather forecast | None | ✅ |
| RIDB (Recreation.gov) | Developed campground data | API key | ✅ |
| OpenRouteService | Drive time + distance | API key | ✅ (2k/day) |

## Project Structure

```
dispersed-camp/
├── client/                  # React PWA
│   └── src/
│       ├── components/      # UI components by domain
│       ├── hooks/           # React Query hooks (server state)
│       ├── store/           # Zustand stores (local/UI state)
│       ├── services/        # API client functions
│       ├── data/            # Static gear items + land rules
│       ├── pages/           # Page-level components
│       └── types/           # Shared TypeScript types
└── server/                  # .NET 10 Minimal API
    ├── Routes/              # Endpoint definitions
    ├── Services/            # External API integrations
    └── Models/              # Shared response models
```

See [CODING_STANDARDS.md](./CODING_STANDARDS.md) for state management patterns and conventions.

## Deployment

### Frontend → Vercel

```bash
cd client && npm run build
# Deploy dist/ to Vercel (auto-detected as Vite project)
```

### Backend → Azure App Service

```bash
cd server
dotnet publish -c Release
# Deploy to Azure App Service (Free/B1 tier)
# Set RIDB_API_KEY, ORS_API_KEY, CORS_ORIGIN in App Settings
```

## Roadmap

- **Phase 2**: Water source overlay, topo map layer, full offline mode, radius slider
- **Phase 3**: Trip planner with multi-stop routing, user accounts, spot sharing
- **Phase 4**: App Store/Play Store submission (TWA), community notes
