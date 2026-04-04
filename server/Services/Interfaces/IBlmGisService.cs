using System.Text.Json;

namespace server.Services.Interfaces;

public interface IBlmGisService
{
    Task<JsonElement?> GetLandBoundariesAsync(double west, double south, double east, double north);
}
