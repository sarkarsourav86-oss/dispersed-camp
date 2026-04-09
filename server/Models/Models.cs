namespace server.Models;

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

// Multi-stop routing
public record MultiStopRouteRequest(
    List<WaypointDto> Waypoints
);

public record WaypointDto(double Lat, double Lng);

public record MultiStopRouteLeg(
    double DistanceMeters,
    double DurationSeconds,
    double DistanceMiles,
    string DurationFormatted,
    double[][] Geometry  // array of [lat, lng] pairs
);

public record MultiStopRouteResult(
    List<MultiStopRouteLeg> Legs,
    double TotalDistanceMiles,
    double TotalDurationSeconds,
    string TotalDurationFormatted,
    double[][] Geometry  // full concatenated polyline [lat, lng]
);

// Route optimization
public record OptimizeRouteStop(double Lat, double Lng, string Id);

public record OptimizeRouteRequest(
    double StartLat,
    double StartLng,
    List<OptimizeRouteStop> Stops
);

public record OptimizeRouteResult(
    List<string> OrderedStopIds
);

// Trip chat
public record TripChatMessage(string Role, string Content);

public record TripChatSpot(
    string Name,
    double Lat,
    double Lng,
    string? Category,
    string? Description
);

public record TripChatRouteInfo(
    double DistanceMiles,
    double DurationSeconds,
    string DurationFormatted
);

public record TripChatVanProfile(
    string? VanType,
    int? LengthFt,
    string? Clearance,
    string? Drivetrain,
    int? WaterTankGal,
    int? FuelTankGal,
    int? Mpg,
    int? PeopleCount,
    bool? HasPet,
    bool? HasSolar,
    bool? HasGenerator,
    bool? NeedsInternet
);

public record TripChatStartLocation(
    double Lat,
    double Lng,
    string? City,
    string? State
);

public record TripChatRequest(
    List<TripChatMessage> Messages,
    TripChatSpot Spot,
    TripChatStartLocation? StartLocation,
    string? RoutePoiContext,
    TripChatVanProfile? VanProfile,
    TripChatRouteInfo? RouteInfo
);

public record TripChatWaypoint(
    double Lat,
    double Lng,
    string Name,
    string Type  // "fuel" | "water" | "dump" | "rest" | "overnight" | "propane" | "other"
);

public record TripChatResponse(
    string Message,
    List<TripChatWaypoint>? Waypoints
);

// Route POI search
public record RoutePoiItem(
    string Id,
    string Name,
    double Lat,
    double Lng,
    string Category,
    int MileAlongRoute,
    double MilesFromRoute
);

public record RoutePoiSegment(
    int SegmentIndex,
    int StartMile,
    int EndMile,
    List<RoutePoiItem> Pois
);

public record RoutePoiResult(
    List<RoutePoiItem> AllPois,
    List<RoutePoiSegment> Segments
);

public record RoutePoiRequest(
    double[][] RouteGeometry  // array of [lat, lng] pairs
);

public record TripPlanRequest(
    string Name,
    double Lat,
    double Lng,
    string? Category,
    string? Description,
    string? WeatherSummary,
    string? FireRestrictions,
    string? DriveTime,
    double? DistanceMiles,
    string? VanType,
    int? LengthFt,
    string? Clearance,
    string? Drivetrain,
    int? WaterTankGal,
    int? FuelTankGal,
    int? Mpg,
    int? PeopleCount,
    bool? HasPet,
    bool? HasSolar,
    bool? HasGenerator,
    bool? NeedsInternet
);

public record TripReadiness(
    string[] GoodIf,
    string[] BadIf
);

public record TripPlanResult(
    TripReadiness Readiness,
    string StopPlan,
    string WaterFuelMath,
    string RigAccess,
    string ArrivalStrategy,
    string CampConditions,
    string ResupplyWaste,
    string Connectivity,
    string RulesRisks,
    string BackupPlan
);
