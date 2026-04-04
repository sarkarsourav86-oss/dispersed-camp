using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using server.Models;
using server.Services.Interfaces;

namespace server.Services;

public class OpenRouteService(HttpClient http, IMemoryCache cache, IConfiguration config, ILogger<OpenRouteService> logger) : IOpenRouteService
{
    private const string BaseUrl = "https://api.openrouteservice.org/v2";

    public async Task<RouteResult?> GetRouteAsync(double fromLat, double fromLng, double toLat, double toLng)
    {
        var cacheKey = $"route:{fromLat:F3}:{fromLng:F3}:{toLat:F3}:{toLng:F3}";
        if (cache.TryGetValue(cacheKey, out RouteResult? cached))
            return cached;

        var apiKey = config["ORS_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("ORS_API_KEY not configured");
            return null;
        }

        var url = $"{BaseUrl}/directions/driving-car?api_key={apiKey}&start={fromLng},{fromLat}&end={toLng},{toLat}";

        try
        {
            var response = await http.GetStringAsync(url);
            var json = JsonSerializer.Deserialize<JsonElement>(response);

            var summary = json
                .GetProperty("features")[0]
                .GetProperty("properties")
                .GetProperty("summary");

            var distanceMeters = summary.GetProperty("distance").GetDouble();
            var durationSeconds = summary.GetProperty("duration").GetDouble();
            var distanceMiles = distanceMeters / 1609.34;
            var duration = TimeSpan.FromSeconds(durationSeconds);
            var formatted = duration.TotalHours >= 1
                ? $"{(int)duration.TotalHours}h {duration.Minutes}m"
                : $"{duration.Minutes}m";

            var result = new RouteResult(distanceMeters, durationSeconds, distanceMiles, formatted);
            cache.Set(cacheKey, result, TimeSpan.FromHours(6));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get route from {From} to {To}", $"{fromLat},{fromLng}", $"{toLat},{toLng}");
            return null;
        }
    }

    /// <summary>
    /// Batch drive-time matrix: get distances from one origin to multiple destinations.
    /// </summary>
    public async Task<List<RouteResult?>> GetMatrixAsync(double fromLat, double fromLng, List<(double lat, double lng)> destinations)
    {
        var apiKey = config["ORS_API_KEY"];
        if (string.IsNullOrEmpty(apiKey) || destinations.Count == 0)
            return destinations.Select(_ => (RouteResult?)null).ToList();

        // ORS matrix: locations[0] is origin, rest are destinations
        var locations = new List<double[]> { new double[] { fromLng, fromLat } };
        locations.AddRange(destinations.Select(d => new double[] { d.lng, d.lat }));

        var body = JsonSerializer.Serialize(new
        {
            locations,
            sources = new[] { 0 },
            destinations = Enumerable.Range(1, destinations.Count).ToArray(),
            metrics = new[] { "distance", "duration" },
        });

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/matrix/driving-car");
            request.Headers.Add("Authorization", apiKey);
            request.Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");

            var response = await http.SendAsync(request);
            var json = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());

            var durations = json.GetProperty("durations")[0];
            var distances = json.GetProperty("distances")[0];

            var results = new List<RouteResult?>();
            for (int i = 0; i < destinations.Count; i++)
            {
                var durationSecs = durations[i].GetDouble();
                var distMeters = distances[i].GetDouble();
                var distMiles = distMeters / 1609.34;
                var ts = TimeSpan.FromSeconds(durationSecs);
                var formatted = ts.TotalHours >= 1
                    ? $"{(int)ts.TotalHours}h {ts.Minutes}m"
                    : $"{ts.Minutes}m";
                results.Add(new RouteResult(distMeters, durationSecs, distMiles, formatted));
            }
            return results;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Matrix routing failed");
            return destinations.Select(_ => (RouteResult?)null).ToList();
        }
    }
}
