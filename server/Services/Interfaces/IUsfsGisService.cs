using System.Text.Json;

namespace server.Services.Interfaces;

public interface IUsfsGisService
{
    Task<JsonElement?> GetForestBoundariesAsync(double west, double south, double east, double north);
}
