using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Text.Json;
using server.Models;

namespace server.Services;

public class OpenAiService(HttpClient http, IMemoryCache cache, IConfiguration config, ILogger<OpenAiService> logger)
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

                        RULES:
                        - If ACTUAL DRIVE TIME and ACTUAL DISTANCE are provided, use those exact numbers. NEVER guess drive time.
                        - Use bullet points and short facts. NO paragraphs.
                        - Every line must help decide, pack, route, or avoid a problem.
                        - Use numbers, distances, and specific details wherever possible.
                        - Tailor everything to the specific van profile provided.
                        - Use newline-separated bullet points starting with • for each item.

                        Respond with valid JSON only, no markdown fences. Use this exact structure:
                        {
                          "readiness": {
                            "goodIf": ["condition 1", "condition 2", "condition 3"],
                            "badIf": ["condition 1", "condition 2"]
                          },
                          "stopPlan": "• Total drive: X hours\n• Best departure: before X PM\n• Last fuel: location, X miles before site\n• Last grocery: location, X miles\n• Road warning: details",
                          "waterFuelMath": "• Min water: X gal per person\n• With your X-gal tank: good for X people for X days\n• No refill on site\n• Nearest refill: location, X miles\n• Round-trip fuel: X gal needed\n• Tank buffer: keep at least half full",
                          "rigAccess": "• Best for: van types\n• Access: 2WD/AWD rating in dry/wet\n• Clearance risk: low/none/high\n• Max rig length: X ft\n• Turnaround space: details\n• Avoid if: conditions",
                          "arrivalStrategy": "• Arrive before: X PM\n• Best spots fill: day/time\n• Weekend crowd: level\n• Scout in daylight: yes/no and why\n• Ground: level/slope/soft",
                          "campConditions": "• Quiet: X/10\n• Privacy: X/10\n• Wind exposure: level\n• Solar exposure: level\n• Shade: level\n• Ground: surface type",
                          "resupplyWaste": "• Potable water: on-site or X miles\n• Dump station: X miles direction\n• Trash: pack out or dumpster\n• Propane: location, X miles\n• Groceries: location, X miles\n• Laundromat: location, X miles\n• Showers: location or none",
                          "connectivity": "• Verizon: likely coverage level\n• T-Mobile: likely coverage level\n• AT&T: likely coverage level\n• Hotspot workability: yes/no\n• Nearest Wi-Fi fallback: location\n• Starlink: likely clear sky view",
                          "rulesRisks": "• Camping type: dispersed/designated\n• Max stay: X days\n• Fire status: current restrictions\n• Permit: needed or not\n• Pack-out: required/not\n• Wildlife: precautions\n• Safety: notes",
                          "backupPlan": "• Backup 1: name, X miles direction, why\n• Backup 2: name, X miles direction, why"
                        }
                        """
                },
                new
                {
                    role = "user",
                    content = ctx.ToString()
                }
            },
            temperature = 0.7,
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
}
