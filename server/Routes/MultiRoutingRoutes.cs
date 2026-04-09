using server.Models;
using server.Services.Interfaces;

namespace server.Routes;

public static class MultiRoutingRoutes
{
    public static void MapMultiRoutingRoutes(this WebApplication app)
    {
        app.MapPost("/api/routing/multi", async (MultiStopRouteRequest request, IOpenRouteService ors) =>
        {
            if (request.Waypoints is null || request.Waypoints.Count < 2)
                return Results.BadRequest("At least 2 waypoints are required");

            var waypoints = request.Waypoints.Select(w => (w.Lat, w.Lng)).ToList();
            var result = await ors.GetMultiStopRouteAsync(waypoints);
            return result is not null ? Results.Ok(result) : Results.NotFound("Could not calculate multi-stop route");
        });

        app.MapPost("/api/routing/pois", async (RoutePoiRequest request, IRoutePoiService poiService) =>
        {
            if (request.RouteGeometry is null || request.RouteGeometry.Length < 2)
                return Results.BadRequest("Route geometry with at least 2 points is required");

            if (request.RouteGeometry.Length > 1000)
                return Results.BadRequest("Route geometry exceeds maximum of 1000 points");

            var result = await poiService.FindPoisAlongRouteAsync(request.RouteGeometry);
            return Results.Ok(result);
        });

        app.MapPost("/api/routing/optimize", async (OptimizeRouteRequest request, IOpenRouteService ors) =>
        {
            if (request.Stops is null || request.Stops.Count < 2)
                return Results.BadRequest("At least 2 stops are required for optimization");

            var stops = request.Stops.Select(s => (s.Lat, s.Lng, s.Id)).ToList();
            var result = await ors.OptimizeRouteAsync(request.StartLat, request.StartLng, stops);
            return result is not null
                ? Results.Ok(new OptimizeRouteResult(result))
                : Results.NotFound("Could not optimize route");
        });
    }
}
