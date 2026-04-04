using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;
using server.Models;
using server.Services;

namespace server.Tests.Services;

public class OpenAiServiceTests
{
    private readonly MockHttpMessageHandler _mockHttp = new();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly IConfiguration _config;
    private readonly OpenAiService _sut;

    public OpenAiServiceTests()
    {
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["OPENAI_API_KEY"] = "test-key" })
            .Build();
        var client = _mockHttp.ToHttpClient();
        _sut = new OpenAiService(client, _cache, _config, NullLogger<OpenAiService>.Instance);
    }

    private static TripPlanRequest CreateTestRequest() => new(
        Name: "Test Camp",
        Lat: 39.0,
        Lng: -106.0,
        Category: "Informal Campsite",
        Description: "Nice spot by the river",
        WeatherSummary: "Sunny, 75F",
        FireRestrictions: "None",
        DriveTime: "2h 30m",
        DistanceMiles: 120.5,
        VanType: "Sprinter",
        LengthFt: 22,
        Clearance: "High",
        Drivetrain: "4WD",
        WaterTankGal: 30,
        FuelTankGal: 25,
        Mpg: 15,
        PeopleCount: 2,
        HasPet: false,
        HasSolar: true,
        HasGenerator: false,
        NeedsInternet: true
    );

    private static string CreateMockOpenAiResponse(string content) =>
        JsonSerializer.Serialize(new
        {
            choices = new[]
            {
                new
                {
                    message = new { content }
                }
            }
        });

    private static string CreateValidTripPlanJson() =>
        JsonSerializer.Serialize(new
        {
            readiness = new { goodIf = new[] { "Dry weather" }, badIf = new[] { "Rain" } },
            stopPlan = "drive 2h",
            waterFuelMath = "30 gal ok",
            rigAccess = "4WD recommended",
            arrivalStrategy = "Arrive before 3pm",
            campConditions = "Quiet 8/10",
            resupplyWaste = "Water 10mi",
            connectivity = "Verizon good",
            rulesRisks = "14 day max",
            backupPlan = "Backup: Other Camp 5mi"
        });

    [Fact]
    public async Task GenerateTripPlanAsync_ReturnsPlan_OnSuccess()
    {
        var tripPlanJson = CreateValidTripPlanJson();
        var openAiResponse = CreateMockOpenAiResponse(tripPlanJson);
        _mockHttp.When("https://api.openai.com/*").Respond("application/json", openAiResponse);

        var result = await _sut.GenerateTripPlanAsync(CreateTestRequest());

        Assert.NotNull(result);
        Assert.NotNull(result.Readiness);
        Assert.Contains("Dry weather", result.Readiness.GoodIf);
        Assert.Equal("drive 2h", result.StopPlan);
    }

    [Fact]
    public async Task GenerateTripPlanAsync_StripsMarkdownFences()
    {
        var tripPlanJson = "```json\n" + CreateValidTripPlanJson() + "\n```";
        var openAiResponse = CreateMockOpenAiResponse(tripPlanJson);
        _mockHttp.When("https://api.openai.com/*").Respond("application/json", openAiResponse);

        var result = await _sut.GenerateTripPlanAsync(CreateTestRequest());

        Assert.NotNull(result);
        Assert.Equal("drive 2h", result.StopPlan);
    }

    [Fact]
    public async Task GenerateTripPlanAsync_ReturnsNull_WhenApiKeyMissing()
    {
        var configNoKey = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();
        var client = _mockHttp.ToHttpClient();
        var sut = new OpenAiService(client, _cache, configNoKey, NullLogger<OpenAiService>.Instance);

        var result = await sut.GenerateTripPlanAsync(CreateTestRequest());

        Assert.Null(result);
    }

    [Fact]
    public async Task GenerateTripPlanAsync_ReturnsNull_OnApiError()
    {
        _mockHttp.When("https://api.openai.com/*").Respond(HttpStatusCode.InternalServerError);

        var result = await _sut.GenerateTripPlanAsync(CreateTestRequest());

        Assert.Null(result);
    }

    [Fact]
    public async Task GenerateTripPlanAsync_ReturnsCachedResult_OnSecondCall()
    {
        var tripPlanJson = CreateValidTripPlanJson();
        var openAiResponse = CreateMockOpenAiResponse(tripPlanJson);
        var handler = new MockHttpMessageHandler();
        handler.Expect("https://api.openai.com/*").Respond("application/json", openAiResponse);
        var client = handler.ToHttpClient();
        var sut = new OpenAiService(client, _cache, _config, NullLogger<OpenAiService>.Instance);

        var request = CreateTestRequest();
        await sut.GenerateTripPlanAsync(request);
        await sut.GenerateTripPlanAsync(request);

        handler.VerifyNoOutstandingExpectation();
    }
}
