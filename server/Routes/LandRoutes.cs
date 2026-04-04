using server.Services.Interfaces;

namespace server.Routes;

public static class LandRoutes
{
    public static void MapLandRoutes(this WebApplication app)
    {
        app.MapGet("/api/land", async (
            double west, double south, double east, double north,
            IBlmGisService blm, IUsfsGisService usfs) =>
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
