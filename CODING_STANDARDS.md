# Coding Standards — DispersedCamp

## State Management

### Rule: Zustand for local/UI state, React Query for server state

**Zustand** manages client-only state that never needs to be fetched or synchronized with the server:
- User's GPS location (`useLocationStore`)
- Selected spot on map (`useSpotsStore`)
- Map layer toggles, radius setting (`useSettingsStore`)
- Gear checklist progress and config (`useGearStore`)
- Saved trip spots (`useTripStore`)

**React Query** manages all data fetched from APIs:
- Nearby camp spots (`useNearbySpots`)
- BLM/USFS land boundaries (`useLandOverlays`)
- Drive time/distance (`useRouting`)
- Weather forecast (`useWeather`)
- Fire restrictions (`useFireRestrictions`)

**Never** put API response data into Zustand. **Never** manage loading/error state manually when React Query is available.

```tsx
// ✅ Good: React Query for server state
const { data: spots, isLoading, error } = useNearbySpots();

// ❌ Bad: Manual server state in Zustand
const [spots, setSpots] = useState([]);
useEffect(() => { fetchSpots().then(setSpots); }, []);
```

### React Query configuration

- `staleTime`: Set per-query based on how often the data changes (weather=30min, routes=6h, land=24h)
- `gcTime`: Keep cached data alive longer than staleTime so background refetches don't show loading states
- `retry`: Max 1–2 retries for external APIs (avoid hammering third-party services)
- `enabled`: Always gate on required params being non-null
- `placeholderData`: Use `[]` or previous data to avoid empty flashes

```tsx
useQuery({
  queryKey: ['spots', lat?.toFixed(2), lng?.toFixed(2), radiusKm],
  queryFn: () => fetchSpots(lat!, lng!, radiusKm),
  enabled: !!lat && !!lng,          // Don't fire until location is available
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: [],
});
```

## Component Patterns

### File structure per component
```
src/components/<domain>/<ComponentName>.tsx
```

One component per file. No barrel `index.ts` re-exports unless the domain has 4+ components.

### Props interfaces
Define props inline at the top of the component file, not in a separate types file:
```tsx
interface Props {
  spot: CampSpot;
  onSelect: (spot: CampSpot) => void;
}

export function SpotCard({ spot, onSelect }: Props) { ... }
```

### No prop drilling beyond 2 levels
If a value needs to pass through more than 2 component layers, pull it into Zustand store instead.

## Hooks

- Custom hooks live in `src/hooks/`
- Hooks that wrap React Query return the query result object directly (don't destructure inside the hook)
- Hooks that wrap browser APIs (`useGeolocation`) manage their own side effects and write to Zustand

## TypeScript

- No `any`. Use `unknown` and narrow, or use the correct type from `src/types/index.ts`
- All shared domain types live in `src/types/index.ts`
- Prefer `type` over `interface` for unions and primitives; use `interface` for object shapes that may be extended

## Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `SpotCard`, `WeatherWidget` |
| Hooks | camelCase with `use` prefix | `useNearbySpots`, `useRouting` |
| Stores | camelCase with `use` prefix + `Store` | `useSpotsStore` |
| Query keys | `['domain', ...params]` | `['spots', lat, lng, radius]` |
| Files | PascalCase for components, camelCase for others | `SpotCard.tsx`, `osmOverpass.ts` |

## API Services

- `src/services/api.ts` — all calls to the .NET backend (proxied via Vite dev server)
- `src/services/osmOverpass.ts` — direct Overpass API calls
- Service functions are plain `async` functions, not classes
- Never put API keys in frontend code — they must be in the .NET backend environment

## .NET Backend Standards

- Minimal API endpoints: one static class per route group (e.g., `LandRoutes`, `FireRoutes`)
- Services: constructor-injected via DI, one responsibility per class
- Caching: always use `IMemoryCache` with a cache key that includes all query parameters
- Return `Results.Ok(data)` for success, `Results.NotFound(message)` for missing data
- Log errors with `ILogger`, never throw unhandled exceptions to the client

## Git

- Branch naming: `feature/<short-name>`, `fix/<short-name>`
- Commit messages: imperative mood, describe the *what* and *why*
  - ✅ `Add fire restriction banner to spot detail`
  - ❌ `updated component`
- PRs require passing build before merge
