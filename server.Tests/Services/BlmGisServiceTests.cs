using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;
using server.Services;

namespace server.Tests.Services;

public class BlmGisServiceTests
{
    private readonly MockHttpMessageHandler _mockHttp = new();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly BlmGisService _sut;

    public BlmGisServiceTests()
    {
        var client = _mockHttp.ToHttpClient();
        _sut = new BlmGisService(client, _cache, NullLogger<BlmGisService>.Instance);
    }

    [Fact]
    public async Task GetLandBoundariesAsync_ReturnsGeoJson_OnSuccess()
    {
        var geojson = JsonSerializer.Serialize(new { type = "FeatureCollection", features = new[] { new { type = "Feature" } } });
        _mockHttp.When("https://gis.blm.gov/*").Respond("application/json", geojson);

        var result = await _sut.GetLandBoundariesAsync(-106.0, 39.0, -105.0, 40.0);

        Assert.NotNull(result);
        Assert.Equal("FeatureCollection", result.Value.GetProperty("type").GetString());
    }

    [Fact]
    public async Task GetLandBoundariesAsync_ReturnsNull_OnHttpError()
    {
        _mockHttp.When("https://gis.blm.gov/*").Respond(HttpStatusCode.InternalServerError);

        var result = await _sut.GetLandBoundariesAsync(-106.0, 39.0, -105.0, 40.0);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetLandBoundariesAsync_ReturnsCachedResult_OnSecondCall()
    {
        var geojson = JsonSerializer.Serialize(new { type = "FeatureCollection", features = Array.Empty<object>() });
        var handler = new MockHttpMessageHandler();
        handler.Expect("https://gis.blm.gov/*").Respond("application/json", geojson);
        var client = handler.ToHttpClient();
        var sut = new BlmGisService(client, _cache, NullLogger<BlmGisService>.Instance);

        var first = await sut.GetLandBoundariesAsync(-106.0, 39.0, -105.0, 40.0);
        var second = await sut.GetLandBoundariesAsync(-106.0, 39.0, -105.0, 40.0);

        Assert.NotNull(first);
        Assert.NotNull(second);
        handler.VerifyNoOutstandingExpectation();
    }

    [Fact]
    public async Task GetLandBoundariesAsync_SnapsToGrid_ForCacheHits()
    {
        var geojson = JsonSerializer.Serialize(new { type = "FeatureCollection", features = Array.Empty<object>() });
        var handler = new MockHttpMessageHandler();
        handler.Expect("https://gis.blm.gov/*").Respond("application/json", geojson);
        var client = handler.ToHttpClient();
        var sut = new BlmGisService(client, _cache, NullLogger<BlmGisService>.Instance);

        // Two slightly different bboxes that snap to the same 0.5-degree grid
        await sut.GetLandBoundariesAsync(-106.1, 39.1, -105.1, 39.9);
        await sut.GetLandBoundariesAsync(-106.2, 39.2, -105.2, 39.8);

        // Should only have made one HTTP call due to grid snapping
        handler.VerifyNoOutstandingExpectation();
    }
}
