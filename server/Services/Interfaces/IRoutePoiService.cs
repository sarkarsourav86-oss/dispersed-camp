using server.Models;

namespace server.Services.Interfaces;

public interface IRoutePoiService
{
    Task<RoutePoiResult> FindPoisAlongRouteAsync(double[][] routeGeometry);
}
