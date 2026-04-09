using server.Models;

namespace server.Services.Interfaces;

public interface IOpenRouteService
{
    Task<RouteResult?> GetRouteAsync(double fromLat, double fromLng, double toLat, double toLng);
    Task<List<RouteResult?>> GetMatrixAsync(double fromLat, double fromLng, List<(double lat, double lng)> destinations);
    Task<MultiStopRouteResult?> GetMultiStopRouteAsync(List<(double lat, double lng)> waypoints);
    Task<List<string>?> OptimizeRouteAsync(double startLat, double startLng, List<(double lat, double lng, string id)> stops);
}
