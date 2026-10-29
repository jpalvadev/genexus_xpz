using Itrion.Api.Features.EquipmentItems;
using Itrion.Api.Features.EquipmentMaintenances;

namespace Itrion.Api.Models;

/// <summary>
/// Demo rows baked into the initial migration (spec: migration-based SQLite with HasData seeds).
/// Ids are explicit so the seeds stay stable across `dotnet ef migrations add`.
/// No Security Observations are seeded: the Observation Date window is relative to today
/// (today-7 .. today+1), so baked-in observation dates would age out of the editable window.
/// </summary>
public static class SeedData {
    public static void Seed(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder) {
        SeedPlants(modelBuilder);
        SeedSectors(modelBuilder);
        SeedContractorCompanies(modelBuilder);
        SeedObservers(modelBuilder);
        SeedComboOptions(modelBuilder);
        SeedEquipmentReference(modelBuilder);
    }

    private static void SeedPlants(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder) =>
        // Legacy subtypes are baked into the label, e.g. "North Plant (RNV)".
        modelBuilder.Entity<Plant>().HasData(
            new { Id = 1, Name = "Planta Norte (RNV)" },
            new { Id = 2, Name = "Planta Sur (PLS)" },
            new { Id = 3, Name = "Planta Central (TSS)" },
            new { Id = 4, Name = "Planta Muelle (VQG)" }
        );

    private static void SeedSectors(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder) =>
        modelBuilder.Entity<Sector>().HasData(
            new { Id = 1, Name = "Seguridad Preventiva" },
            new { Id = 2, Name = "Control de Acceso" },
            new { Id = 3, Name = "Ronda y Vigilancia" },
            new { Id = 4, Name = "Respuesta a Emergencias" }
        );

    private static void SeedContractorCompanies(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder) =>
        modelBuilder.Entity<ContractorCompany>().HasData(
            new { Id = 1, Name = "Servicios de Seguridad Shield" },
            new { Id = 2, Name = "Dotaciones Guardian" },
            new { Id = 3, Name = "Protección de Instalaciones Apex" }
        );

    private static void SeedObservers(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder) {
        modelBuilder.Entity<Observer>().HasData(
            new { Id = 1, Legajo = 1001, FullName = "Elena Herrera", Objective = "Ronda perimetral y control de accesos", Post = ObserverPost.Jefe, Active = true },
            new { Id = 2, Legajo = 1002, FullName = "Rubén Mercado", Objective = "Simulacros de incendio y respuesta a emergencias", Post = ObserverPost.Supervisor, Active = true },
            new { Id = 3, Legajo = 1003, FullName = "Javier Sosa", Objective = "Escolta de contratistas y control de portería", Post = ObserverPost.Supervisor, Active = true },
            new { Id = 4, Legajo = 1004, FullName = "Nora Peralta", Objective = "Supervisión del programa de seguridad", Post = ObserverPost.Gerente, Active = false }
        );

        modelBuilder.Entity<ObserverPlantAssignment>().HasData(
            new { ObserverId = 1, PlantId = 1 },
            new { ObserverId = 1, PlantId = 3 },
            new { ObserverId = 2, PlantId = 2 },
            new { ObserverId = 3, PlantId = 4 },
            new { ObserverId = 4, PlantId = 1 },
            new { ObserverId = 4, PlantId = 2 }
        );
    }

    private static void SeedComboOptions(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder) {
        var options = new (string ComboKey, string[] Labels)[] {
            ("gestionRiesgo", ["Charla de Riesgo Diario (DRT)", "Análisis de Seguridad del Trabajo (JSA)", "Permiso de Trabajo", "Charla de Toolbox"]),
            ("protocolosMortales", ["Trabajo en Altura", "Aislamiento de Energía (LOTO)", "Ingreso a Espacio Confinado", "Trabajo en Caliente", "Equipo Móvil en Movimiento", "Excavación"]),
            ("clasificacionObservacion", ["Acto Seguro", "Condición Segura", "Acto de Riesgo", "Control Defensivo"]),
            ("relacionObservacion", ["Relacionado con APR", "Relacionado con ATR", "Relacionado con la Tarea", "Relacionado con Condiciones del Sitio"]),
        };

        var id = 1;
        foreach (var (comboKey, labels) in options) {
            for (var i = 0; i < labels.Length; i++) {
                modelBuilder.Entity<ComboOption>().HasData(new { Id = id, ComboKey = comboKey, Label = labels[i], Order = i + 1 });
                id++;
            }
        }
    }

    private static void SeedEquipmentReference(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder) {
        modelBuilder.Entity<Person>().HasData(
            new { Id = 1, FirstName = "Ivan", LastName = "Quiroga", Dni = 30112233, Email = "ivan.quiroga@example.com" },
            new { Id = 2, FirstName = "Sela", LastName = "Rivas", Dni = 31445566, Email = (string?)null },
            new { Id = 3, FirstName = "Tom", LastName = "Bermudez", Dni = 32778899, Email = "tom.bermudez@example.com" }
        );

        modelBuilder.Entity<EquipmentItem>().HasData(
            new { Id = 1, Name = "Conveyor Line A", Code = "EQ-001", Status = EquipmentItemStatus.Operational },
            new { Id = 2, Name = "Forklift 12", Code = "EQ-002", Status = EquipmentItemStatus.InRepair },
            new { Id = 3, Name = "Boiler 3", Code = "EQ-003", Status = EquipmentItemStatus.OutOfService }
        );

        modelBuilder.Entity<EquipmentMaintenance>().HasData(
            new {
                Id = 1,
                Date = new DateOnly(2026, 5, 4),
                Type = EquipmentMaintenanceType.Preventive,
                Status = EquipmentMaintenanceStatus.Completed,
                Activity = "Belt tension and roller inspection",
                ClosedAt = new DateOnly(2026, 5, 6),
                EquipmentItemId = 1,
                PersonId = 1,
            },
            new {
                Id = 2,
                Date = new DateOnly(2026, 6, 18),
                Type = EquipmentMaintenanceType.Corrective,
                Status = EquipmentMaintenanceStatus.Pending,
                Activity = "Hydraulic pump replacement",
                ClosedAt = (DateOnly?)null,
                EquipmentItemId = 2,
                PersonId = 2,
            }
        );
    }
}
