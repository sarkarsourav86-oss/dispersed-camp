using server.Models;
using server.Services.Interfaces;

namespace server.Routes;

public static class TripPlanRoutes
{
    public static void MapTripPlanRoutes(this WebApplication app)
    {
        app.MapPost("/api/trip-plan", async (TripPlanRequest request, IOpenAiService ai) =>
        {
            var plan = await ai.GenerateTripPlanAsync(request);
            return plan is not null
                ? Results.Ok(plan)
                : Results.NotFound("Could not generate trip plan");
        });
    }
}
