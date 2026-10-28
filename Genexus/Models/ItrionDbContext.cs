using Itrion.Api.Features.EquipmentItems;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Models;

public class ItrionDbContext(DbContextOptions<ItrionDbContext> options) : DbContext(options) {
    public DbSet<Person> Persons => Set<Person>();
    public DbSet<EquipmentItem> EquipmentItems => Set<EquipmentItem>();
    public DbSet<EquipmentMaintenance> EquipmentMaintenances => Set<EquipmentMaintenance>();
    public DbSet<Plant> Plants => Set<Plant>();
    public DbSet<Sector> Sectors => Set<Sector>();
    public DbSet<ContractorCompany> ContractorCompanies => Set<ContractorCompany>();
    public DbSet<Observer> Observers => Set<Observer>();
    public DbSet<ObserverPlantAssignment> ObserverPlantAssignments => Set<ObserverPlantAssignment>();
    public DbSet<ComboOption> ComboOptions => Set<ComboOption>();
    public DbSet<SecurityObservation> SecurityObservations => Set<SecurityObservation>();
    public DbSet<SecurityObservationObserver> SecurityObservationObservers => Set<SecurityObservationObserver>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        // --- Reference module (EquipmentMaintenances) ---
        modelBuilder.Entity<EquipmentMaintenance>()
            .HasOne(em => em.EquipmentItem)
            .WithMany()
            .HasForeignKey(em => em.EquipmentItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EquipmentMaintenance>()
            .HasOne(em => em.Person)
            .WithMany()
            .HasForeignKey(em => em.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- Observers: Legajo is the business key ---
        modelBuilder.Entity<Observer>()
            .HasIndex(o => o.Legajo)
            .IsUnique();

        modelBuilder.Entity<Observer>()
            .Property(o => o.Post)
            .HasConversion<int>();

        // A Plant retiring never retires an Observer's posting history; the assignment rows
        // themselves belong to the Observer (ADR 0002).
        modelBuilder.Entity<ObserverPlantAssignment>()
            .HasKey(a => new { a.ObserverId, a.PlantId });

        modelBuilder.Entity<ObserverPlantAssignment>()
            .HasOne(a => a.Observer)
            .WithMany(o => o.Plants)
            .HasForeignKey(a => a.ObserverId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ObserverPlantAssignment>()
            .HasOne(a => a.Plant)
            .WithMany()
            .HasForeignKey(a => a.PlantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ComboOption>()
            .HasIndex(c => new { c.ComboKey, c.Label })
            .IsUnique();

        // --- Security Observations ---
        modelBuilder.Entity<SecurityObservation>(entity => {
            entity.Property(o => o.Task).IsRequired();
            entity.Property(o => o.Lugar).IsRequired();
            entity.Property(o => o.ResumenObservacion).IsRequired();
            entity.Property(o => o.DetalleAI).IsRequired();
            entity.Property(o => o.DescripcionAC).IsRequired();

            // The export stores each multi-select as one JSON array of labels.
            entity.Property(o => o.GestionRiesgo).HasDefaultValue("[]");
            entity.Property(o => o.ProtocolosMortales).HasDefaultValue("[]");
            entity.Property(o => o.ClasificacionObservacion).HasDefaultValue("[]");
            entity.Property(o => o.RelacionObservacion).HasDefaultValue("[]");

            entity.HasOne(o => o.Plant)
                .WithMany()
                .HasForeignKey(o => o.PlantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.Sector)
                .WithMany()
                .HasForeignKey(o => o.SectorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.ContractorCompany)
                .WithMany()
                .HasForeignKey(o => o.ContractorCompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Join rows die with the observation; naming an Observer is never cascaded.
        modelBuilder.Entity<SecurityObservationObserver>()
            .HasKey(x => new { x.ObservationId, x.ObserverId });

        modelBuilder.Entity<SecurityObservationObserver>()
            .HasOne(x => x.Observation)
            .WithMany(o => o.Observers)
            .HasForeignKey(x => x.ObservationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SecurityObservationObserver>()
            .HasOne(x => x.Observer)
            .WithMany()
            .HasForeignKey(x => x.ObserverId)
            .OnDelete(DeleteBehavior.Restrict);

        SeedData.Seed(modelBuilder);
    }
}
