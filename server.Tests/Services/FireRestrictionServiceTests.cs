using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;
using server.Services;

namespace server.Tests.Services;

public class FireRestrictionServiceTests
{
    private readonly MockHttpMessageHandler _mockHttp = new();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly FireRestrictionService _sut;

    public FireRestrictionServiceTests()
    {
        var client = _mockHttp.ToHttpClient();
        _sut = new FireRestrictionService(client, _cache, NullLogger<FireRestrictionService>.Instance);
    }

    [Fact]
    public async Task GetRestrictionsAsync_ReturnsActive_WhenFeaturesExist()
    {
        var json = JsonSerializer.Serialize(new
        {
            features = new[] { new { attributes = new { IncidentName = "Test Fire" } } }
        });
        _mockHttp.When("https://gis.blm.gov/*").Respond("application/json", json);

        var result = await _sut.GetRestrictionsAsync(39.0, -106.0);

        Assert.True(result.RestrictionsActive);
        Assert.Equal("stage1", result.Level);
        Assert.NotNull(result.Message);
        Assert.NotNull(result.SourceUrl);
    }

    [Fact]
    public async Task GetRestrictionsAsync_ReturnsInactive_WhenNoFeatures()
    {
        var json = JsonSerializer.Serialize(new { features = Array.Empty<object>() });
        _mockHttp.When("https://gis.blm.gov/*").Respond("application/json", json);

        var result = await _sut.GetRestrictionsAsync(39.0, -106.0);

        Assert.False(result.RestrictionsActive);
        Assert.Equal("none", result.Level);
        Assert.Null(result.Message);
    }

    [Fact]
    public async Task GetRestrictionsAsync_ReturnsDefault_OnHttpError()
    {
        _mockHttp.When("https://gis.blm.gov/*").Respond(HttpStatusCode.InternalServerError);

        var result = await _sut.GetRestrictionsAsync(39.0, -106.0);

        Assert.False(result.RestrictionsActive);
        Assert.Equal("none", result.Level);
    }

    [Fact]
    public async Task GetRestrictionsAsync_ReturnsCachedResult_OnSecondCall()
    {
        var json = JsonSerializer.Serialize(new { features = Array.Empty<object>() });
        var handler = new MockHttpMessageHandler();
        handler.Expect("https://gis.blm.gov/*").Respond("application/json", json);
        var client = handler.ToHttpClient();
        var sut = new FireRestrictionService(client, _cache, NullLogger<FireRestrictionService>.Instance);

        await sut.GetRestrictionsAsync(39.0, -106.0);
        await sut.GetRestrictionsAsync(39.0, -106.0);

        handler.VerifyNoOutstandingExpectation();
    }
}
