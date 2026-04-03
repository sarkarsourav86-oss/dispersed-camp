using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using server.Models;

namespace server.Services;

public class RidbService(HttpClient http, IMemoryCache cache, IConfiguration config, ILogger<RidbService> logger)
{
    private const string BaseUrl = "https://ridb.recreation.gov/api/v1";

    public async Task<List<CampSpot>> GetNearbyCampgroundsAsync(double lat, double lng, int radiusKm = 50)
    {
        var cacheKey = $"ridb:{lat:F2}:{lng:F2}:{radiusKm}";
        if (cache.TryGetValue(cacheKey, out List<CampSpot>? cached) && cached != null)
            return cached;

        var apiKey = config["RIDB_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("RIDB_API_KEY not configured — skipping RIDB spot fetch");
            return [];
        }

        var url = $"{BaseUrl}/facilities?latitude={lat}&longitude={lng}&radius={radiusKm}&activity=9&limit=50&apikey={apiKey}";

        try
        {
            var response = await http.GetStringAsync(url);
            var json = JsonSerializer.Deserialize<JsonElement>(response);
            var spots = new List<CampSpot>();

            if (json.TryGetProperty("RECDATA", out var recData))
            {
                foreach (var facility in recData.EnumerateArray())
                {
                    var id = facility.GetProperty("FacilityID").GetString() ?? "";
                    var name = facility.GetProperty("FacilityName").GetString() ?? "Campground";
                    var facilityLat = facility.GetProperty("FacilityLatitude").GetDouble();
                    var facilityLng = facility.GetProperty("FacilityLongitude").GetDouble();
                    var description = facility.TryGetProperty("FacilityDescription", out var desc)
                        ? desc.GetString() : null;

                    spots.Add(new CampSpot(
                        Id: $"ridb-{id}",
                        Name: name,
                        Lat: facilityLat,
                        Lng: facilityLng,
                        LandType: "unknown",
                        Source: "ridb",
                        Description: description,
                        Website: $"https://www.recreation.gov/camping/campgrounds/{id}"
                    ));
                }
            }

            cache.Set(cacheKey, spots, TimeSpan.FromHours(1));
            return spots;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch RIDB campgrounds near {Lat},{Lng}", lat, lng);
            return [];
        }
    }
}
