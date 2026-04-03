using server.Services;

namespace server.Routes;

public static class RoutingRoutes
{
    public static void MapRoutingRoutes(this WebApplication app)
    {
        app.MapGet("/api/routing", async (
            double fromLat, double fromLng, double toLat, double toLng,
            OpenRouteService ors) =>
        {
            var result = await ors.GetRouteAsync(fromLat, fromLng, toLat, toLng);
            return result is not null ? Results.Ok(result) : Results.NotFound("Could not calculate route");
        });
    }
}
