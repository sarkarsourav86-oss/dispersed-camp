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
