using server.Models;

namespace server.Services.Interfaces;

public interface IOpenAiService
{
    Task<TripPlanResult?> GenerateTripPlanAsync(TripPlanRequest request);
    Task<TripChatResponse?> GenerateTripChatAsync(TripChatRequest request);
}
