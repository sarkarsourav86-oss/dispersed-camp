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

        app.MapPost("/api/trip-chat", async (TripChatRequest request, IOpenAiService ai) =>
        {
            if (request.Messages is null || request.Messages.Count == 0)
                return Results.BadRequest("At least one message is required");

            if (request.Messages.Count > 30)
                return Results.BadRequest("Too many messages. Start a new conversation.");

            // Limit individual message length to prevent cost amplification
            if (request.Messages.Any(m => (m.Content?.Length ?? 0) > 2000))
                return Results.BadRequest("Message too long (max 2000 characters)");

            // Limit route POI context size
            if ((request.RoutePoiContext?.Length ?? 0) > 15000)
                return Results.BadRequest("Route context too large");

            var response = await ai.GenerateTripChatAsync(request);
            return response is not null
                ? Results.Ok(response)
                : Results.NotFound("Could not generate chat response");
        });
    }
}
