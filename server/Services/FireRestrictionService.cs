using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using server.Models;

namespace server.Services;

public class FireRestrictionService(HttpClient http, IMemoryCache cache, ILogger<FireRestrictionService> logger)
{
    // BLM fire restrictions layer (ArcGIS feature service)
    private const string BaseUrl =
        "https://gis.blm.gov/arcgis/rest/services/fire/BLM_Natl_Fire_Perimeters/MapServer/0/query";

    public async Task<FireRestrictionResult> GetRestrictionsAsync(double lat, double lng)
    {
        var cacheKey = $"fire:{lat:F1}:{lng:F1}";
        if (cache.TryGetValue(cacheKey, out FireRestrictionResult? cached) && cached != null)
            return cached;

        // Query a small buffer (0.5 degree) around the point
        var west = lng - 0.5; var east = lng + 0.5;
        var south = lat - 0.5; var north = lat + 0.5;

        var query = new Dictionary<string, string>
        {
            ["geometry"] = $"{west},{south},{east},{north}",
            ["geometryType"] = "esriGeometryEnvelope",
            ["inSR"] = "4326",
            ["spatialRel"] = "esriSpatialRelIntersects",
            ["outFields"] = "IncidentName,FireDiscoveryDateTime",
            ["returnGeometry"] = "false",
            ["f"] = "json",
        };

        var url = BaseUrl + "?" + string.Join("&", query.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));

        try
        {
            var response = await http.GetStringAsync(url);
            var json = JsonSerializer.Deserialize<JsonElement>(response);
            var hasFeatures = json.TryGetProperty("features", out var features) && features.GetArrayLength() > 0;

            var result = hasFeatures
                ? new FireRestrictionResult(
                    RestrictionsActive: true,
                    Level: "stage1",
                    Message: "Active fire activity detected near this location. Check local BLM office for current restrictions.",
                    SourceUrl: "https://www.blm.gov/programs/public-safety-and-fire/fire-and-aviation")
                : new FireRestrictionResult(
                    RestrictionsActive: false,
                    Level: "none",
                    Message: null,
                    SourceUrl: null);

            cache.Set(cacheKey, result, TimeSpan.FromHours(4));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to check fire restrictions at {Lat},{Lng}", lat, lng);
            return new FireRestrictionResult(false, "none", null, null);
        }
    }
}
