# Feature Research: Adding Dispersed Camping Spots to Existing Locations

**Date:** 2026-04-05
**Focus:** Adding dispersed camping spots to the existing locations
**Sources searched:** 14 web searches, 9 pages analyzed

## Executive Summary

DispersedCamp currently relies solely on static iOverlander JSON data (~77k spots) with no way to add new spots. The biggest gaps are: (1) no RIDB/Recreation.gov federal campsite data despite the app referencing it as a source in types, (2) no USFS Recreation Sites integration which has a free ArcGIS layer with dispersed camping points, (3) no BLM recreation sites/facilities integration despite already using their land boundary API, (4) no OSM Overpass campsite queries despite listing OSM as a data source, and (5) no user-contributed spots. The highest-impact, lowest-effort wins are integrating the BLM and USFS recreation site ArcGIS layers since the app already has the backend pattern for ArcGIS queries.

## Current App Coverage

**Spot Data (READ-ONLY):**
- iOverlander static JSON (77k+ spots, 12 categories, grid-indexed client-side loading)
- Types reference `source: 'osm' | 'ridb' | 'ioverlander'` but only iOverlander is actually implemented
- No database, no user auth, no POST endpoints for spots
- Only user action is "save to trip" (localStorage bookmark)

**Infrastructure Already Built:**
- BLM ArcGIS query pattern (BlmGisService) - queries BLM land boundaries and fire perimeters
- USFS ArcGIS query pattern (UsfsGisService) - queries USFS forest boundaries
- OpenRouteService integration for routing
- Spot display pipeline: CampSpot type -> SpotCard -> SpotDetail -> CampingMap markers
- Category system with colors, emojis, filtering
- React Query caching with stale/gc times

## Prioritized Feature Backlog

### Tier 1: High Impact, Build Next

#### 1. RIDB (Recreation.gov) Federal Campsite Integration
- **What:** Integrate the RIDB API to pull 132K+ federal campsites (including dispersed/primitive sites) from NPS, BLM, USFS, and Army Corps facilities. Query by state or facility, merge into the spot display pipeline.
- **Why:** RIDB is the authoritative federal campsite database. The app's CampSpot type already has `source: 'ridb'` but it's never populated. Competitors like KampTrail differentiate specifically by using verified RIDB data. Reddit users repeatedly mention wanting "verified government campsites" not just crowdsourced data.
- **Demand:** 5 sources mentioned this (RIDB docs, KampTrail, FedCamp, boondocking guides, Reddit)
- **Competitors:** KampTrail built their entire app on RIDB; The Dyrt integrates RIDB for federal sites; Hipcamp integrates Recreation.gov availability
- **Complexity:** Medium — new backend service + route, but follows existing pattern. RIDB API requires free API key, 50 req/min rate limit.
- **Reuses:** CampSpot type (already has `source: 'ridb'`), SpotCard, SpotDetail, CampingMap markers, category system
- **Data source:** RIDB API - base URL `https://ridb.recreation.gov/api/v1/`, endpoints: `/facilities`, `/campsites`, `/facilities/{id}/campsites`. Free API key required. 50 req/min rate limit. 132K campsites across 15K facilities.
- **Score:** 38/45 (demand 5x3=15, pain 4x2=8, gap 5x2=10, feasibility 3x1=3, data 2x1=2)

#### 2. BLM Recreation Sites & Facilities Layer
- **What:** Query the BLM National Recreation Sites & Facilities ArcGIS layer (Layer 8: camping) to get BLM campgrounds and dispersed camping areas as point features with names, descriptions, stay limits, fees, and reservation info.
- **Why:** The app already queries BLM ArcGIS for land boundaries and fire data but completely ignores the BLM recreation sites layer that has actual campground locations. This is the easiest high-value win — same API pattern, same infrastructure, new data.
- **Demand:** 4 sources (BLM.gov, ArcGIS service docs, boondocking guides, competitor analysis)
- **Competitors:** The Dyrt Pro shows BLM campgrounds; Gaia GPS shows BLM recreation sites; USFS & BLM Campgrounds app has 780+ dispersed campgrounds with "Dispersed" filter
- **Complexity:** Small-Medium — follows exact same BlmGisService pattern. New layer query (Layer 8 instead of land boundary layer). 27 fields including FacilityName, StayLimit, Reservable, FacilityDescription, coordinates.
- **Reuses:** BlmGisService pattern (copy & adapt), LandRoutes pattern, IMemoryCache, CampSpot type mapping
- **Data source:** BLM ArcGIS REST `https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_Recreation_Sites_Facilities/MapServer/8/query` — free, no auth, 2000 records/query, point geometry
- **Score:** 37/45 (demand 4x3=12, pain 4x2=8, gap 4x2=8, feasibility 5x1=5, data 4x1=4)

#### 3. USFS Recreation Sites Layer (Dispersed Camping Points)
- **What:** Query the USFS Recreation Sites ArcGIS feature layer to get Forest Service campgrounds and dispersed camping points. The layer includes specific recreation type classifications including "Dispersed Camping" as a filterable type.
- **Why:** USFS manages the largest share of dispersed camping land in the US. The app shows USFS forest boundaries but has zero USFS campsite locations. This layer specifically tags dispersed camping vs developed campgrounds — a critical distinction for vanlifers.
- **Demand:** 4 sources (USFS data hub, Gaia GPS blog, dispersed camping guides, competitor analysis)
- **Competitors:** Gaia GPS prominently features USFS recreation sites; The Dyrt Pro includes USFS campgrounds; USFS & BLM Campgrounds app lists them
- **Complexity:** Small-Medium — follows exact same UsfsGisService pattern. Add query to existing service or new service for the recreation sites layer.
- **Reuses:** UsfsGisService pattern, same ArcGIS query approach, CampSpot type mapping, existing USFS land overlay toggle
- **Data source:** USFS Recreation Sites Feature Layer via ArcGIS Hub `https://data-usfs.hub.arcgis.com/datasets/usfs::recreation-sites-feature-layer/` — free, no auth, point geometry, includes recreation type field for filtering
- **Score:** 36/45 (demand 4x3=12, pain 4x2=8, gap 4x2=8, feasibility 5x1=5, data 3x1=3)

#### 4. OSM Overpass Campsite Integration
- **What:** Query the OpenStreetMap Overpass API for `tourism=camp_site` and `tourism=caravan_site` nodes/ways within the map viewport. Map OSM tags (backcountry, camp_site=basic, fee, drinking_water, toilets, etc.) to the CampSpot amenities system.
- **Why:** The app's CampSpot type already has `source: 'osm'` but it's unused. OSM has rich campsite data with structured tags for amenities (drinking_water, toilets, showers, openfire, power_supply, sanitary_dump_station). The `backcountry=yes` and `camp_site=basic` tags specifically identify dispersed/primitive sites.
- **Demand:** 3 sources (OSM wiki, Overpass API docs, vanlife forums mentioning OSM data)
- **Competitors:** Most competitors don't use raw OSM data directly (they use their own databases), so this is a differentiator
- **Complexity:** Medium — new backend service for Overpass queries (different API format than ArcGIS), tag-to-amenity mapping logic, deduplication against iOverlander spots by proximity
- **Reuses:** CampSpot type (already has `source: 'osm'`), AmenitiesList component (already renders OSM tags), SpotCard/SpotDetail, map markers
- **Data source:** Overpass API `https://overpass-api.de/api/interpreter` — free, no auth, rate-limited (fair use), queries `tourism=camp_site` + `tourism=caravan_site` with bbox. Tags: `backcountry`, `camp_site`, `fee`, `drinking_water`, `toilets`, `shower`, `openfire`, `power_supply`, `sanitary_dump_station`, `tents`, `caravans`, `motorhome`
- **Score:** 34/45 (demand 3x3=9, pain 3x2=6, gap 5x2=10, feasibility 4x1=4, data 5x1=5)

#### 5. Unified Multi-Source Spot Aggregation
- **What:** Build a spot aggregation layer that merges results from iOverlander + RIDB + BLM + USFS + OSM into a single deduplicated feed. Add source badges on SpotCard/SpotDetail. Allow filtering by data source in MapControls.
- **Why:** Once multiple sources are integrated, spots will overlap (the same campground appears in iOverlander AND RIDB AND OSM). Users need to see unified results without duplicates, and they want to know which sources verified a spot. Proximity-based deduplication (within ~100m) with source merging is standard in competitor apps.
- **Demand:** Implicit in all multi-source research — every app that uses multiple sources must solve this
- **Competitors:** The Dyrt, Campendium, and iOverlander all merge multiple data feeds
- **Complexity:** Medium — frontend aggregation logic, proximity-based dedup, source priority rules, UI for source badges and filters
- **Reuses:** useNearbySpots hook (extend), MapControls (add source filter section), SpotCard (add source badge), CampSpot type (source field already exists), useSettingsStore (add source visibility toggles)
- **Data source:** N/A — aggregation of other sources
- **Score:** 32/45 (demand 4x3=12, pain 3x2=6, gap 3x2=6, feasibility 4x1=4, data 4x1=4)

### Tier 2: Medium Impact, Good Follow-ups

#### 6. Campflare API Integration (Availability + Photos)
- **What:** Integrate the Campflare API for real-time campsite availability, high-res photos, cell coverage data, and government alerts for federal campgrounds.
- **Why:** Knowing if a campground has open sites right now is a top request from vanlifers. Campflare aggregates availability from Recreation.gov and adds photos + cell signal data.
- **Demand:** 3 sources (Campflare docs, Hipcamp integration, Reddit requests for availability)
- **Competitors:** Hipcamp uses Campflare for availability; The Dyrt Pro shows availability
- **Complexity:** Medium — new backend service, invite-only API (free for non-commercial)
- **Reuses:** SpotDetail (add availability section), CampSpot type, existing cache pattern
- **Data source:** Campflare API `https://campflare.com/api` — free for individuals/non-profits, invite-only, includes campground data, availability, photos, cell coverage, alerts
- **Score:** 28/45 (demand 3x3=9, pain 3x2=6, gap 3x2=6, feasibility 3x1=3, data 4x1=4)

#### 7. User-Contributed Spots (Community Submissions)
- **What:** Allow users to submit new camping spots with coordinates (tap map or GPS), name, category, description, and photos. Store in a backend database. Include basic moderation (auto-approve after N verifications, flag suspicious submissions).
- **Why:** Every major competitor (iOverlander, Campendium, The Dyrt, StayFree, Sekr) is built on user-contributed data. Reddit threads consistently mention discovering spots through community apps. This is the single most impactful long-term feature but has the highest complexity.
- **Demand:** 5 sources (Reddit, competitor analysis, vanlife blogs, app reviews)
- **Competitors:** iOverlander, Campendium, The Dyrt, StayFree, Sekr — all are community-driven
- **Complexity:** Large — requires database (SQLite/PostgreSQL/CosmosDB), user auth, POST API endpoint, submission form component, moderation logic, photo upload/storage, spam prevention
- **Reuses:** CampSpot type, SpotCard/SpotDetail for display, VanProfileSetup form patterns for building the submission form, CampingMap for "tap to place" interaction
- **Data source:** User-generated (self-hosted database)
- **Score:** 27/45 (demand 5x3=15, pain 2x2=4, gap 2x2=4, feasibility 1x1=1, data 3x1=3)

#### 8. FreeCampsites.net Data Integration
- **What:** Scrape or use FreeCampsites.net bulk data to add their community-contributed free camping spots to the app.
- **Why:** FreeCampsites.net is one of the most popular free camping resources, frequently recommended on Reddit and vanlife blogs. Their data complements iOverlander.
- **Demand:** 3 sources (vanlife blogs, Reddit, app comparison guides)
- **Competitors:** FreeCampsites.net is standalone; few apps integrate their data
- **Complexity:** Medium — requires scraping or bulk import (they offer a bulk data submission template but no public API), deduplication against existing sources
- **Reuses:** iOverlander static data pipeline pattern (convert to grid-indexed JSON), CampSpot type
- **Data source:** FreeCampsites.net `https://freecampsites.net/` — community data, no public API, bulk data template available
- **Score:** 22/45 (demand 3x3=9, pain 2x2=4, gap 2x2=4, feasibility 2x1=2, data 3x1=3)

### Tier 3: Nice to Have, Lower Priority

#### 9. ACTIVE Network Campground API
- **What:** Integrate the ACTIVE Network Campground API which covers 97% of US and Canada's national and state/provincial parks.
- **Why:** Fills in state park campgrounds which are missing from federal-only sources.
- **Demand:** 1 source (ACTIVE Network docs)
- **Competitors:** Few apps use this directly
- **Complexity:** Medium — new API integration with different auth/format
- **Reuses:** Standard backend service pattern, CampSpot type
- **Data source:** ACTIVE Network `https://developer.active.com/docs/read/Campground_APIs` — covers state and national parks
- **Score:** 18/45 (demand 1x3=3, pain 2x2=4, gap 2x2=4, feasibility 3x1=3, data 4x1=4)

#### 10. Spot Verification/Confirmation System
- **What:** Let users confirm a spot still exists ("I was here" button) with timestamp, updating the dateVerified field without full user auth.
- **Why:** iOverlander's verification dates get stale. A simple "confirm" button is much lighter than full user-contributed spots and improves data quality.
- **Demand:** 2 sources (iOverlander reviews mentioning stale data, vanlife forums)
- **Competitors:** iOverlander has this; Campendium has reviews
- **Complexity:** Small-Medium — lightweight POST endpoint, optional database or anonymous counter
- **Reuses:** SpotDetail (add confirm button), CampSpot.dateVerified field
- **Data source:** User-generated (simple counter/timestamp)
- **Score:** 17/45 (demand 2x3=6, pain 2x2=4, gap 1x2=2, feasibility 3x1=3, data 2x1=2)

## Enhancement Opportunities

### iOverlander Data Refresh Pipeline
- **What exists:** Static JSON files generated by `scripts/convert-ioverlander.mjs` from manual iOverlander exports
- **What to add:** Automated periodic refresh via iOverlander API (if available) or scheduled re-download. Currently the data is as fresh as the last manual export.

### Source Badge on SpotCard/SpotDetail
- **What exists:** `CampSpot.source` field supports `'osm' | 'ridb' | 'ioverlander'` but only 'ioverlander' is ever set
- **What to add:** Source badge/icon on SpotCard showing where data comes from. Color-coded or icon-coded by source (e.g., green for government/RIDB, blue for OSM, orange for iOverlander)

### Category System Expansion
- **What exists:** 12 iOverlander categories with colors and emojis
- **What to add:** Expand categories to cover RIDB/BLM/USFS facility types (e.g., "Dispersed Campsite", "Developed Campground", "Day Use Area", "Trailhead"). Map each source's type vocabulary to a unified category set.

## Data Sources Discovered

| Source | Provides | Auth | Free? | URL |
|--------|----------|------|-------|-----|
| RIDB API | 132K federal campsites, 15K facilities (NPS/BLM/USFS) | API key (free) | Yes | https://ridb.recreation.gov/api/v1/ |
| BLM Recreation Sites Layer 8 | BLM campgrounds with names, stay limits, fees, reservability | None | Yes | https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_Recreation_Sites_Facilities/MapServer/8/query |
| USFS Recreation Sites | USFS campgrounds and dispersed camping points with type classification | None | Yes | https://data-usfs.hub.arcgis.com/datasets/usfs::recreation-sites-feature-layer/ |
| OSM Overpass API | Camp sites with rich amenity tags (water, toilets, fire, fee, backcountry) | None | Yes (fair use) | https://overpass-api.de/api/interpreter |
| Campflare API | Campground data, availability, photos, cell coverage, alerts | Invite-only | Free (non-commercial) | https://campflare.com/api |
| ACTIVE Network | 97% of US/Canada state & national park campgrounds | API key | Freemium | https://developer.active.com/docs/read/Campground_APIs |
| FreeCampsites.net | Community-contributed free camping spots | None (scrape) | Yes | https://freecampsites.net/ |
| USFS FSGeodata | Shapefiles for USFS boundaries, trails, recreation | None | Yes | https://data.fs.usda.gov/geodata/edw/datasets.php |
| Federal Camping Data Standard v2.1 | Schema definition for federal campground data | N/A | N/A | https://ridb.recreation.gov/shared/pdf/Federal_Camping_Data_Standard_2.1_12232024.pdf |

## Raw Research Notes

### Reddit Threads
- r/vandwellers, r/overlanding: Users frequently ask "how do you find dispersed camping spots?" — most common answers are iOverlander, FreeRoam (now dead), Campendium, The Dyrt, and looking at BLM/USFS land on Gaia GPS
- Repeated frustration: "iOverlander data is stale," "spots are missing," "I found a great spot but can't add it to my app"
- FreeRoam shutting down in 2024 left a gap — users looking for alternatives

### Competitor Features
- **KampTrail**: Built entirely on RIDB verified data (4,400 campsites, 2,700 water stations) — markets "verified government data, not crowdsourced"
- **The Dyrt**: 500K+ campgrounds, user-submitted photos/reviews, dispersed camping with Pro subscription, "largest verified dispersed camping database"
- **Campendium**: User-generated reviews of free/dispersed camping on BLM and National Forest land, strong community
- **Gaia GPS**: Shows USFS Recreation Sites layer and BLM recreation sites directly on their map — popular for visual land exploration
- **StayFree**: 100K+ spots, user-contributed + team-added, covers wild/free camping globally
- **USFS & BLM Campgrounds app**: 780+ dispersed campgrounds with "Dispersed" filter — uses government data directly

### Other Sources
- https://ridb.recreation.gov/docs — RIDB API documentation (free, 50 req/min, API key required)
- https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_Recreation_Sites_Facilities/MapServer — BLM has 10 recreation layers including camping-specific Layer 8
- https://wiki.openstreetmap.org/wiki/Tag:tourism=camp_site — OSM camp_site tagging includes backcountry=yes, camp_site=basic for dispersed
- https://campflare.com/api — Free for non-commercial, invite-only, includes availability + cell coverage
- https://boondockorbust.com/boondocking-guide/the-best-apps-for-finding-free-campsites/ — 2026 guide comparing all major free camping apps
