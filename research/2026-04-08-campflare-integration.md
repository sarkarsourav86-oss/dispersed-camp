# Feature Research: Campflare API Integration & AI Planning Enhancement

**Date:** 2026-04-08
**Focus:** Migrating data sources to Campflare API and enhancing AI-powered trip planning
**Sources searched:** 25+ web searches, 30+ pages analyzed

## Executive Summary

Campflare is a **complementary** data source, not a replacement for iOverlander. It covers **reservable public campgrounds** (350K+ campsites across 10K+ campgrounds) with real-time availability, cell coverage, and government alerts -- while iOverlander covers **dispersed/free camping and services** (water, dump, propane, mechanics). The biggest wins from Campflare integration are: (1) cell service coverage data per carrier, (2) campsite cancellation/availability alerts, (3) government alerts (NWS/USFS/NPS), and (4) map tile layers. Combined with AI enhancements, these unlock several high-impact features that no competitor offers as a unified experience.

## Current App Coverage

**Already strong in:**
- Dispersed camping spot discovery (iOverlander, 12 categories)
- Public land boundary overlays (BLM/USFS via GIS APIs)
- Multi-stop route planning with optimization (OpenRouteService)
- AI trip planning with van profile personalization (OpenAI)
- Fire restriction alerts
- 7-day weather forecasts (Open-Meteo)
- Van profile system (9 vehicle types, clearance, drivetrain, tanks)
- Save/reorder trip stops with drag-and-drop

**Gaps relative to competitors:**
- No reservable campground data or availability alerts
- No cell service coverage maps
- No government alert aggregation (NWS, USFS, NPS)
- No road difficulty/access ratings
- No conversational AI search ("find me a spot near Moab with cell service")
- No route-aware resource planning (water/dump/propane stops along route)
- No structured community check-ins (crowding, conditions, cell speed)
- No offline map support
- No smoke/air quality overlay

## Prioritized Feature Backlog

### Tier 1: High Impact, Build Next

#### 1. Campflare Campground Search & Availability Alerts
- **What:** Integrate Campflare's campground database to show reservable public campgrounds alongside dispersed sites. Enable real-time availability alerts via webhooks when sold-out campsites open up.
- **Why:** "No single app covers all needs" is the #1 user complaint (6+ sources). Users juggle iOverlander for dispersed + Recreation.gov for reservable. Combining both in one app is a massive differentiator.
- **Demand:** 6+ sources mentioned needing a unified app; cancellation alerts are a paid feature at Campflare and Campsite Tonight
- **Competitors:** Campflare (alerts only), The Dyrt (campgrounds only), Campendium (reviews only). No app combines dispersed + reservable + availability alerts.
- **Complexity:** Large -- New backend service for Campflare API, new webhook listener for alerts, new frontend components for campground cards, availability UI, and alert management
- **Reuses:** Existing map infrastructure (CampingMap.tsx markers/clustering), SpotCard/SpotDetail pattern, React Query hooks, TripStore for saving spots
- **Data source:** Campflare API (free for non-commercial) -- campground data endpoints + availability webhooks
- **Score:** 38/45

#### 2. Cell Service Coverage Map & Per-Spot Signal Data
- **What:** Add cell coverage overlay to the map (by carrier: AT&T, Verizon, T-Mobile) and show carrier-specific signal data on campsite detail views. Use Campflare's cell service API/map layers.
- **Why:** Cell coverage is critical for remote workers (majority of vanlifers). Currently requires a separate app (Coverage?, OpenSignal). 5+ sources cite this as a top pain point.
- **Demand:** 5+ sources; FreeRoam, Gaia, and Campendium all have some form of this
- **Competitors:** FreeRoam has cell overlay, Campendium has user-reported signal, Campflare has carrier-specific data. None integrate it with campsite recommendations.
- **Complexity:** Medium -- Campflare CDN map layer for overlay + cell service API for per-spot data. New map layer toggle + signal indicator in SpotDetail
- **Reuses:** Existing SettingsStore layer toggles, MapControls.tsx, SpotDetail.tsx amenities pattern, CampingMap.tsx tile layer system
- **Data source:** Campflare Cell Service API + CDN map tiles (free for non-commercial)
- **Score:** 36/45

#### 3. AI Conversational Campsite Search ("Find Me a Spot")
- **What:** Natural language search: "Find a free campsite near Moab with cell coverage, 2WD access, shade, arriving Friday for 3 nights." AI cross-references all data sources (iOverlander spots, Campflare campgrounds, cell coverage, weather, fire restrictions, land rules) to recommend the best matches.
- **Why:** The #1 manual workflow is cross-referencing 2-3 apps. An AI that does this automatically is the killer feature no competitor offers for dispersed camping. 26% of travelers plan to use AI for planning in 2026.
- **Demand:** 4+ sources; AdventureGenie ($45/yr) and Grover both monetize AI planning. No one does it for dispersed camping with unified data.
- **Competitors:** AdventureGenie (GenieMatch for campgrounds), Grover (chat-based), Roadtrippers Autopilot (route-focused). None combine dispersed + reservable + real-time data.
- **Complexity:** Large -- New conversational UI, prompt engineering with multi-source RAG, scoring/ranking algorithm, new backend endpoint
- **Reuses:** Existing OpenAiService, useTripPlan hook pattern, iOverlander data, VanStore profile for personalization, fire/weather hooks for context
- **Data source:** OpenAI API (existing) + all integrated data sources as context
- **Score:** 35/45

#### 4. Government Alert Aggregation (NWS, USFS, NPS)
- **What:** Surface real-time government alerts (weather warnings, fire restrictions, road closures, park advisories) on the map and per-spot detail views. Aggregate from Campflare's alert APIs.
- **Why:** Regulatory/safety data is the most underserved category across all competitors. Fire restrictions change frequently; no app aggregates NWS + USFS + NPS alerts in real-time. Currently requires checking multiple agency websites manually.
- **Demand:** 3+ sources; currently only Campflare aggregates these
- **Competitors:** FreeRoam has fire smoke overlay. No one aggregates all government alert types.
- **Complexity:** Medium -- New backend service wrapping Campflare alert endpoints, alert banner component, map overlay for affected areas
- **Reuses:** Existing FireRestrictionBanner pattern, LandRulesPanel.tsx, React Query with staleTime-based refresh
- **Data source:** Campflare NWS/USFS/NPS alert APIs (free for non-commercial)
- **Score:** 33/45

#### 5. Route-Integrated Resource Planning
- **What:** During multi-stop route planning, automatically detect when water/dump/propane/fuel stops are needed based on van profile (tank capacities, MPG) and route distance. Suggest optimal resource stops along the route.
- **Why:** Resource planning along a route is a top manual workflow (3+ sources). Users switch between apps to find water/dump/propane near their route. DispersedCamp already has the route and van profile data -- just needs the intelligence layer.
- **Demand:** 3+ sources; no competitor integrates resource stops into route planning automatically
- **Competitors:** FreeRoam has "near me" services list. No one does route-aware resource planning.
- **Complexity:** Medium -- Algorithm to calculate resource needs from van profile + route distance, query iOverlander for service spots near route geometry, insert recommended stops
- **Reuses:** Existing useMultiStopRoute, VanStore (tank capacities, MPG), iOverlander service categories (Water, Sanitation Dump Station, Propane), TripStore
- **Data source:** Existing iOverlander data (water, dump, propane categories) + van profile calculations
- **Score:** 32/45

#### 6. Campflare Map Layers (Public Lands + Topo via CDN)
- **What:** Replace current BLM/USFS GIS API calls with Campflare's CDN-hosted map tiles for public land boundaries and topographic maps. Faster loading, more reliable, includes additional land types.
- **Why:** Current GIS API calls are slow and rate-limited. CDN tiles load faster and cache better. Reduces backend complexity (can potentially remove BlmGisService and UsfsGisService).
- **Demand:** Infrastructure improvement that benefits all users. Public land overlays are paywalled by multiple competitors.
- **Competitors:** FreeRoam, onX Offroad, Gaia GPS all have land overlays. CDN delivery is standard.
- **Complexity:** Small -- Swap Leaflet tile layer source URLs. Update SettingsStore if new layer options. May simplify backend by removing GIS service calls.
- **Reuses:** Existing CampingMap.tsx tile layer system, SettingsStore layer toggles, MapControls.tsx
- **Data source:** Campflare CDN map tiles (free for non-commercial)
- **Score:** 30/45

### Tier 2: Medium Impact, Good Follow-ups

#### 7. Structured Community Check-Ins
- **What:** Replace free-text-only reviews with structured check-in forms: cell carrier + signal bars, vehicle type that accessed the site, crowding level (1-5), road condition (paved/gravel/4WD), current conditions notes.
- **Why:** Unstructured reviews are hard to search and extract info from. 4+ sources mention data accuracy as the top problem. Structured data enables filtering ("show me spots where a van made it on 2WD").
- **Demand:** 4+ sources on data accuracy; Dispersed App leads with structured check-ins
- **Competitors:** Dispersed App has structured check-ins. iOverlander and Campendium are free-text.
- **Complexity:** Medium -- New check-in form component, backend endpoint to store/retrieve, aggregation logic
- **Reuses:** VanStore profile can pre-fill vehicle type, existing spot data model
- **Data source:** User-generated (needs backend storage -- Azure Table Storage or Cosmos DB free tier)
- **Score:** 28/45

#### 8. AI Review Synthesis & Rig-Specific Filtering
- **What:** Use NLP to extract structured data from iOverlander free-text reviews: vehicle access info, crowding patterns, best seasons, amenity details. Show synthesized summary on SpotDetail and enable filtering by extracted attributes.
- **Why:** Users manually read through reviews looking for vehicle-size mentions, road quality descriptions, and seasonal tips. AI extraction automates this. 3+ sources mention rig-size filtering as missing.
- **Demand:** 3+ sources; AdventureGenie has GenieSummary for review synthesis
- **Competitors:** AdventureGenie GenieSummary. No one does extraction + filtering for dispersed camping.
- **Complexity:** Medium -- Batch processing of existing iOverlander descriptions through LLM, structured output storage, filter UI
- **Reuses:** Existing iOverlander data (descriptions/tags), OpenAiService, SpotDetail.tsx
- **Data source:** Existing iOverlander descriptions + OpenAI for extraction
- **Score:** 26/45

#### 9. Smoke & Air Quality Overlay
- **What:** Add wildfire smoke and air quality index (AQI) overlay to the map. Critical during fire season (June-October) when vanlifers need to avoid smoky areas.
- **Why:** FreeRoam is the only competitor with this. Wildfire smoke significantly impacts campsite usability and health. 2 sources mention this explicitly.
- **Demand:** 2 sources; FreeRoam has this as a differentiator
- **Competitors:** FreeRoam has fire smoke overlay. No other camping app does.
- **Complexity:** Small -- AirNow or OpenAQ API for AQI data, EPA fire smoke layer tiles for map overlay
- **Reuses:** Existing map tile layer system, SettingsStore layer toggle
- **Data source:** AirNow API (free, EPA) or OpenAQ API (free) + EPA smoke forecast tiles
- **Score:** 24/45

#### 10. Road Difficulty & Access Ratings
- **What:** Show road difficulty ratings (paved/gravel/4WD/high clearance) for roads leading to campsites. Warn when a road's difficulty exceeds the user's van profile (clearance, drivetrain).
- **Why:** Road condition blindness is mentioned by 3+ sources. Users want to know if their rig can reach a site before driving hours to get there.
- **Demand:** 3 sources; onX Offroad and Dispersed App lead here
- **Competitors:** onX Offroad (color-coded), Dispersed App (access type). Both paywall this.
- **Complexity:** Large -- USFS MVUM data integration, road classification database, route segment matching against van profile
- **Reuses:** VanStore (clearance, drivetrain), existing routing infrastructure
- **Data source:** USFS Motor Vehicle Use Maps (free public data, but complex to parse)
- **Score:** 23/45

### Tier 3: Nice to Have, Lower Priority

#### 11. Offline Map Support
- **What:** Allow users to download map tiles, campsite data, and route info for offline use in areas without cell coverage.
- **Why:** 6+ sources mention offline as non-negotiable. But it's complex to implement well and multiple competitors paywall it.
- **Demand:** 6 sources; The Dyrt, Sekr, Dispersed all charge for this
- **Competitors:** Most competitors paywall offline. Gaia GPS has the best implementation.
- **Complexity:** Large -- Service worker map tile caching, IndexedDB for spot data, offline-first architecture changes
- **Reuses:** Existing PWA/Workbox setup, iOverlander grid-cell architecture (naturally suited to region downloads)
- **Data source:** Self-hosted tile server or pre-rendered tile packages
- **Score:** 22/45

#### 12. Campsite Crowding Predictions
- **What:** Use historical patterns (season, day of week, holidays, proximity to attractions) to predict how busy a dispersed site will be.
- **Why:** Overcrowding at app-listed spots is mentioned by 4 sources. Prediction helps users find solitude.
- **Demand:** 4 sources mention overcrowding; no competitor does predictive crowding
- **Competitors:** None. This would be a first-mover advantage.
- **Complexity:** Large -- Requires historical data collection (check-ins over time), ML model, prediction API
- **Reuses:** Structured check-in data (Feature #7), existing spot data
- **Data source:** User check-in data (requires Feature #7 first)
- **Score:** 19/45

#### 13. Safety Ratings & Emergency Services
- **What:** Show safety indicators per area (crime data, distance to emergency services, hospital locations). Useful for solo travelers.
- **Why:** Solo female travelers specifically need safety features (2 sources). Grover is the only competitor with safety ratings.
- **Demand:** 2 sources; Grover leads
- **Competitors:** Grover has safety ratings. No one else does.
- **Complexity:** Medium -- FBI/local crime data APIs, emergency service geocoding, safety score algorithm
- **Reuses:** SpotDetail.tsx, existing location infrastructure
- **Data source:** FBI UCR data (free), Google Places API for hospitals/fire stations
- **Score:** 18/45

#### 14. Trip Cost Estimator
- **What:** Estimate total trip cost based on route distance (fuel at current prices), campground fees, propane refills, and food budget. Track against a trip budget.
- **Why:** AdventureGenie users report saving $1,000+ per multi-week trip with AI cost optimization. Budget-conscious vanlifers want this.
- **Demand:** 2 sources; AdventureGenie monetizes this
- **Competitors:** AdventureGenie includes cost in AI plans
- **Complexity:** Small -- Fuel cost calculation from route distance + MPG + gas price API, fee aggregation from Campflare campground data
- **Reuses:** VanStore (MPG, tank capacity), useMultiStopRoute (distance), Campflare campground fees
- **Data source:** GasBuddy or AAA gas price API + Campflare campground fee data
- **Score:** 17/45

## Enhancement Opportunities

These features are **partially built** and can be enhanced:

1. **Fire Restrictions (partially built -> full government alerts):** Currently fetches fire restriction data from a single source. Enhancement: Replace with Campflare's aggregated NWS + USFS + NPS alerts for broader coverage including weather warnings, road closures, and park advisories. Existing FireRestrictionBanner and LandRulesPanel can be extended.

2. **AI Trip Planning (partially built -> conversational search):** Currently generates a trip plan for a selected spot. Enhancement: Add conversational AI that helps users *discover* spots before planning. The existing OpenAiService and useTripPlan hook are the foundation.

3. **Map Layers (partially built -> CDN-based):** Currently fetches BLM/USFS boundaries via backend GIS API calls. Enhancement: Replace with Campflare CDN tiles for faster loading and add cell coverage + topo layers. Existing tile layer infrastructure in CampingMap.tsx supports this directly.

4. **Van Profile (built -> route-aware resource planning):** VanProfile already stores tank capacities and MPG. Enhancement: Use this data to calculate resource depletion along routes and suggest optimal refill stops. Existing VanStore + useMultiStopRoute are the foundation.

5. **iOverlander Spot Descriptions (built -> AI-extracted structured data):** Rich free-text descriptions already loaded. Enhancement: Run NLP extraction to surface structured attributes (vehicle access, noise, shade, crowding) for filtering.

## Data Sources Discovered

| Source | Provides | Auth | Free? | URL |
|--------|----------|------|-------|-----|
| Campflare API | Campgrounds, availability, cell coverage, gov alerts, map tiles | API key (invite) | Yes (non-commercial) | https://campflare.com/api |
| Campflare CDN | Topo maps, public land boundaries, cell coverage tiles | None (CDN) | Yes | Via API docs |
| AirNow API | Real-time AQI data | API key | Yes | https://docs.airnowapi.org/ |
| EPA Smoke Forecast | Wildfire smoke map tiles | None | Yes | https://www.airnow.gov/ |
| USFS MVUM | Motor Vehicle Use Maps (road access data) | None | Yes (public) | https://www.fs.usda.gov/visit/maps |
| FBI UCR | Crime statistics by area | None | Yes | https://crime-data-explorer.fr.cloud.gov/pages/docApi |
| GasBuddy API | Current gas prices by location | API key | Freemium | https://www.gasbuddy.com/ |
| OpenAQ | Global air quality data | API key | Yes | https://openaq.org/ |

## Raw Research Notes

### Campflare API Specifics
- Invite-only access: email contact@campflare.com (24-48hr processing)
- Developer portal: https://api-platform.campflare.com/
- 4 API areas: Campground Data, Real-Time Availability/Alerts (webhooks), Map Layers (CDN), Supplementary Data (NWS/USFS/NPS alerts, cell service)
- 350,000+ campsites across 10,000+ campgrounds (US only)
- Scans availability every ~45 seconds for popular campgrounds
- Free for individuals and non-profits; commercial license required otherwise
- Does NOT have dispersed camping data -- purely reservable public campgrounds
- Hipcamp partnership announced 2023 (validates API reliability)

### Reddit Threads
- r/vandwellers: Recurring complaints about needing 2-3 apps, iOverlander data staleness, no cell coverage info
- r/overlanding: Road access and clearance warnings are top unmet need; MVUM integration requested
- r/vanlife: Solo safety features, offline capability, overcrowding at popular app-listed spots

### Competitor Features
- **FreeRoam:** Free. Cell overlay, smoke overlay, public land maps, "near me" services list. No AI, no availability alerts.
- **AdventureGenie:** $45/yr. AI trip planning (PersonalGenie), review synthesis (GenieSummary), campground matching (GenieMatch). No dispersed camping.
- **Grover:** AI chat-based planning, safety ratings, weather-aware routing. Newer entrant.
- **Dispersed App:** $30/yr. 17K community spots, structured check-ins, MVUM integration, vehicle access ratings. Most directly competitive.
- **The Dyrt:** Largest database (50K+ campgrounds). PRO ($36/yr) for offline + trip planning. No dispersed focus.
- **Campendium:** Strong reviews + cell coverage reports. Free tier is useful. No AI features.
- **onX Offroad:** Best road difficulty ratings. $30-100/yr. Trail/road focused, not campsite focused.

### Other Sources
- 26% of travelers plan to use AI for trip planning in 2026 (industry survey)
- iOverlander subscription backlash ($60-100/yr) -- users who contributed data resent paying
- $30/yr is the pricing sweet spot for vanlife app subscriptions
- Unified cross-referencing (campsite + road + cell + weather + fire in one view) is the #1 unserved need
