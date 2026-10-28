using Gridify;
using Gridify.EntityFramework;
using Itrion.Api.Common;
using Itrion.Api.Data;
using Itrion.Api.Features.EquipmentItems;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;
using Itrion.Api.Common.Storage;

namespace Itrion.Api.Features.EquipmentMaintenances;
public class EquipmentMaintenanceService : IEquipmentMaintenanceService {
    private readonly ItrionDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly ITenantLogoResolver _tenantLogoResolver;

    public EquipmentMaintenanceService(ItrionDbContext context, ITenantContext tenantContext, ITenantLogoResolver tenantLogoResolver) {
        _context = context;
        _tenantContext = tenantContext;
        _tenantLogoResolver = tenantLogoResolver;
    }

    public async Task<Paging<EquipmentMaintenanceResponse>> GetAllAsync(GridifyQuery query, bool isPaginated) {
        return await GetAll(query, isPaginated);
    }

    public async Task<Paging<EquipmentMaintenanceResponse>> GetAllForChartsAsync(GridifyQuery query, bool isPaginated) {
        return await GetAll(query, isPaginated);
    }

    public async Task<EquipmentMaintenanceResponse?> GetByIdAsync(int id) {
        // FindAsync no permite Includes, usamos FirstOrDefaultAsync para traer las relaciones
        var equipmentMaintenance = await _context.EquipmentMaintenances
            .Include(em => em.Person)
            .Include(em => em.EquipmentItem)
            .FirstOrDefaultAsync(em => em.Id == id);
        return equipmentMaintenance is null ? null : MapToResponse(equipmentMaintenance);
    }
    public async Task<EquipmentMaintenanceResponse> CreateAsync(EquipmentMaintenanceRequest request) {
        EquipmentMaintenance equipmentMaintenance = MapToEntity(request);
        _context.Add(equipmentMaintenance);
        await _context.SaveChangesAsync();
        await UpdateEquipmentItemStatusAsync(equipmentMaintenance.EquipmentItemId, request.Status, request.EquipmentStatus);
        return await GetByIdAsync(equipmentMaintenance.Id)
            ?? throw new Exception("Error al recuperar la entidad para la respuesta.");
    }

    public async Task<EquipmentMaintenanceResponse?> UpdateAsync(int id, EquipmentMaintenanceRequest request) {
        var equipmentMaintenanceInDb = await _context.EquipmentMaintenances
            .Include(em => em.EquipmentItem)
            .FirstOrDefaultAsync(em => em.Id == id);

        if (equipmentMaintenanceInDb is null) return null;

        var oldStatus = equipmentMaintenanceInDb.Status;
        var newStatus = request.Status;

        var updatedEquipmentMaintenance = MapToEntity(request);
        updatedEquipmentMaintenance.Id = equipmentMaintenanceInDb.Id;
        _context.Entry(equipmentMaintenanceInDb).CurrentValues.SetValues(updatedEquipmentMaintenance);
        await _context.SaveChangesAsync();

        if (request.EquipmentStatus.HasValue || oldStatus != newStatus) {
            await UpdateEquipmentItemStatusAsync(equipmentMaintenanceInDb.EquipmentItemId, newStatus, request.EquipmentStatus);
        }

        return await GetByIdAsync(id);
    }
    public async Task<bool> DeleteByIdAsync(int id) {
        var equipmentMaintenance = await _context.EquipmentMaintenances.FindAsync(id);
        if (equipmentMaintenance is null)
            return false;
        _context.EquipmentMaintenances.Remove(equipmentMaintenance);
        await _context.SaveChangesAsync();
        return true;
    }

private static EquipmentMaintenanceResponse MapToResponse(EquipmentMaintenance em) =>
    new EquipmentMaintenanceResponse(
        em.Id,
        em.Date,
        em.Type,
        em.Status,
        em.Activity,
        em.ClosedAt,
        new EquimentMaintenancePerson(
                em.Person.Id,
                em.Person.FirstName,
                em.Person.LastName,
                em.Person.Dni,
                em.Person.Email ?? string.Empty
            ),
            new EquipmentMaintenanceEquipmentItem(
                em.EquipmentItem.Id,
                em.EquipmentItem.Name,
                em.EquipmentItem.Code,
                em.EquipmentItem.Status
            )
        );

    private EquipmentMaintenance MapToEntity(EquipmentMaintenanceRequest request) {
        return new EquipmentMaintenance {
            Date = request.Date,
            Type = request.Type,
            Status = request.Status,
            Activity = request.Activity,
            EquipmentItemId = request.EquipmentItemId,
            PersonId = request.PersonId,
            ClosedAt = request.ClosedAt,
            TenantId = _tenantContext.TenantId,
        };
    }

    private async Task UpdateEquipmentItemStatusAsync(int equipmentItemId, EquipmentMaintenanceStatus maintenanceStatus, EquipmentItemStatus? explicitStatus = null) {
        var equipmentItem = await _context.EquipmentItems
            .FirstOrDefaultAsync(ei => ei.Id == equipmentItemId);

        if (equipmentItem is null) return;

        equipmentItem.Status = explicitStatus ?? (maintenanceStatus == EquipmentMaintenanceStatus.Pending
            ? EquipmentItemStatus.InRepair
            : EquipmentItemStatus.Operational);

        await _context.SaveChangesAsync();
    }

    private async Task<Paging<EquipmentMaintenanceResponse>> GetAll(GridifyQuery query, bool isPaginated) {

        var mapper = GridifyBootstrapper.CreateMapper<EquipmentMaintenance>();
        var baseQuery = _context.EquipmentMaintenances
            .Include(em => em.Person)
            .Include(em => em.EquipmentItem)
            .AsNoTracking();

        int totalCount;
        List<EquipmentMaintenance> entities;

        if (isPaginated) {
            var pagedResult = await baseQuery.GridifyAsync(query, mapper);
            entities = pagedResult.Data.ToList();
            totalCount = pagedResult.Count;
        } else {
            var filteredQuery = baseQuery.ApplyFilteringAndOrdering(query, mapper);
            entities = await filteredQuery.ToListAsync();
            totalCount = entities.Count;
        }

        var mappedData = entities.Select(r => MapToResponse(r)).ToList();

        return new Paging<EquipmentMaintenanceResponse>(totalCount, mappedData);
    }

    public async Task<byte[]> ExportAsync(GridifyQuery query) {
        var data = await GetAllAsync(query, isPaginated: false);
        var tenant = await _context.Tenants.FindAsync(_tenantContext.TenantId);
        var logoBytes = await _tenantLogoResolver.ResolvePngLogoBytesAsync(tenant?.LogoUrl);
        return await EquipmentMaintenanceExcelExport.ExportAsync(data.Data.ToList(), logoBytes);
    }


};



