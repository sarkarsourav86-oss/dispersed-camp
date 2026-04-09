using System.Text.Json;
using server.Models;
using server.Services.Interfaces;

namespace server.Services;

public class RoutePoiService(HttpClient http, IWebHostEnvironment env, IConfiguration config, ILogger<RoutePoiService> logger) : IRoutePoiService
{
    private const double SampleIntervalKm = 80; // ~50 miles between sample points
    private const double CorridorRadiusKm = 25;  // ~15 miles from route
    private const double EarthRadiusKm = 6371.0;

    // Service categories useful for route planning
    private static readonly HashSet<string> ServiceCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        "Campground", "Informal Campsite", "Wild Camping",
        "Water", "Sanitation Dump Station", "Propane"
    };

    /// <summary>
    /// Resolve the data source: blob URL in production, local files in dev.
    /// Config key IOVERLANDER_DATA_URL can override (set in Azure App Settings).
    /// </summary>
    private string? BlobBaseUrl => config["IOVERLANDER_DATA_URL"];

    private string? LocalDataDir
    {
        get
        {
            // Publish output path
            var publishPath = Path.Combine(env.ContentRootPath, "data", "ioverlander");
            if (Directory.Exists(publishPath)) return publishPath;
            // Dev path
            var devPath = Path.Combine(env.ContentRootPath, "..", "client", "public", "data", "ioverlander");
            if (Directory.Exists(devPath)) return devPath;
            return null;
        }
    }

    private bool UseBlob => !string.IsNullOrEmpty(BlobBaseUrl) && LocalDataDir == null;

    public async Task<RoutePoiResult> FindPoisAlongRouteAsync(double[][] routeGeometry)
    {
        if (routeGeometry.Length < 2)
            return new RoutePoiResult([], []);

        // Step 1: Sample points along the polyline every ~50 miles
        var samplePoints = SamplePolyline(routeGeometry, SampleIntervalKm);
        logger.LogInformation("Sampled {Count} points along route ({TotalKm:F0} km)", samplePoints.Count, TotalDistanceKm(routeGeometry));

        // Step 2: Determine which grid cells to load
        var gridCells = GetGridCellsForPoints(samplePoints);
        logger.LogInformation("Loading {Count} iOverlander grid cells", gridCells.Count);

        // Step 3: Load POIs from those cells
        var allPois = await LoadGridCellsAsync(gridCells);
        logger.LogInformation("Loaded {Count} total POIs from grid cells", allPois.Count);

        // Step 4: Filter POIs within corridor of the route
        var nearbyPois = FilterPoisNearRoute(allPois, routeGeometry, CorridorRadiusKm);
        logger.LogInformation("Found {Count} POIs within {Radius}km of route", nearbyPois.Count, CorridorRadiusKm);

        // Step 5: Calculate distance along route for each POI and sort
        foreach (var poi in nearbyPois)
        {
            poi.RouteDistanceKm = DistanceAlongRoute(routeGeometry, poi.Lat, poi.Lng);
        }
        nearbyPois.Sort((a, b) => a.RouteDistanceKm.CompareTo(b.RouteDistanceKm));

        // Step 6: Segment into route legs (~300km / ~200 miles each)
        var totalKm = TotalDistanceKm(routeGeometry);
        var segmentCount = Math.Max(1, (int)Math.Ceiling(totalKm / 300));
        var segmentLengthKm = totalKm / segmentCount;

        var segments = new List<RoutePoiSegment>();
        for (int i = 0; i < segmentCount; i++)
        {
            var startKm = i * segmentLengthKm;
            var endKm = (i + 1) * segmentLengthKm;
            var segmentPois = nearbyPois
                .Where(p => p.RouteDistanceKm >= startKm && p.RouteDistanceKm < endKm)
                .ToList();

            segments.Add(new RoutePoiSegment(
                SegmentIndex: i,
                StartMile: (int)(startKm * 0.621371),
                EndMile: (int)(endKm * 0.621371),
                Pois: segmentPois.Select(p => new RoutePoiItem(
                    p.Id, p.Name, p.Lat, p.Lng, p.Category,
                    (int)(p.RouteDistanceKm * 0.621371),
                    Math.Round(p.DistanceFromRouteKm * 0.621371, 1)
                )).ToList()
            ));
        }

        return new RoutePoiResult(nearbyPois.Select(p => new RoutePoiItem(
            p.Id, p.Name, p.Lat, p.Lng, p.Category,
            (int)(p.RouteDistanceKm * 0.621371),
            Math.Round(p.DistanceFromRouteKm * 0.621371, 1)
        )).ToList(), segments);
    }

    private List<(double lat, double lng, double cumulKm)> SamplePolyline(double[][] geometry, double intervalKm)
    {
        var samples = new List<(double lat, double lng, double cumulKm)>();
        if (geometry.Length == 0) return samples;

        samples.Add((geometry[0][0], geometry[0][1], 0));
        double cumulativeKm = 0;
        double nextSampleKm = intervalKm;

        for (int i = 1; i < geometry.Length; i++)
        {
            var segKm = HaversineKm(geometry[i - 1][0], geometry[i - 1][1], geometry[i][0], geometry[i][1]);
            cumulativeKm += segKm;

            while (cumulativeKm >= nextSampleKm)
            {
                var overshoot = cumulativeKm - nextSampleKm;
                var ratio = segKm > 0 ? 1.0 - (overshoot / segKm) : 1.0;
                var sLat = geometry[i - 1][0] + ratio * (geometry[i][0] - geometry[i - 1][0]);
                var sLng = geometry[i - 1][1] + ratio * (geometry[i][1] - geometry[i - 1][1]);
                samples.Add((sLat, sLng, nextSampleKm));
                nextSampleKm += intervalKm;
            }
        }

        var last = geometry[^1];
        if (samples.Count == 0 || HaversineKm(samples[^1].lat, samples[^1].lng, last[0], last[1]) > 1)
        {
            samples.Add((last[0], last[1], cumulativeKm));
        }

        return samples;
    }

    private static HashSet<string> GetGridCellsForPoints(List<(double lat, double lng, double cumulKm)> points)
    {
        var cells = new HashSet<string>();
        foreach (var (lat, lng, _) in points)
        {
            var baseLat = (int)Math.Floor(lat);
            var baseLng = (int)Math.Floor(lng);
            for (int dLat = -1; dLat <= 1; dLat++)
            {
                for (int dLng = -1; dLng <= 1; dLng++)
                {
                    cells.Add($"{baseLat + dLat}_{baseLng + dLng}");
                }
            }
        }
        return cells;
    }

    private async Task<List<RawIOverlanderPlace>> LoadGridCellsAsync(HashSet<string> cellKeys)
    {
        // Load manifest first to know which cells exist
        var manifest = await LoadManifestAsync();
        if (manifest.Count == 0)
        {
            logger.LogWarning("iOverlander manifest is empty — no data source available");
            return [];
        }

        var validKeys = cellKeys.Where(k => manifest.Contains(k)).ToList();
        var allPois = new List<RawIOverlanderPlace>();

        var tasks = validKeys.Select(async key =>
        {
            try
            {
                var json = UseBlob
                    ? await http.GetStringAsync($"{BlobBaseUrl}/{key}.json")
                    : await File.ReadAllTextAsync(Path.Combine(LocalDataDir!, $"{key}.json"));

                return JsonSerializer.Deserialize<List<RawIOverlanderPlace>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? [];
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to load grid cell {Key}", key);
                return new List<RawIOverlanderPlace>();
            }
        });

        var results = await Task.WhenAll(tasks);
        foreach (var places in results)
        {
            allPois.AddRange(places.Where(p => ServiceCategories.Contains(p.Category)));
        }

        return allPois;
    }

    private async Task<HashSet<string>> LoadManifestAsync()
    {
        try
        {
            string manifestJson;
            if (UseBlob)
            {
                manifestJson = await http.GetStringAsync($"{BlobBaseUrl}/manifest.json");
            }
            else if (LocalDataDir is not null)
            {
                manifestJson = await File.ReadAllTextAsync(Path.Combine(LocalDataDir, "manifest.json"));
            }
            else
            {
                logger.LogWarning("No iOverlander data source configured (no IOVERLANDER_DATA_URL and no local data)");
                return [];
            }

            var keys = JsonSerializer.Deserialize<string[]>(manifestJson) ?? [];
            return new HashSet<string>(keys);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not load iOverlander manifest");
            return [];
        }
    }

    private static List<RoutePoi> FilterPoisNearRoute(List<RawIOverlanderPlace> pois, double[][] geometry, double radiusKm)
    {
        var result = new List<RoutePoi>();
        var seen = new HashSet<string>();

        foreach (var poi in pois)
        {
            if (seen.Contains(poi.Id)) continue;

            var minDist = MinDistanceToPolylineKm(poi.Lat, poi.Lng, geometry);
            if (minDist <= radiusKm)
            {
                seen.Add(poi.Id);
                result.Add(new RoutePoi
                {
                    Id = poi.Id,
                    Name = poi.Name,
                    Lat = poi.Lat,
                    Lng = poi.Lng,
                    Category = poi.Category,
                    DistanceFromRouteKm = minDist,
                });
            }
        }

        return result;
    }

    private static double MinDistanceToPolylineKm(double lat, double lng, double[][] geometry)
    {
        double minDist = double.MaxValue;

        for (int i = 0; i < geometry.Length - 1; i += 5)
        {
            var dist = PointToSegmentDistanceKm(lat, lng, geometry[i][0], geometry[i][1], geometry[i + 1][0], geometry[i + 1][1]);
            if (dist < minDist) minDist = dist;
        }

        if (geometry.Length >= 2)
        {
            var dist = PointToSegmentDistanceKm(lat, lng, geometry[^2][0], geometry[^2][1], geometry[^1][0], geometry[^1][1]);
            if (dist < minDist) minDist = dist;
        }

        return minDist;
    }

    private static double PointToSegmentDistanceKm(double pLat, double pLng, double aLat, double aLng, double bLat, double bLng)
    {
        var dx = bLng - aLng;
        var dy = bLat - aLat;
        var lenSq = dx * dx + dy * dy;

        if (lenSq < 1e-10)
            return HaversineKm(pLat, pLng, aLat, aLng);

        var t = Math.Clamp(((pLng - aLng) * dx + (pLat - aLat) * dy) / lenSq, 0, 1);
        var closestLat = aLat + t * dy;
        var closestLng = aLng + t * dx;

        return HaversineKm(pLat, pLng, closestLat, closestLng);
    }

    private static double DistanceAlongRoute(double[][] geometry, double lat, double lng)
    {
        double cumulKm = 0;
        double minDist = double.MaxValue;
        double bestCumulKm = 0;

        for (int i = 0; i < geometry.Length - 1; i++)
        {
            var segKm = HaversineKm(geometry[i][0], geometry[i][1], geometry[i + 1][0], geometry[i + 1][1]);
            var dist = HaversineKm(lat, lng, geometry[i][0], geometry[i][1]);

            if (dist < minDist)
            {
                minDist = dist;
                bestCumulKm = cumulKm;
            }

            cumulKm += segKm;
        }

        var lastDist = HaversineKm(lat, lng, geometry[^1][0], geometry[^1][1]);
        if (lastDist < minDist)
        {
            bestCumulKm = cumulKm;
        }

        return bestCumulKm;
    }

    private static double TotalDistanceKm(double[][] geometry)
    {
        double total = 0;
        for (int i = 1; i < geometry.Length; i++)
        {
            total += HaversineKm(geometry[i - 1][0], geometry[i - 1][1], geometry[i][0], geometry[i][1]);
        }
        return total;
    }

    private static double HaversineKm(double lat1, double lng1, double lat2, double lng2)
    {
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return EarthRadiusKm * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private class RoutePoi
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string Category { get; set; } = "";
        public double DistanceFromRouteKm { get; set; }
        public double RouteDistanceKm { get; set; }
    }
}

internal class RawIOverlanderPlace
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string Category { get; set; } = "";
    public string? Description { get; set; }
    public string? DateVerified { get; set; }
}
