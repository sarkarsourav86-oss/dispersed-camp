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
            request.Headers.TryAddWithoutValidation("Authorization", apiKey);
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

    public async Task<MultiStopRouteResult?> GetMultiStopRouteAsync(List<(double lat, double lng)> waypoints)
    {
        if (waypoints.Count < 2) return null;

        var cacheKey = $"multi-route:{string.Join("|", waypoints.Select(w => $"{w.lat:F3},{w.lng:F3}"))}";
        if (cache.TryGetValue(cacheKey, out MultiStopRouteResult? cached))
            return cached;

        var apiKey = config["ORS_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("ORS_API_KEY not configured");
            return null;
        }

        var coordinates = waypoints.Select(w => new[] { w.lng, w.lat }).ToArray();
        var body = JsonSerializer.Serialize(new { coordinates });

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/directions/driving-car/geojson");
            request.Headers.TryAddWithoutValidation("Authorization", apiKey);
            request.Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");

            var response = await http.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var json = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());

            var feature = json.GetProperty("features")[0];
            var segments = feature.GetProperty("properties").GetProperty("segments");
            var coordsArray = feature.GetProperty("geometry").GetProperty("coordinates");

            // Parse full polyline geometry (ORS returns [lng, lat] — convert to [lat, lng])
            var fullGeometry = new List<double[]>();
            foreach (var coord in coordsArray.EnumerateArray())
            {
                var lng = coord[0].GetDouble();
                var lat = coord[1].GetDouble();
                fullGeometry.Add(new[] { lat, lng });
            }

            // Parse per-leg data from segments
            var legs = new List<MultiStopRouteLeg>();
            double totalDistMeters = 0;
            double totalDurSeconds = 0;

            foreach (var segment in segments.EnumerateArray())
            {
                var distMeters = segment.GetProperty("distance").GetDouble();
                var durSeconds = segment.GetProperty("duration").GetDouble();
                var distMiles = distMeters / 1609.34;
                var ts = TimeSpan.FromSeconds(durSeconds);
                var formatted = ts.TotalHours >= 1
                    ? $"{(int)ts.TotalHours}h {ts.Minutes}m"
                    : $"{ts.Minutes}m";

                // Extract leg geometry from steps waypoints
                var legSteps = segment.GetProperty("steps");
                var legCoords = new List<double[]>();
                foreach (var step in legSteps.EnumerateArray())
                {
                    var wayPts = step.GetProperty("way_points");
                    var startIdx = wayPts[0].GetInt32();
                    var endIdx = wayPts[1].GetInt32();
                    for (int i = startIdx; i <= endIdx; i++)
                    {
                        if (legCoords.Count == 0 || i > startIdx)
                        {
                            var c = coordsArray[i];
                            legCoords.Add(new[] { c[1].GetDouble(), c[0].GetDouble() });
                        }
                    }
                }

                legs.Add(new MultiStopRouteLeg(distMeters, durSeconds, distMiles, formatted, legCoords.ToArray()));
                totalDistMeters += distMeters;
                totalDurSeconds += durSeconds;
            }

            var totalMiles = totalDistMeters / 1609.34;
            var totalTs = TimeSpan.FromSeconds(totalDurSeconds);
            var totalFormatted = totalTs.TotalHours >= 1
                ? $"{(int)totalTs.TotalHours}h {totalTs.Minutes}m"
                : $"{totalTs.Minutes}m";

            var result = new MultiStopRouteResult(legs, totalMiles, totalDurSeconds, totalFormatted, fullGeometry.ToArray());
            cache.Set(cacheKey, result, TimeSpan.FromHours(6));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Multi-stop routing failed for {Count} waypoints", waypoints.Count);
            return null;
        }
    }

    public async Task<List<string>?> OptimizeRouteAsync(double startLat, double startLng, List<(double lat, double lng, string id)> stops)
    {
        if (stops.Count < 2) return stops.Select(s => s.id).ToList();

        var apiKey = config["ORS_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("ORS_API_KEY not configured");
            return null;
        }

        var jobs = stops.Select((s, i) => new { id = i + 1, location = new[] { s.lng, s.lat } }).ToArray();
        var vehicles = new[] { new { id = 1, start = new[] { startLng, startLat }, profile = "driving-car" } };
        var body = JsonSerializer.Serialize(new { jobs, vehicles });

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openrouteservice.org/optimization");
            request.Headers.TryAddWithoutValidation("Authorization", apiKey);
            request.Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");

            var response = await http.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var json = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());

            var steps = json.GetProperty("routes")[0].GetProperty("steps");
            var orderedIds = new List<string>();
            foreach (var step in steps.EnumerateArray())
            {
                if (step.GetProperty("type").GetString() == "job")
                {
                    var jobId = step.GetProperty("job").GetInt32();
                    orderedIds.Add(stops[jobId - 1].id);
                }
            }

            return orderedIds;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Route optimization failed for {Count} stops", stops.Count);
            return null;
        }
    }
}
