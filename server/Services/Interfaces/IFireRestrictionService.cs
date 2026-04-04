using server.Models;

namespace server.Services.Interfaces;

public interface IFireRestrictionService
{
    Task<FireRestrictionResult> GetRestrictionsAsync(double lat, double lng);
}
