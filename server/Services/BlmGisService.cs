using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace server.Services;

public class BlmGisService(HttpClient http, IMemoryCache cache, ILogger<BlmGisService> logger)
{
    // BLM National Surface Management Agency layer
    private const string BaseUrl =
        "https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_Official/MapServer/1/query";

    public async Task<JsonElement?> GetLandBoundariesAsync(
        double west, double south, double east, double north)
    {
        // Snap bbox to 0.5-degree grid for cache hit rate
        var snappedKey = $"blm:{Math.Floor(west * 2) / 2}:{Math.Floor(south * 2) / 2}:{Math.Ceiling(east * 2) / 2}:{Math.Ceiling(north * 2) / 2}";

        if (cache.TryGetValue(snappedKey, out JsonElement cached))
            return cached;

        var query = new Dictionary<string, string>
        {
            ["geometry"] = $"{west},{south},{east},{north}",
            ["geometryType"] = "esriGeometryEnvelope",
            ["inSR"] = "4326",
            ["outSR"] = "4326",
            ["spatialRel"] = "esriSpatialRelIntersects",
            ["outFields"] = "ADMIN_ST,ADMU_NAME,BLM_ORG_CD",
            ["returnGeometry"] = "true",
            ["f"] = "geojson",
            ["resultRecordCount"] = "500",
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
            logger.LogError(ex, "Failed to fetch BLM boundaries for bbox {W},{S},{E},{N}", west, south, east, north);
            return null;
        }
    }
}
