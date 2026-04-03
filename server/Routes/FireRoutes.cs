using server.Services;

namespace server.Routes;

public static class FireRoutes
{
    public static void MapFireRoutes(this WebApplication app)
    {
        app.MapGet("/api/fire-restrictions", async (double lat, double lng, FireRestrictionService fireService) =>
        {
            var result = await fireService.GetRestrictionsAsync(lat, lng);
            return Results.Ok(result);
        });
    }
}
