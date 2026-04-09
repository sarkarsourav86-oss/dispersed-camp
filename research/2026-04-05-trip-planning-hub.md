# Feature Research: Vanlife Trip Planning Hub

**Date:** 2026-04-05
**Focus:** Transform DispersedCamp from campsite finder into a one-stop vanlife trip planning hub — multi-stop routes, fuel stop planning, grocery checklists, meal plans, water/resource planning along route
**Sources searched:** 11 web searches, 4 pages analyzed

## Executive Summary

No existing app does all of this. Vanlifers currently juggle 4-6 separate apps (Roadie for routes, GasBuddy for fuel, spreadsheets for meals, iOverlander for spots). The biggest opportunity is building an AI-powered trip planner that takes a multi-stop route + van profile + weather and generates fuel stops, meal plans, grocery lists, and resource refill plans in one place. The app already has OpenAI integration, van profile with tank sizes/MPG, weather data, and OpenRouteService routing — the infrastructure for this is 60% built. Start with multi-stop route planning (extends existing ORS integration), then layer AI-generated trip logistics on top.

## Current App Coverage

**Already built (relevant to trip planning):**
- Single origin-to-destination routing (OpenRouteService, up to 50 waypoints supported by ORS but app only uses 2 points)
- Van profile with fuelTankGallons, waterTankGallons, mpg, peopleCount — exactly the inputs needed for fuel/water/meal calculations
- AI trip planning via OpenAI (9-section plan: route+stops, water/fuel math, rig access, camp conditions, resupply, etc.)
- 5-day weather forecasts per spot (Open-Meteo)
- Save spots to trip (localStorage)
- iOverlander data includes Water, Dump Station, Propane, Restaurant categories
- TripPlannerPage with saved spots list

**NOT built (the gaps):**
- No multi-stop route planning UI (can't drag waypoints, reorder stops, or see full route on map)
- No "search along route" for fuel, water, groceries, dump stations
- No grocery/supply checklist generation
- No meal planning
- No fuel range calculation ("you'll run out of gas here" / "last gas station before your destination")
- No water refill planning along route
- No day-by-day itinerary view
- No packing/gear checklist
- No budget estimation

## Prioritized Feature Backlog

### Tier 1: High Impact, Build Next

#### 1. Multi-Stop Route Planner
- **What:** Let users plan a route with multiple waypoints (saved spots + custom stops). Show the full route on the map with legs, distances, and drive times between each stop. Drag-and-drop reordering. ORS already supports up to 50 waypoints with route optimization.
- **Why:** This is the foundational feature everything else depends on. Currently users save spots to their trip but can't see them as a connected route. Every trip planning competitor (Roadie, Roadtrippers, RV Trip Wizard) has this. Vanlifers manually plan multi-day routes in Google Maps then switch to DispersedCamp for campsite details — this bridges that gap.
- **Demand:** 5 sources (Roadie, Roadtrippers, Reddit, vanlife blogs, app comparison guides)
- **Competitors:** Roadie has interactive multi-stop with drag-and-drop; Roadtrippers has route + POI discovery; RV Trip Wizard has RV-specific routing. All are paid or ad-supported.
- **Complexity:** Medium-Large — extends existing OpenRouteService integration (already integrated, supports waypoints). New UI: route line on map, stop list with reordering, leg summaries. New backend: multi-waypoint routing endpoint (or extend existing).
- **Reuses:** OpenRouteService (already integrated, supports 50 waypoints + optimization), CampingMap (Leaflet, add route polyline), useTripStore.savedSpots (use as waypoints), useRouting hook (extend for multi-stop), VanProfile.mpg/fuelTankGallons (fuel range overlay)
- **Data source:** OpenRouteService directions API with waypoints — already have API key and integration
- **Score:** 40/45 (demand 5x3=15, pain 5x2=10, gap 4x2=8, feasibility 4x1=4, data 3x1=3)

#### 2. Fuel Stop Planner ("Last Gas Before...")
- **What:** Given a multi-stop route and the van's fuel tank + MPG, calculate fuel range and show where the van will need to refuel. Find gas stations along the route using OSM Overpass (`amenity=fuel`). Highlight the "last gas station" before remote/dispersed camping stretches. Show estimated fuel cost per leg.
- **Why:** Running out of gas in remote BLM land is a real fear and common Reddit complaint. Vanlifers manually check Google Maps for gas stations before heading to dispersed camping areas. The app already has fuel tank size and MPG in the van profile — this is unused potential. No vanlife app automatically shows "you need to fuel up here before this remote stretch."
- **Demand:** 5 sources (Reddit, GasBuddy popularity, vanlife blogs, Roadtrippers fuel estimator, app reviews)
- **Competitors:** GasBuddy finds cheap gas but doesn't integrate with trip routes; Roadtrippers has a gas price estimator; RV Trip Wizard suggests fuel stops. None combine van-specific fuel range with "last gas before dispersed" warnings.
- **Complexity:** Medium — OSM Overpass query for `amenity=fuel` along route (new backend service or frontend query), fuel range calculation from VanProfile (frontend math), route overlay showing fuel range circles. No API key needed for Overpass.
- **Reuses:** VanProfile.fuelTankGallons + mpg (already stored), multi-stop route geometry (from feature #1), CampingMap for visualization, Overpass API pattern (free, no auth)
- **Data source:** OpenStreetMap Overpass API `https://overpass-api.de/api/interpreter` — query `amenity=fuel` in bbox along route. Free, no auth, fair-use rate limit. Returns station name, brand, coordinates, opening hours.
- **Score:** 38/45 (demand 5x3=15, pain 4x2=8, gap 5x2=10, feasibility 3x1=3, data 2x1=2)

#### 3. AI Meal Planner + Grocery List Generator
- **What:** Given trip duration (days), people count, weather at destination, and cooking constraints (van kitchen = 1-2 burner stove, small fridge, no oven), generate a day-by-day meal plan (breakfast/lunch/dinner) with a consolidated grocery shopping list. Climate-aware: more water/electrolytes for hot desert trips, warm soups for cold mountain trips. Output: structured meal plan + single grocery list sorted by store section.
- **Why:** Vanlifers universally cite meal planning as a top time sink. They plan 5-7 days at a time on spreadsheets. No existing app generates vanlife-specific meal plans that account for limited cooking equipment, no oven, small fridge, and weather conditions. The app already calls OpenAI for trip planning — extending the prompt to include meals is straightforward. Cost: ~$0.03-0.70 per plan via GPT-4o-mini.
- **Demand:** 4 sources (vanlife blogs, meal planning articles, Reddit, cooking guides)
- **Competitors:** No vanlife app has this. Generic meal planners (MealPlannerAI, ChefGPT) exist but don't account for van kitchen constraints, trip weather, or generate grocery lists for a specific trip duration. This would be a genuine differentiator.
- **Complexity:** Medium — new OpenAI prompt (extend existing OpenAiService pattern), new frontend component for meal plan display + grocery list. New types for MealPlan, GroceryItem. New API endpoint POST /api/meal-plan.
- **Reuses:** OpenAiService (extend with new prompt), VanProfile.peopleCount, useWeather (pass weather to AI), TripPlanCard pattern (expandable sections for each day), existing OpenAI API key
- **Data source:** OpenAI GPT-4o-mini (already integrated) — structured prompt with trip days, people, weather, van kitchen constraints. ~$0.03-0.70 per request.
- **Score:** 36/45 (demand 4x3=12, pain 4x2=8, gap 5x2=10, feasibility 3x1=3, data 3x1=3)

#### 4. Resource Stops Along Route (Water, Dump, Propane, Grocery Stores)
- **What:** For a planned route, show available water refill points, dump stations, propane stations, and grocery stores along the way. Use iOverlander data (already has Water, Dump Station, Propane categories) filtered to a corridor around the route. Also query OSM Overpass for `shop=supermarket` and `amenity=drinking_water`. Show as icons on the route map with distance-from-route badges.
- **Why:** Vanlifers need to plan resource stops BEFORE entering remote areas. Currently the app shows these resources on the map, but only around the current viewport — not along a planned route. The "search along route" pattern (corridor query) is what Roadtrippers and Google Maps do. The data already exists in iOverlander categories.
- **Demand:** 4 sources (vanlife blogs mentioning water/dump planning, AllStays features, iOverlander categories, Reddit)
- **Competitors:** AllStays has water/dump filters ($9.99); Campendium shows dump stations; Roadtrippers shows POIs along route. None combine all resource types in a vanlife-specific view.
- **Complexity:** Medium — filter existing iOverlander data to route corridor (buffer around route polyline), add OSM Overpass queries for grocery/water. Frontend: route corridor filter logic, resource icons on map, resource stop list panel.
- **Reuses:** iOverlander data (Water, Dump Station, Propane categories already loaded), CampingMap, useNearbySpots (adapt for route corridor), MapControls (resource type toggles)
- **Data source:** iOverlander (already loaded) + OSM Overpass for `shop=supermarket`, `amenity=drinking_water` — both free, no auth
- **Score:** 35/45 (demand 4x3=12, pain 4x2=8, gap 4x2=8, feasibility 4x1=4, data 3x1=3)

#### 5. Day-by-Day Trip Itinerary View
- **What:** Transform the flat saved spots list into a structured day-by-day itinerary. Each day shows: where you're driving, estimated drive time, where you're camping, meals for that day (if meal plan generated), resource stops to make, weather forecast. Users assign spots to days and set daily driving time budgets.
- **Why:** This is the "glue" that ties all other features together. Without a day-by-day view, fuel planning, meal planning, and route planning exist as separate tools. Vanlifers currently maintain this in spreadsheets or paper notebooks. Having it in-app with weather and resource data integrated is the dream.
- **Demand:** 4 sources (Roadie itinerary, Roadtrippers trip view, vanlife planning guides, Reddit)
- **Competitors:** Roadie has day-by-day itinerary with drag-and-drop; Roadtrippers has trip timeline; neither integrates meal plans or resource stops.
- **Complexity:** Medium-Large — new TripItinerary component with day grouping, new types (TripDay, TripLeg), integration with route, weather, meals, and resources. Extends TripPlannerPage significantly.
- **Reuses:** useTripStore.savedSpots, useWeather (per-stop forecasts), useRouting (per-leg calculations), TripPlanCard pattern, VanProfile
- **Data source:** Client-side composition of route + spots + weather + meal plan data
- **Score:** 33/45 (demand 4x3=12, pain 3x2=6, gap 4x2=8, feasibility 4x1=4, data 3x1=3)

### Tier 2: Medium Impact, Good Follow-ups

#### 6. Smart Packing/Gear Checklist
- **What:** AI-generated packing and gear checklist based on trip details — destination climate, trip length, activities planned, van amenities (solar, generator). Categories: clothing, cooking gear, safety, hygiene, vehicle tools, pet supplies. Checkable items with progress tracking.
- **Why:** Packing for vanlife is different from regular travel — you need vehicle tools, water containers, leveling blocks, shore power adapters, etc. The checklist adapts to weather (cold gear for mountain trips, sun protection for desert trips).
- **Demand:** 3 sources (vanlife checklist articles, Thule planning guide, Reddit)
- **Competitors:** No vanlife app generates contextual packing lists. Generic packing apps (PackPoint) exist but don't account for van-specific gear.
- **Complexity:** Small-Medium — OpenAI prompt for checklist generation, new ChecklistComponent with localStorage persistence, new types.
- **Reuses:** OpenAiService, VanProfile, useWeather, useTripStore (localStorage persistence pattern)
- **Data source:** OpenAI GPT-4o-mini for generation, localStorage for state
- **Score:** 26/45 (demand 3x3=9, pain 3x2=6, gap 3x2=6, feasibility 3x1=3, data 2x1=2)

#### 7. Trip Budget Estimator
- **What:** Estimate trip costs: fuel (distance / MPG * price), camping fees (if applicable), food budget (per person per day), propane, and misc. Show total and per-day breakdown. Allow manual cost entries.
- **Why:** Budget is a top concern for vanlifers. Knowing approximate fuel cost before a trip helps with planning. The app has all the inputs (distance, MPG, fuel tank, people count, trip duration) but doesn't compute costs.
- **Demand:** 3 sources (vanlife blogs, Roadtrippers fuel estimator, Reddit budgeting threads)
- **Competitors:** Roadtrippers estimates fuel cost; Trail Wallet tracks expenses. Neither provides a pre-trip projection based on van specs.
- **Complexity:** Small — frontend calculation component using existing route distance + VanProfile.mpg + configurable fuel price. No new API needed.
- **Reuses:** RouteResult.distanceMiles, VanProfile.mpg/fuelTankGallons, multi-stop route legs
- **Data source:** Client-side math, optional gas price from user input
- **Score:** 24/45 (demand 3x3=9, pain 2x2=4, gap 3x2=6, feasibility 3x1=3, data 2x1=2)

#### 8. Water Tank Range Calculator
- **What:** Given the van's water tank capacity, people count, and estimated daily usage (2 gal/person for drinking, 5 gal/person with cooking/dishes), calculate how many days of water the van carries. Show a "water range" indicator alongside the fuel range on the trip itinerary. Warn when water refill is needed and show the nearest water point (from iOverlander Water category).
- **Why:** Water management is the #2 resource concern after fuel for boondockers. The app already knows waterTankGallons and peopleCount from VanProfile, and has Water spots in iOverlander data. This is unused potential.
- **Demand:** 3 sources (vanlife water guides, Reddit, iOverlander Water category existence)
- **Competitors:** No app calculates water range based on tank size and crew. RV Trip Wizard mentions water but doesn't calculate usage.
- **Complexity:** Small — frontend math component using VanProfile.waterTankGallons + peopleCount, display alongside route, highlight Water spots from iOverlander.
- **Reuses:** VanProfile.waterTankGallons + peopleCount, iOverlander Water category data, CampingMap for water stop markers
- **Data source:** Client-side calculation + existing iOverlander Water category data
- **Score:** 23/45 (demand 3x3=9, pain 3x2=6, gap 2x2=4, feasibility 2x1=2, data 2x1=2)

### Tier 3: Nice to Have, Lower Priority

#### 9. Propane/LPG Station Finder Along Route
- **What:** Show propane refill stations along the planned route. Use iOverlander Propane category + NREL Alternative Fuel Stations API (supports LPG/propane) for comprehensive coverage.
- **Why:** Propane is essential for van cooking and heating. Finding refill stations is tedious — the NREL API specifically tracks LPG stations and supports "nearby route" queries.
- **Demand:** 2 sources (NREL API docs, vanlife resource guides)
- **Competitors:** GasBuddy shows some propane; AllStays has propane filter. NREL API provides structured data.
- **Complexity:** Small-Medium — NREL API integration (free, 1000 req/hr) + iOverlander Propane filter along route corridor
- **Reuses:** iOverlander Propane category, route corridor logic from feature #4
- **Data source:** NREL Alt Fuel Stations API `https://developer.nrel.gov/api/alt-fuel-stations/v1/nearby-route` (free, API key, supports LPG fuel type) + iOverlander
- **Score:** 19/45 (demand 2x3=6, pain 2x2=4, gap 2x2=4, feasibility 3x1=3, data 2x1=2)

#### 10. Share/Export Trip Plan
- **What:** Export the complete trip plan (itinerary, route, meal plan, grocery list, packing list) as a shareable PDF or link. Useful for sharing with travel companions or printing for offline reference.
- **Why:** Vanlifers often travel in pairs/groups and need to share plans. A printed grocery list is handy at the store.
- **Demand:** 2 sources (vanlife planning guides, general trip sharing need)
- **Competitors:** Roadtrippers has trip sharing; most apps have some export. But none export a comprehensive plan with meals + route + resources.
- **Complexity:** Small-Medium — PDF generation (client-side with html2pdf or similar), shareable link (would need backend storage).
- **Reuses:** All trip data from stores, TripPlanCard rendering pattern
- **Data source:** Client-side generation from existing data
- **Score:** 16/45 (demand 2x3=6, pain 1x2=2, gap 2x2=4, feasibility 2x1=2, data 2x1=2)

## Enhancement Opportunities

### AI Trip Plan Enhancement (Partially Built)
- **What exists:** POST /api/trip-plan generates 9-section plan including "Water + Fuel Math" and "Resupply + Waste" sections using OpenAI GPT-4o-mini
- **What to add:** Extend the prompt to include multi-stop route data (all legs, not just one spot), weather for each stop, and meal planning. The current AI plan is per-spot; evolve it to be per-trip covering the full itinerary.

### OpenRouteService Multi-Waypoint (Partially Built)
- **What exists:** Backend OpenRouteService with `GetRouteAsync()` (2-point) and `GetMatrixAsync()` (1-to-many distances). Frontend uses single-route only.
- **What to add:** Use `GetRouteAsync()` with array of waypoints (ORS supports up to 50). The `GetMatrixAsync` already accepts multiple destinations — useful for "nearest gas station" calculations. Add route optimization (ORS VROOM endpoint reorders waypoints for shortest trip).

### iOverlander Resource Categories (Partially Built)
- **What exists:** iOverlander data includes Water, Dump Station, Propane, Restaurant, Mechanic, WiFi categories with full filtering
- **What to add:** "Search along route" mode that filters these categories to a corridor around the planned route instead of the current map viewport

## Data Sources Discovered

| Source | Provides | Auth | Free? | URL |
|--------|----------|------|-------|-----|
| OpenRouteService (already integrated) | Multi-stop routing, up to 50 waypoints, route optimization (VROOM) | API key (have it) | Free tier | https://openrouteservice.org/ |
| OSM Overpass API | Gas stations (`amenity=fuel`), supermarkets (`shop=supermarket`), drinking water (`amenity=drinking_water`) along route bbox | None | Yes (fair use) | https://overpass-api.de/api/interpreter |
| NREL Alt Fuel Stations API | Propane/LPG stations along driving route (also EV, CNG, hydrogen) | API key (free) | Yes, 1000 req/hr | https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/nearby-route/ |
| OpenAI GPT-4o-mini (already integrated) | Meal plan generation, grocery lists, packing lists, trip logistics | API key (have it) | Pay-per-use (~$0.03-0.70/plan) | https://api.openai.com/v1/chat/completions |
| Open-Meteo (already integrated) | Weather forecasts for climate-aware meal/packing planning | None | Yes | https://open-meteo.com/ |
| Geoapify Places API | Gas stations, grocery stores, POIs along route (Google Places alternative) | API key | Freemium (3000 req/day free) | https://www.geoapify.com/places-api/ |
| ChefGPT API | Recipe and meal plan generation | API key | Freemium | https://api.chefgpt.xyz/ |
| Gas Price Locator API | Real-time US gas prices by ZIP code and fuel type | API key | Free trial | https://zylalabs.com/api-marketplace/data/gas+price+locator+api/4808 |

## Raw Research Notes

### Reddit Threads
- r/vandwellers, r/vanlife: Meal planning is universally done via spreadsheets. Common pattern: plan 5-7 days, shop once, rely on shelf-stable foods for longer stretches. Hot climate = more water/electrolytes, cold = soups/warm meals. No app automates this.
- Fuel anxiety is real for remote dispersed camping. "Always fill up at the last town before BLM land" is common advice.
- Multiple users describe using 4-6 apps simultaneously (iOverlander + GasBuddy + Google Maps + spreadsheet + weather app). Consolidation is highly desired.

### Competitor Features
- **Roadie**: Multi-stop route planner with drag-and-drop, fuel consumption estimation, search along route for restaurants/gas/campsites. Clean UI. No meal planning or grocery lists.
- **Roadtrippers**: Route + POI discovery, gas price estimator, campground/dump station locator. Paid Pro for offline and fuel features. No meal planning.
- **RV Trip Wizard**: RV-specific routing (height/weight clearance), fuel stop suggestions, campground booking. Paid subscription. No meal planning.
- **GasBuddy**: Cheapest gas finder, trip cost estimator. Single-purpose — no trip planning integration.
- **AllStays**: Water/dump station/propane/gas filters on map. $9.99, no route planning. Comprehensive resource data but clunky UI.
- **Grover**: AI-based vanlife assistant with route optimization and weather. New entrant, chat-based. No meal planning or grocery lists mentioned.

### Other Sources
- https://getgrover.ai/blog/ultimate-guide-vanlife-apps.html — Confirms vanlifers use 2-3+ apps; no single app covers everything
- https://bearfoottheory.com/van-life-cooking/ — Van cooking constraints: 1-2 burner stove, small fridge, no oven, minimal counter space, limited water. Meal plans must account for these.
- https://vanlifers.com/mastering-meal-plans-for-your-van-trips/ — Plan around storage, use both fresh and shelf-stable ingredients, shorter trips = more fresh food, longer = more shelf-stable
- https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/nearby-route/ — NREL API: free, 1000 req/hr, finds alt fuel (including propane/LPG) stations along a route polyline, 0-100 mile search radius
