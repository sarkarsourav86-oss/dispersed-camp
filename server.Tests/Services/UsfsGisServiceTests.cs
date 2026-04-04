using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;
using server.Services;

namespace server.Tests.Services;

public class UsfsGisServiceTests
{
    private readonly MockHttpMessageHandler _mockHttp = new();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly UsfsGisService _sut;

    public UsfsGisServiceTests()
    {
        var client = _mockHttp.ToHttpClient();
        _sut = new UsfsGisService(client, _cache, NullLogger<UsfsGisService>.Instance);
    }

    [Fact]
    public async Task GetForestBoundariesAsync_ReturnsGeoJson_OnSuccess()
    {
        var geojson = JsonSerializer.Serialize(new { type = "FeatureCollection", features = new[] { new { type = "Feature" } } });
        _mockHttp.When("https://apps.fs.usda.gov/*").Respond("application/json", geojson);

        var result = await _sut.GetForestBoundariesAsync(-106.0, 39.0, -105.0, 40.0);

        Assert.NotNull(result);
        Assert.Equal("FeatureCollection", result.Value.GetProperty("type").GetString());
    }

    [Fact]
    public async Task GetForestBoundariesAsync_ReturnsNull_OnHttpError()
    {
        _mockHttp.When("https://apps.fs.usda.gov/*").Respond(HttpStatusCode.InternalServerError);

        var result = await _sut.GetForestBoundariesAsync(-106.0, 39.0, -105.0, 40.0);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetForestBoundariesAsync_ReturnsCachedResult_OnSecondCall()
    {
        var geojson = JsonSerializer.Serialize(new { type = "FeatureCollection", features = Array.Empty<object>() });
        var handler = new MockHttpMessageHandler();
        handler.Expect("https://apps.fs.usda.gov/*").Respond("application/json", geojson);
        var client = handler.ToHttpClient();
        var sut = new UsfsGisService(client, _cache, NullLogger<UsfsGisService>.Instance);

        await sut.GetForestBoundariesAsync(-106.0, 39.0, -105.0, 40.0);
        await sut.GetForestBoundariesAsync(-106.0, 39.0, -105.0, 40.0);

        handler.VerifyNoOutstandingExpectation();
    }
}
