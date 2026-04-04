using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using server.Services.Interfaces;

namespace server.Services;

public class UsfsGisService(HttpClient http, IMemoryCache cache, ILogger<UsfsGisService> logger) : IUsfsGisService
{
    // USFS Proclaimed Forests / National Forest System boundaries
    private const string BaseUrl =
        "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/1/query";

    public async Task<JsonElement?> GetForestBoundariesAsync(
        double west, double south, double east, double north)
    {
        var snappedKey = $"usfs:{Math.Floor(west * 2) / 2}:{Math.Floor(south * 2) / 2}:{Math.Ceiling(east * 2) / 2}:{Math.Ceiling(north * 2) / 2}";

        if (cache.TryGetValue(snappedKey, out JsonElement cached))
            return cached;

        var query = new Dictionary<string, string>
        {
            ["geometry"] = $"{west},{south},{east},{north}",
            ["geometryType"] = "esriGeometryEnvelope",
            ["inSR"] = "4326",
            ["outSR"] = "4326",
            ["spatialRel"] = "esriSpatialRelIntersects",
            ["outFields"] = "FORESTNAME,REGION,FORESTNUMBER",
            ["returnGeometry"] = "true",
            ["f"] = "geojson",
            ["resultRecordCount"] = "200",
        };

        var url = BaseUrl + "?" + string.Join("&", query.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));

        try
        {
            var response = await http.GetStringAsync(url);
            var json = JsonSerializer.Deserialize<JsonElement>(response);
            cache.Set(snappedKey, json, TimeSpan.FromHours(24));
            return json;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch USFS boundaries for bbox {W},{S},{E},{N}", west, south, east, north);
            return null;
        }
    }
}
