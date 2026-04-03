namespace server.Models;

public record CampSpot(
    string Id,
    string Name,
    double Lat,
    double Lng,
    string LandType,   // "BLM" | "USFS" | "unknown"
    string Source,     // "osm" | "ridb"
    string? Description,
    string? Website
);

public record LandBoundary(
    string AgencyType,  // "BLM" | "USFS"
    object GeoJson      // raw GeoJSON FeatureCollection
);

public record RouteResult(
    double DistanceMeters,
    double DurationSeconds,
    double DistanceMiles,
    string DurationFormatted
);

public record FireRestrictionResult(
    bool RestrictionsActive,
    string Level,       // "none" | "stage1" | "stage2" | "closed"
    string? Message,
    string? SourceUrl
);
