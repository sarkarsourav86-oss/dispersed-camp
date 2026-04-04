using server.Routes;
using server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddScoped<BlmGisService>();
builder.Services.AddScoped<UsfsGisService>();
builder.Services.AddScoped<OpenRouteService>();
builder.Services.AddScoped<FireRestrictionService>();
builder.Services.AddScoped<OpenAiService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration["CORS_ORIGIN"]?.Split(',')
            ?? ["http://localhost:5173", "http://localhost:4173"];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.UseHttpsRedirection();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.MapLandRoutes();
app.MapRoutingRoutes();
app.MapFireRoutes();
app.MapTripPlanRoutes();

app.Run();
