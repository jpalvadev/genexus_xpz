using Itrion.Api.Common.Storage;
using Itrion.Api.Features.EquipmentMaintenances;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings:Default is required.");

builder.Services.AddDbContext<ItrionDbContext>(options => options.UseSqlite(connectionString));

// Export logo resolution is not part of this single-tenant MVP (ADR 0001).
builder.Services.AddSingleton<ITenantLogoResolver, NoLogoTenantLogoResolver>();

builder.Services.AddScoped<IEquipmentMaintenanceService, EquipmentMaintenanceService>();

// The only client of this local API is the Vite dev server.
const string ViteDevOrigin = "ViteDev";
builder.Services.AddCors(options => options.AddPolicy(ViteDevOrigin, policy =>
    policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();

    // Local app: the schema and its demo seeds are applied on start-up.
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<ItrionDbContext>().Database.Migrate();
}

// No HTTPS redirection: this is a loopback HTTP API called by the Vite dev server.
app.UseCors(ViteDevOrigin);

app.MapControllers();

app.Run();
