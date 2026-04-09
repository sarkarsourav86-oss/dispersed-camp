using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Text.Json;
using server.Models;
using server.Services.Interfaces;

namespace server.Services;

public class OpenAiService(HttpClient http, IMemoryCache cache, IConfiguration config, ILogger<OpenAiService> logger) : IOpenAiService
{
    private const string ApiUrl = "https://api.openai.com/v1/chat/completions";

    public async Task<TripPlanResult?> GenerateTripPlanAsync(TripPlanRequest request)
    {
        var vanHash = $"{request.VanType}:{request.LengthFt}:{request.Clearance}:{request.Drivetrain}:{request.WaterTankGal}:{request.PeopleCount}";
        var cacheKey = $"tripplan:{request.Lat:F2}:{request.Lng:F2}:{request.Name}:{vanHash}";
        if (cache.TryGetValue(cacheKey, out TripPlanResult? cached) && cached != null)
            return cached;

        var apiKey = config["OPENAI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("OPENAI_API_KEY not configured");
            return null;
        }

        var ctx = new StringBuilder();
        ctx.AppendLine($"SPOT: {request.Name}");
        ctx.AppendLine($"LOCATION: {request.Lat:F4}°N, {Math.Abs(request.Lng):F4}°W");
        if (!string.IsNullOrEmpty(request.Category)) ctx.AppendLine($"TYPE: {request.Category}");
        if (!string.IsNullOrEmpty(request.Description)) ctx.AppendLine($"DESCRIPTION: {request.Description}");
        if (!string.IsNullOrEmpty(request.WeatherSummary)) ctx.AppendLine($"WEATHER: {request.WeatherSummary}");
        if (!string.IsNullOrEmpty(request.FireRestrictions)) ctx.AppendLine($"FIRE: {request.FireRestrictions}");
        if (!string.IsNullOrEmpty(request.DriveTime)) ctx.AppendLine($"ACTUAL DRIVE TIME FROM USER: {request.DriveTime}");
        if (request.DistanceMiles.HasValue) ctx.AppendLine($"ACTUAL DISTANCE FROM USER: {request.DistanceMiles:F1} miles");

        ctx.AppendLine("\nVAN PROFILE:");
        if (!string.IsNullOrEmpty(request.VanType)) ctx.AppendLine($"  Vehicle: {request.VanType}, {request.LengthFt}ft");
        if (!string.IsNullOrEmpty(request.Clearance)) ctx.AppendLine($"  Clearance: {request.Clearance}");
        if (!string.IsNullOrEmpty(request.Drivetrain)) ctx.AppendLine($"  Drivetrain: {request.Drivetrain}");
        if (request.WaterTankGal.HasValue) ctx.AppendLine($"  Water tank: {request.WaterTankGal} gal");
        if (request.FuelTankGal.HasValue) ctx.AppendLine($"  Fuel tank: {request.FuelTankGal} gal, {request.Mpg} MPG");
        if (request.PeopleCount.HasValue) ctx.AppendLine($"  Crew: {request.PeopleCount} people{(request.HasPet == true ? " + pet" : "")}");
        if (request.HasSolar == true) ctx.AppendLine("  Has solar");
        if (request.HasGenerator == true) ctx.AppendLine("  Has generator");
        if (request.NeedsInternet == true) ctx.AppendLine("  Needs reliable internet for remote work");

        var payload = new
        {
            model = "gpt-4o-mini",
            messages = new[]
            {
                new
                {
                    role = "system",
                    content = """
                        You are a vanlife trip planning engine. You generate trip plans for people living full-time in vans.

                        CRITICAL — HONESTY RULES (violating these makes the plan useless):
                        - NEVER invent specific place names, business names, gas station names, or locations you are not certain exist.
                        - NEVER invent specific distances (e.g. "18 miles south") unless you are confident. Say "check nearby" instead.
                        - NEVER invent cell carrier coverage. Say "unknown — check coverage maps" unless the description mentions signal.
                        - NEVER invent prices, hours, or availability of services.
                        - If ACTUAL DRIVE TIME and ACTUAL DISTANCE are provided, use those exact numbers. NEVER guess drive time.
                        - If you don't know something, say "unknown" or "verify before arrival." Do NOT fill in plausible-sounding fiction.
                        - Only state facts you can infer from: the spot description, the coordinates/region, the weather data, or general knowledge about the area type (BLM, national forest, desert, mountain, etc.).

                        FORMATTING RULES:
                        - Use bullet points starting with •, one per line, separated by \n.
                        - Short facts only. No paragraphs, no filler, no generic camping advice.
                        - Every line must help the user decide, pack, route, or avoid a problem.
                        - Tailor advice to the specific van profile provided (clearance, tank sizes, drivetrain, crew).
                        - For water/fuel math, CALCULATE from the van profile data — don't guess.

                        Respond with valid JSON only, no markdown fences. Use this exact structure:
                        {
                          "readiness": {
                            "goodIf": ["condition based on actual spot/van data", ...],
                            "badIf": ["condition based on actual spot/van data", ...]
                          },
                          "stopPlan": "• Total drive: USE ACTUAL DRIVE TIME if provided, otherwise say 'unknown — enable location'\n• Departure tip based on weather/daylight\n• Road surface if mentioned in description\n• General area type (rural, remote, near town, etc.)",
                          "waterFuelMath": "• CALCULATE: min water = people × 2 gal/day\n• CALCULATE: with [tank size] gal tank, good for X days for X people\n• Refill: mention if description says water available, otherwise 'unknown — verify'\n• CALCULATE: round-trip fuel = distance × 2 / MPG\n• Tank buffer recommendation",
                          "rigAccess": "• Based on van type + clearance + drivetrain from profile\n• Infer from description keywords (dirt road, gravel, paved, etc.)\n• If description doesn't mention road: 'Road surface: unknown — scout on arrival'\n• Max rig length: infer from area type or say 'unknown'",
                          "arrivalStrategy": "• General advice based on area type (dispersed = arrive before dark, etc.)\n• Weekend crowd: infer from area popularity or say 'unknown'\n• Ground: mention if description says, otherwise 'unknown — check on arrival'",
                          "campConditions": "• Only rate categories mentioned in the description\n• For anything not mentioned: say 'unknown'\n• Do NOT invent quiet/privacy/wind scores without evidence",
                          "resupplyWaste": "• Only mention services described or clearly inferable from area\n• For unknown services: '• [Service]: unknown — check before arrival'\n• Trash: assume pack-out for dispersed camping",
                          "connectivity": "• If description mentions signal: use that info\n• Otherwise: '• Cell coverage: unknown — check carrier coverage maps'\n• Do NOT invent carrier-specific coverage\n• Starlink: infer from terrain (open = likely good, canyon = likely poor)",
                          "rulesRisks": "• Camping type: infer from category (Wild Camping = dispersed, Established = designated)\n• BLM/USFS default: 14-day stay limit\n• Fire: use provided fire restriction data if available\n• Permit: say 'unknown — verify with local ranger' unless clearly free\n• Pack-out: assume required for dispersed",
                          "backupPlan": "• Do NOT invent specific backup spot names\n• Instead: suggest general strategy like 'drive back toward [nearest town area] for established campgrounds' or 'check iOverlander for nearby alternatives'"
                        }
                        """
                },
                new
                {
                    role = "user",
                    content = ctx.ToString()
                }
            },
            temperature = 0.3,
            max_tokens = 1200
        };

        try
        {
            var jsonPayload = JsonSerializer.Serialize(payload);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, ApiUrl)
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {apiKey}");

            var response = await http.SendAsync(httpRequest);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("OpenAI API error {Status}: {Body}", response.StatusCode, responseBody);
                return null;
            }

            var json = JsonSerializer.Deserialize<JsonElement>(responseBody);
            var content = json
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrEmpty(content))
                return null;

            content = content.Trim();
            if (content.StartsWith("```"))
            {
                var firstNewline = content.IndexOf('\n');
                if (firstNewline >= 0) content = content[(firstNewline + 1)..];
                if (content.EndsWith("```")) content = content[..^3];
                content = content.Trim();
            }

            var plan = JsonSerializer.Deserialize<TripPlanResult>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (plan != null)
                cache.Set(cacheKey, plan, TimeSpan.FromHours(1));

            return plan;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate trip plan for {Name}", request.Name);
            return null;
        }
    }

    public async Task<TripChatResponse?> GenerateTripChatAsync(TripChatRequest request)
    {
        var apiKey = config["OPENAI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("OPENAI_API_KEY not configured");
            return null;
        }

        var ctx = new StringBuilder();

        if (request.StartLocation is not null)
        {
            var startName = new[] { request.StartLocation.City, request.StartLocation.State }
                .Where(s => !string.IsNullOrEmpty(s)).ToArray();
            var startLabel = startName.Length > 0 ? string.Join(", ", startName) : $"{request.StartLocation.Lat:F2}°N, {Math.Abs(request.StartLocation.Lng):F2}°W";
            ctx.AppendLine($"START LOCATION: {startLabel} ({request.StartLocation.Lat:F4}°N, {Math.Abs(request.StartLocation.Lng):F4}°W)");
        }

        ctx.AppendLine($"DESTINATION: {request.Spot.Name}");
        ctx.AppendLine($"DESTINATION COORDINATES: {request.Spot.Lat:F4}°N, {Math.Abs(request.Spot.Lng):F4}°W");
        if (!string.IsNullOrEmpty(request.Spot.Category)) ctx.AppendLine($"TYPE: {request.Spot.Category}");
        if (!string.IsNullOrEmpty(request.Spot.Description)) ctx.AppendLine($"DESCRIPTION: {request.Spot.Description}");

        if (request.RouteInfo is not null)
        {
            ctx.AppendLine($"ROUTE: {request.RouteInfo.DistanceMiles:F1} miles, {request.RouteInfo.DurationFormatted}");
        }

        if (request.VanProfile is not null)
        {
            var vp = request.VanProfile;
            ctx.AppendLine("\nVAN PROFILE:");
            if (!string.IsNullOrEmpty(vp.VanType)) ctx.AppendLine($"  Vehicle: {vp.VanType}, {vp.LengthFt}ft");
            if (!string.IsNullOrEmpty(vp.Clearance)) ctx.AppendLine($"  Clearance: {vp.Clearance}");
            if (!string.IsNullOrEmpty(vp.Drivetrain)) ctx.AppendLine($"  Drivetrain: {vp.Drivetrain}");
            if (vp.WaterTankGal.HasValue) ctx.AppendLine($"  Water tank: {vp.WaterTankGal} gal");
            if (vp.FuelTankGal.HasValue) ctx.AppendLine($"  Fuel tank: {vp.FuelTankGal} gal, {vp.Mpg} MPG");
            if (vp.PeopleCount.HasValue) ctx.AppendLine($"  Crew: {vp.PeopleCount} people{(vp.HasPet == true ? " + pet" : "")}");
            if (vp.NeedsInternet == true) ctx.AppendLine("  Needs reliable internet");
        }

        if (!string.IsNullOrEmpty(request.RoutePoiContext))
        {
            ctx.AppendLine();
            ctx.AppendLine(request.RoutePoiContext);
        }

        var systemPrompt = $$"""
            You are a vanlife trip planning assistant. The user is driving from a START LOCATION to a DESTINATION.

            CONTEXT:
            {{ctx}}

            CRITICAL RULES — SELECTING STOPS:
            - You have been given a list of REAL, VERIFIED service locations along the actual driving route, organized by route segment.
            - When the user asks for stops, you MUST select from these provided locations. Use their exact names and coordinates.
            - NEVER invent locations or coordinates. ONLY use places from the provided list.
            - If no suitable service exists in the provided list for what the user needs, say so honestly.
            - Choose stops that are well-spaced along the route (e.g., fuel stops every 200-300 miles based on the van's fuel tank and MPG).
            - Consider the van profile when selecting stops (tank size, MPG, water needs, clearance).

            YOUR JOB:
            - Help the user plan their trip conversationally.
            - When suggesting stops, pick the best options from the provided service list based on spacing, category match, and user needs.
            - Keep responses short and helpful (2-4 sentences + waypoints if applicable).

            WAYPOINTS:
            When you suggest stops, include a "waypoints" array with the EXACT coordinates from the provided POI list.
            Only include waypoints when adding or modifying stops. For general chat, omit the waypoints field.

            RESPONSE FORMAT — respond with valid JSON only, no markdown fences:
            {
              "message": "Your conversational response here",
              "waypoints": [
                { "lat": 38.99, "lng": -110.15, "name": "Gas - Green River, UT", "type": "fuel" }
              ]
            }

            Valid waypoint types: "fuel", "water", "dump", "rest", "overnight", "propane", "other"

            If no waypoints are needed (general chat), respond:
            { "message": "Your response here" }
            """;

        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        foreach (var msg in request.Messages)
        {
            // Only allow user/assistant roles — block system role injection from client
            var role = msg.Role?.ToLowerInvariant();
            if (role is not ("user" or "assistant")) continue;
            messages.Add(new { role, content = msg.Content ?? "" });
        }

        var payload = new
        {
            model = "o3",
            messages,
            max_completion_tokens = 8000
        };

        try
        {
            var jsonPayload = JsonSerializer.Serialize(payload);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, ApiUrl)
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {apiKey}");

            var response = await http.SendAsync(httpRequest);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("OpenAI API error {Status}: {Body}", response.StatusCode, responseBody);
                return null;
            }

            var json = JsonSerializer.Deserialize<JsonElement>(responseBody);
            var content = json
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrEmpty(content))
            {
                logger.LogWarning("OpenAI returned empty content for trip chat");
                return new TripChatResponse("Sorry, I couldn't process that request. Please try again.", null);
            }

            content = content.Trim();
            if (content.StartsWith("```"))
            {
                var firstNewline = content.IndexOf('\n');
                if (firstNewline >= 0) content = content[(firstNewline + 1)..];
                if (content.EndsWith("```")) content = content[..^3];
                content = content.Trim();
            }

            logger.LogInformation("Trip chat raw AI response: {Content}", content);

            try
            {
                var chatResponse = JsonSerializer.Deserialize<TripChatResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return chatResponse;
            }
            catch (JsonException jsonEx)
            {
                logger.LogWarning(jsonEx, "Failed to parse AI response as JSON, returning as plain message. Content: {Content}", content);
                return new TripChatResponse(content, null);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate trip chat response for {Name}", request.Spot.Name);
            return null;
        }
    }
}
