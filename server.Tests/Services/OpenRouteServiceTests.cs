using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;
using server.Services;

namespace server.Tests.Services;

public class OpenRouteServiceTests
{
    private readonly MockHttpMessageHandler _mockHttp = new();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly IConfiguration _config;
    private readonly OpenRouteService _sut;

    public OpenRouteServiceTests()
    {
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["ORS_API_KEY"] = "test-key" })
            .Build();
        var client = _mockHttp.ToHttpClient();
        _sut = new OpenRouteService(client, _cache, _config, NullLogger<OpenRouteService>.Instance);
    }

    [Fact]
    public async Task GetRouteAsync_ReturnsRouteResult_OnSuccess()
    {
        var orsResponse = JsonSerializer.Serialize(new
        {
            features = new[]
            {
                new
                {
                    properties = new
                    {
                        summary = new { distance = 16093.4, duration = 900.0 }
                    }
                }
            }
        });
        _mockHttp.When("https://api.openrouteservice.org/*").Respond("application/json", orsResponse);

        var result = await _sut.GetRouteAsync(39.0, -106.0, 40.0, -105.0);

        Assert.NotNull(result);
        Assert.Equal(16093.4, result.DistanceMeters);
        Assert.Equal(900.0, result.DurationSeconds);
        Assert.Equal("15m", result.DurationFormatted);
        Assert.True(result.DistanceMiles > 9.9 && result.DistanceMiles < 10.1);
    }

    [Fact]
    public async Task GetRouteAsync_ReturnsNull_WhenApiKeyMissing()
    {
        var configNoKey = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();
        var client = _mockHttp.ToHttpClient();
        var sut = new OpenRouteService(client, _cache, configNoKey, NullLogger<OpenRouteService>.Instance);

        var result = await sut.GetRouteAsync(39.0, -106.0, 40.0, -105.0);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetRouteAsync_ReturnsNull_OnHttpError()
    {
        _mockHttp.When("https://api.openrouteservice.org/*").Respond(HttpStatusCode.InternalServerError);

        var result = await _sut.GetRouteAsync(39.0, -106.0, 40.0, -105.0);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetRouteAsync_FormatsHoursCorrectly()
    {
        var orsResponse = JsonSerializer.Serialize(new
        {
            features = new[]
            {
                new
                {
                    properties = new
                    {
                        summary = new { distance = 160934.0, duration = 7500.0 } // 2h 5m
                    }
                }
            }
        });
        _mockHttp.When("https://api.openrouteservice.org/*").Respond("application/json", orsResponse);

        var result = await _sut.GetRouteAsync(39.0, -106.0, 42.0, -105.0);

        Assert.NotNull(result);
        Assert.Equal("2h 5m", result.DurationFormatted);
    }

    [Fact]
    public async Task GetMatrixAsync_ReturnsResults_OnSuccess()
    {
        var matrixResponse = JsonSerializer.Serialize(new
        {
            durations = new[] { new[] { 600.0, 1200.0 } },
            distances = new[] { new[] { 10000.0, 20000.0 } }
        });
        _mockHttp.When("https://api.openrouteservice.org/v2/matrix/*").Respond("application/json", matrixResponse);

        var destinations = new List<(double lat, double lng)> { (40.0, -105.0), (41.0, -104.0) };
        var results = await _sut.GetMatrixAsync(39.0, -106.0, destinations);

        Assert.Equal(2, results.Count);
        Assert.NotNull(results[0]);
        Assert.NotNull(results[1]);
        Assert.Equal(10000.0, results[0]!.DistanceMeters);
        Assert.Equal(20000.0, results[1]!.DistanceMeters);
    }

    [Fact]
    public async Task GetMatrixAsync_ReturnsNulls_WhenApiKeyMissing()
    {
        var configNoKey = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();
        var client = _mockHttp.ToHttpClient();
        var sut = new OpenRouteService(client, _cache, configNoKey, NullLogger<OpenRouteService>.Instance);

        var destinations = new List<(double lat, double lng)> { (40.0, -105.0) };
        var results = await sut.GetMatrixAsync(39.0, -106.0, destinations);

        Assert.Single(results);
        Assert.Null(results[0]);
    }
}
