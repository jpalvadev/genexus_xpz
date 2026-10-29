using System.Text.Json;
using Gridify;
using Gridify.EntityFramework;
using Itrion.Api.Common.Storage;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Features.SecurityObservations;

public class SecurityObservationService : ISecurityObservationService {
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ItrionDbContext _context;
    private readonly ITenantLogoResolver _tenantLogoResolver;

    public SecurityObservationService(ItrionDbContext context, ITenantLogoResolver tenantLogoResolver) {
        _context = context;
        _tenantLogoResolver = tenantLogoResolver;
    }

    public async Task<Paging<SecurityObservationResponse>> GetAllAsync(GridifyQuery query) {
        var mapper = CreateMapper();
        var paged = await Query().GridifyAsync(WithDefaultSort(query), mapper);
        return new Paging<SecurityObservationResponse>(paged.Count, paged.Data.Select(MapToResponse).ToList());
    }

    public async Task<SecurityObservationResponse?> GetByIdAsync(int id) {
        var observation = await Query().FirstOrDefaultAsync(o => o.Id == id);
        return observation is null ? null : MapToResponse(observation);
    }

    public async Task<(SecurityObservationResponse? Response, string? Error)> CreateAsync(SecurityObservationRequest request) {
        var error = SecurityObservationRules.FirstViolation(request, Today());
        if (error is not null) return (null, error);

        var referenceError = await ValidateReferencesAsync(request, namedObserverIds: []);
        if (referenceError is not null) return (null, referenceError);

        var observerIds = ObserverIds(request);
        var observation = MapToEntity(request);
        // Created On is server-set on insert and never edited afterwards.
        observation.CreatedOn = DateTime.UtcNow;
        observation.Observers = observerIds.Select(observerId => new SecurityObservationObserver { ObserverId = observerId }).ToList();

        _context.Add(observation);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(observation.Id), null);
    }

    public async Task<(SecurityObservationResponse? Response, string? Error)> UpdateAsync(int id, SecurityObservationRequest request) {
        var observation = await _context.SecurityObservations
            .Include(o => o.Observers)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (observation is null) return (null, null);

        var error = SecurityObservationRules.FirstViolation(request, Today());
        if (error is not null) return (null, error);

        // Observers already named on the record stay named even if they went inactive:
        // deactivating an Observer never erases the Observations that name them (GLOSSARY.md).
        var referenceError = await ValidateReferencesAsync(request, namedObserverIds: observation.Observers.Select(x => x.ObserverId).ToList());
        if (referenceError is not null) return (null, referenceError);

        ApplyRequest(request, observation);

        // Observers are a set, so the join rows are replaced wholesale on update.
        _context.SecurityObservationObservers.RemoveRange(observation.Observers);
        var observerIds = ObserverIds(request);
        observation.Observers = observerIds.Select(observerId => new SecurityObservationObserver { ObserverId = observerId }).ToList();

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(id), null);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var observation = await _context.SecurityObservations
            .Include(o => o.Observers)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (observation is null) return false;

        // Join rows go with the observation; the FK to Observer is never cascaded (ADR 0002).
        _context.SecurityObservationObservers.RemoveRange(observation.Observers);
        _context.SecurityObservations.Remove(observation);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<byte[]> ExportAsync(GridifyQuery query) {
        var mapper = CreateMapper();
        var rows = await Query().ApplyFilteringAndOrdering(WithDefaultSort(query), mapper).ToListAsync();
        // No tenant, so no logo (ADR 0001).
        var logoBytes = await _tenantLogoResolver.ResolvePngLogoBytesAsync(null);
        return await SecurityObservationExcelExport.ExportAsync(rows.Select(MapToResponse).ToList(), logoBytes);
    }

    private IQueryable<SecurityObservation> Query() =>
        _context.SecurityObservations
            .Include(o => o.Plant)
            .Include(o => o.Sector)
            .Include(o => o.ContractorCompany)
            .Include(o => o.Observers).ThenInclude(x => x.Observer)
            .AsNoTracking();

    /// <summary>Mapper with SecurityObservationGridifyConfig applied — nested maps
    /// (plant.name, sector.name, company.name) are part of the grid contract (ticket 01).</summary>
    private static GridifyMapper<SecurityObservation> CreateMapper() {
        var mapper = GridifyBootstrapper.CreateMapper<SecurityObservation>();
        new SecurityObservationGridifyConfig().Configure(mapper);
        return mapper;
    }

    /// <summary>Created On is the grid's default order (GLOSSARY.md). Gridify OrderBy is "field direction".</summary>
    private static GridifyQuery WithDefaultSort(GridifyQuery query) {
        query.OrderBy = string.IsNullOrWhiteSpace(query.OrderBy) ? "createdOn desc" : query.OrderBy;
        return query;
    }

    private static DateOnly Today() => DateOnly.FromDateTime(DateTime.Today);

    private static List<int> ObserverIds(SecurityObservationRequest request) =>
        (request.Observers ?? []).Select(o => o.ObserverId).Distinct().ToList();

    /// <summary>
    /// Existence checks so a bad reference is a readable 400 instead of a foreign-key crash.
    /// <paramref name="namedObserverIds"/> are the Observers already on the record being updated.
    /// </summary>
    private async Task<string?> ValidateReferencesAsync(SecurityObservationRequest request, List<int> namedObserverIds) {
        if (!await _context.Plants.AnyAsync(p => p.Id == request.PlantId))
            return "Plant not found";

        if (!await _context.Sectors.AnyAsync(s => s.Id == request.SectorId))
            return "Sector not found";

        if (request.ContractorCompanyId is { } companyId &&
            !await _context.ContractorCompanies.AnyAsync(c => c.Id == companyId))
            return "Contractor Company not found";

        var observerIds = ObserverIds(request);
        var observers = await _context.Observers
            .Where(o => observerIds.Contains(o.Id))
            .Select(o => new { o.Id, o.Active })
            .ToListAsync();

        if (observers.Count != observerIds.Count)
            return "One or more Observers do not exist";

        var newlyNamed = observerIds.Except(namedObserverIds).ToList();
        if (observers.Where(o => newlyNamed.Contains(o.Id)).Any(o => !o.Active))
            return "Only Active Observers may be named on a Security Observation";

        return null;
    }

    private static void ApplyRequest(SecurityObservationRequest request, SecurityObservation observation) {
        observation.ObservationDate = request.ObservationDate;
        observation.Task = request.Task;
        observation.Lugar = request.Lugar;
        observation.PlantId = request.PlantId;
        observation.SectorId = request.SectorId;
        observation.ContractorCompanyId = request.ContractorCompanyId;

        observation.AprReviewed = request.AprReviewed;
        observation.TaskRealized = request.TaskRealized;
        observation.RequiresAtrReview = request.RequiresAtrReview;
        observation.TrcRisk = request.TrcRisk;
        observation.ImpactRiskControlled = request.ImpactRiskControlled;
        observation.HandInjuryMeasures = request.HandInjuryMeasures;
        observation.InjuryMeasures = request.InjuryMeasures;
        observation.ToolsReviewed = request.ToolsReviewed;
        observation.MobileEquipmentReviewed = request.MobileEquipmentReviewed;
        observation.EnergyReviewed = request.EnergyReviewed;
        observation.LadderReviewed = request.LadderReviewed;
        observation.ElectricalEquipmentCircuitBreaker = request.ElectricalEquipmentCircuitBreaker;

        observation.ControlesCriticos = request.ControlesCriticos ?? string.Empty;
        observation.GestionRiesgo = WriteLabels(request.GestionRiesgo);
        observation.ProtocolosMortales = WriteLabels(request.ProtocolosMortales);
        observation.ClasificacionObservacion = WriteLabels(request.ClasificacionObservacion);
        observation.RelacionObservacion = WriteLabels(request.RelacionObservacion);

        observation.ResumenObservacion = request.ResumenObservacion;
        observation.DetalleAI = request.DetalleAI;
        observation.DescripcionAC = request.DescripcionAC;
    }

    private static SecurityObservation MapToEntity(SecurityObservationRequest request) {
        var observation = new SecurityObservation();
        ApplyRequest(request, observation);
        return observation;
    }

    private static SecurityObservationResponse MapToResponse(SecurityObservation observation) =>
        new(
            observation.Id,
            observation.ObservationDate,
            observation.CreatedOn,
            observation.Task,
            observation.Lugar,
            observation.AprReviewed,
            observation.TaskRealized,
            observation.RequiresAtrReview,
            observation.TrcRisk,
            observation.ImpactRiskControlled,
            observation.HandInjuryMeasures,
            observation.InjuryMeasures,
            observation.ToolsReviewed,
            observation.MobileEquipmentReviewed,
            observation.EnergyReviewed,
            observation.LadderReviewed,
            observation.ElectricalEquipmentCircuitBreaker,
            observation.ControlesCriticos,
            ReadLabels(observation.GestionRiesgo),
            ReadLabels(observation.ProtocolosMortales),
            ReadLabels(observation.ClasificacionObservacion),
            ReadLabels(observation.RelacionObservacion),
            observation.ResumenObservacion,
            observation.DetalleAI,
            observation.DescripcionAC,
            new SecurityObservationPlantDto(observation.Plant.Id, observation.Plant.Name),
            new SecurityObservationSectorDto(observation.Sector.Id, observation.Sector.Name),
            observation.ContractorCompany is null
                ? null
                : new SecurityObservationCompanyDto(observation.ContractorCompany.Id, observation.ContractorCompany.Name),
            observation.Observers
                .Select(x => new SecurityObservationObserverDto(x.Observer.Id, x.Observer.FullName, x.Observer.Legajo, x.Observer.Active))
                .OrderBy(o => o.FullName)
                .ToList()
        );

    /// <summary>Multi-selects live in one column as a JSON array of labels (spec).</summary>
    private static List<string> ReadLabels(string json) =>
        string.IsNullOrWhiteSpace(json)
            ? []
            : JsonSerializer.Deserialize<List<string>>(json, JsonOptions) ?? [];

    private static string WriteLabels(List<string>? labels) =>
        JsonSerializer.Serialize(labels ?? [], JsonOptions);
}
