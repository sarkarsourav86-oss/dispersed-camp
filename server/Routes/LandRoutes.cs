using server.Services;

namespace server.Routes;

public static class LandRoutes
{
    public static void MapLandRoutes(this WebApplication app)
    {
        app.MapGet("/api/land", async (
            double west, double south, double east, double north,
            BlmGisService blm, UsfsGisService usfs) =>
        {
            var blmTask = blm.GetLandBoundariesAsync(west, south, east, north);
            var usfsTask = usfs.GetForestBoundariesAsync(west, south, east, north);
            await Task.WhenAll(blmTask, usfsTask);
            var blmData = blmTask.Result;
            var usfsData = usfsTask.Result;

            return Results.Ok(new
            {
                blm = blmData,
                usfs = usfsData,
            });
        });
    }
}
