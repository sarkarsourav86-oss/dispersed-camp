using server.Models;

namespace server.Services.Interfaces;

public interface IOpenRouteService
{
    Task<RouteResult?> GetRouteAsync(double fromLat, double fromLng, double toLat, double toLng);
    Task<List<RouteResult?>> GetMatrixAsync(double fromLat, double fromLng, List<(double lat, double lng)> destinations);
}
