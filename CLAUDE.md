# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DispersedCamp is a mobile-first PWA for vanlifers and overlanders to find dispersed camping, water, dump stations, propane, mechanics, and other services. Data comes from iOverlander (static JSON, primary source), OSM Overpass, and RIDB. It covers the US and Canada. React/TypeScript frontend (Vite) with a .NET 10 Minimal API backend.

## Development Commands

### Frontend (client/)
```bash
cd client
npm install          # install dependencies
npm run dev          # dev server on http://localhost:5173 (proxies /api/* to :5000)
npm run build        # tsc -b && vite build
npm run lint         # eslint
npm run preview      # preview production build
```

### Backend (server/)
```bash
cd server
dotnet run           # runs on http://localhost:5000
dotnet build         # build only
dotnet publish -c Release  # production build
```

Both must run simultaneously for full functionality. The Vite dev server proxies `/api/*` to the .NET backend.

## Architecture

**Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4. PWA via vite-plugin-pwa (Workbox).

**Backend**: .NET 10 Minimal API. One static class per route group in `server/Routes/` (LandRoutes, RoutingRoutes, FireRoutes). One service class per external API in `server/Services/`. All services use `IMemoryCache` and are registered as scoped via DI.

**State management** (strict separation):
- **Zustand** for client-only/UI state: location, selected spot, map settings, gear checklist, saved trips. Stores are in `client/src/store/index.ts` (single file, all stores).
- **React Query** for all server/API data: spots, land overlays, routing, weather, fire restrictions. Hooks in `client/src/hooks/`.
- Never put API response data in Zustand. Never manage loading/error state manually.

**API proxy chain**: Frontend calls `/api/*` -> Vite proxy -> .NET backend -> external APIs (BLM GIS, USFS GIS, OpenRouteService). Open-Meteo weather is called directly from the frontend.

**iOverlander data**: Static grid-indexed JSON files in `client/public/data/ioverlander/`. Loaded client-side by `client/src/services/iOverlander.ts` using 1-degree grid cells with in-memory caching. Categories, colors, and emojis defined in `client/src/data/iOverlanderCategories.ts`. Data is generated from iOverlander JSON exports via `scripts/convert-ioverlander.mjs`.

**Refreshing iOverlander data**:
1. Download JSON exports from https://app.ioverlander.com/countries/places_by_country (requires subscription)
2. Place files in `data/` (gitignored)
3. Run: `node scripts/convert-ioverlander.mjs data/file1.json data/file2.json ...`
4. Output goes to `client/public/data/ioverlander/` (also gitignored — deploy separately)

**API keys**: OpenRouteService key goes in `server/appsettings.json`. Never put API keys in frontend code. The app works without this key (iOverlander data is static, Open-Meteo is keyless).

## Icons

Use **Bootstrap Icons** (`react-bootstrap-icons`) for all icons. No emojis or inline SVGs for UI elements.

## Coding Standards (from CODING_STANDARDS.md)

- No `any` in TypeScript; use `unknown` and narrow, or correct types from `src/types/index.ts`
- One component per file at `src/components/<domain>/<ComponentName>.tsx`
- Props interfaces defined inline at top of component file, not in separate types file
- No prop drilling beyond 2 levels; use Zustand store instead
- React Query hooks return the query result object directly (don't destructure inside the hook)
- Service functions are plain async functions, not classes
- Backend: return `Results.Ok(data)` / `Results.NotFound(message)`, log errors with `ILogger`
- Cache keys must include all query parameters
- Git branches: `feature/<short-name>`, `fix/<short-name>`
- Commit messages: imperative mood, describe what and why

## React Query Configuration Conventions

Set per-query: `staleTime` based on data freshness needs, `gcTime` longer than staleTime, `retry` max 1-2 for external APIs, `enabled` gated on required params being non-null, `placeholderData` to avoid empty flashes.

## Deployment

- Frontend: Vercel (build `client/dist/`)
- Backend: Azure App Service (set `RIDB_API_KEY`, `ORS_API_KEY`, `CORS_ORIGIN` in App Settings)
