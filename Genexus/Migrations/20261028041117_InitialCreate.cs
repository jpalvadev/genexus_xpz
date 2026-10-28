using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ComboOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ComboKey = table.Column<string>(type: "TEXT", nullable: false),
                    Label = table.Column<string>(type: "TEXT", nullable: false),
                    Order = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComboOptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContractorCompanies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractorCompanies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EquipmentItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquipmentItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Observers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Legajo = table.Column<int>(type: "INTEGER", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", nullable: false),
                    Objective = table.Column<string>(type: "TEXT", nullable: false),
                    Post = table.Column<int>(type: "INTEGER", nullable: false),
                    Active = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Observers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Persons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    Dni = table.Column<int>(type: "INTEGER", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Persons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Plants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sectors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sectors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EquipmentMaintenances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Activity = table.Column<string>(type: "TEXT", nullable: false),
                    ClosedAt = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    EquipmentItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    PersonId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquipmentMaintenances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquipmentMaintenances_EquipmentItems_EquipmentItemId",
                        column: x => x.EquipmentItemId,
                        principalTable: "EquipmentItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EquipmentMaintenances_Persons_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ObserverPlantAssignments",
                columns: table => new
                {
                    ObserverId = table.Column<int>(type: "INTEGER", nullable: false),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObserverPlantAssignments", x => new { x.ObserverId, x.PlantId });
                    table.ForeignKey(
                        name: "FK_ObserverPlantAssignments_Observers_ObserverId",
                        column: x => x.ObserverId,
                        principalTable: "Observers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ObserverPlantAssignments_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SecurityObservations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ObservationDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Task = table.Column<string>(type: "TEXT", nullable: false),
                    Lugar = table.Column<string>(type: "TEXT", nullable: false),
                    AprReviewed = table.Column<bool>(type: "INTEGER", nullable: true),
                    TaskRealized = table.Column<bool>(type: "INTEGER", nullable: true),
                    RequiresAtrReview = table.Column<bool>(type: "INTEGER", nullable: true),
                    TrcRisk = table.Column<bool>(type: "INTEGER", nullable: true),
                    ImpactRiskControlled = table.Column<bool>(type: "INTEGER", nullable: true),
                    HandInjuryMeasures = table.Column<bool>(type: "INTEGER", nullable: true),
                    InjuryMeasures = table.Column<bool>(type: "INTEGER", nullable: true),
                    ToolsReviewed = table.Column<bool>(type: "INTEGER", nullable: true),
                    MobileEquipmentReviewed = table.Column<bool>(type: "INTEGER", nullable: true),
                    EnergyReviewed = table.Column<bool>(type: "INTEGER", nullable: true),
                    LadderReviewed = table.Column<bool>(type: "INTEGER", nullable: true),
                    ElectricalEquipmentCircuitBreaker = table.Column<bool>(type: "INTEGER", nullable: true),
                    ControlesCriticos = table.Column<string>(type: "TEXT", nullable: false),
                    GestionRiesgo = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                    ProtocolosMortales = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                    ClasificacionObservacion = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                    RelacionObservacion = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                    ResumenObservacion = table.Column<string>(type: "TEXT", nullable: false),
                    DetalleAI = table.Column<string>(type: "TEXT", nullable: false),
                    DescripcionAC = table.Column<string>(type: "TEXT", nullable: false),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false),
                    SectorId = table.Column<int>(type: "INTEGER", nullable: false),
                    ContractorCompanyId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityObservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SecurityObservations_ContractorCompanies_ContractorCompanyId",
                        column: x => x.ContractorCompanyId,
                        principalTable: "ContractorCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SecurityObservations_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SecurityObservations_Sectors_SectorId",
                        column: x => x.SectorId,
                        principalTable: "Sectors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SecurityObservationObservers",
                columns: table => new
                {
                    ObservationId = table.Column<int>(type: "INTEGER", nullable: false),
                    ObserverId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityObservationObservers", x => new { x.ObservationId, x.ObserverId });
                    table.ForeignKey(
                        name: "FK_SecurityObservationObservers_Observers_ObserverId",
                        column: x => x.ObserverId,
                        principalTable: "Observers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SecurityObservationObservers_SecurityObservations_ObservationId",
                        column: x => x.ObservationId,
                        principalTable: "SecurityObservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ComboOptions",
                columns: new[] { "Id", "ComboKey", "Label", "Order" },
                values: new object[,]
                {
                    { 1, "gestionRiesgo", "Daily Risk Talk (DRT)", 1 },
                    { 2, "gestionRiesgo", "Job Safety Analysis (JSA)", 2 },
                    { 3, "gestionRiesgo", "Permit to Work", 3 },
                    { 4, "gestionRiesgo", "Toolbox Talk", 4 },
                    { 5, "protocolosMortales", "Working at Height", 1 },
                    { 6, "protocolosMortales", "Energy Isolation (LOTO)", 2 },
                    { 7, "protocolosMortales", "Confined Space Entry", 3 },
                    { 8, "protocolosMortales", "Hot Work", 4 },
                    { 9, "protocolosMortales", "Mobile Equipment in Motion", 5 },
                    { 10, "protocolosMortales", "Excavation", 6 },
                    { 11, "clasificacionObservacion", "Safe Act", 1 },
                    { 12, "clasificacionObservacion", "Safe Condition", 2 },
                    { 13, "clasificacionObservacion", "At-Risk Act", 3 },
                    { 14, "clasificacionObservacion", "Defensive Control", 4 },
                    { 15, "relacionObservacion", "Related to APR", 1 },
                    { 16, "relacionObservacion", "Related to ATR", 2 },
                    { 17, "relacionObservacion", "Related to Task", 3 },
                    { 18, "relacionObservacion", "Related to Site Conditions", 4 }
                });

            migrationBuilder.InsertData(
                table: "ContractorCompanies",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Shield Security Services" },
                    { 2, "Guardian Staffing" },
                    { 3, "Apex Facility Protection" }
                });

            migrationBuilder.InsertData(
                table: "EquipmentItems",
                columns: new[] { "Id", "Code", "Name", "Status" },
                values: new object[,]
                {
                    { 1, "EQ-001", "Conveyor Line A", 1 },
                    { 2, "EQ-002", "Forklift 12", 2 },
                    { 3, "EQ-003", "Boiler 3", 3 }
                });

            migrationBuilder.InsertData(
                table: "Observers",
                columns: new[] { "Id", "Active", "FullName", "Legajo", "Objective", "Post" },
                values: new object[,]
                {
                    { 1, true, "Dana Herrera", 1001, "Perimeter patrol and access control", 2 },
                    { 2, true, "Owen Mercado", 1002, "Fire and emergency response drills", 3 },
                    { 3, true, "Liam Sosa", 1003, "Contractor escort and gate checks", 3 },
                    { 4, false, "Nora Peralta", 1004, "Security program oversight", 1 }
                });

            migrationBuilder.InsertData(
                table: "Persons",
                columns: new[] { "Id", "Dni", "Email", "FirstName", "LastName" },
                values: new object[,]
                {
                    { 1, 30112233, "ivan.quiroga@example.com", "Ivan", "Quiroga" },
                    { 2, 31445566, null, "Sela", "Rivas" },
                    { 3, 32778899, "tom.bermudez@example.com", "Tom", "Bermudez" }
                });

            migrationBuilder.InsertData(
                table: "Plants",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "North Plant (RNV)" },
                    { 2, "South Plant (PLS)" },
                    { 3, "Central Plant (TSS)" },
                    { 4, "Dock Plant (VQG)" }
                });

            migrationBuilder.InsertData(
                table: "Sectors",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Preventive Security" },
                    { 2, "Access Control" },
                    { 3, "Patrol and Surveillance" },
                    { 4, "Emergency Response" }
                });

            migrationBuilder.InsertData(
                table: "EquipmentMaintenances",
                columns: new[] { "Id", "Activity", "ClosedAt", "Date", "EquipmentItemId", "PersonId", "Status", "Type" },
                values: new object[,]
                {
                    { 1, "Belt tension and roller inspection", new DateOnly(2026, 5, 6), new DateOnly(2026, 5, 4), 1, 1, 2, 1 },
                    { 2, "Hydraulic pump replacement", null, new DateOnly(2026, 6, 18), 2, 2, 1, 2 }
                });

            migrationBuilder.InsertData(
                table: "ObserverPlantAssignments",
                columns: new[] { "ObserverId", "PlantId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 1, 3 },
                    { 2, 2 },
                    { 3, 4 },
                    { 4, 1 },
                    { 4, 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComboOptions_ComboKey_Label",
                table: "ComboOptions",
                columns: new[] { "ComboKey", "Label" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentMaintenances_EquipmentItemId",
                table: "EquipmentMaintenances",
                column: "EquipmentItemId");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentMaintenances_PersonId",
                table: "EquipmentMaintenances",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_ObserverPlantAssignments_PlantId",
                table: "ObserverPlantAssignments",
                column: "PlantId");

            migrationBuilder.CreateIndex(
                name: "IX_Observers_Legajo",
                table: "Observers",
                column: "Legajo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SecurityObservationObservers_ObserverId",
                table: "SecurityObservationObservers",
                column: "ObserverId");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityObservations_ContractorCompanyId",
                table: "SecurityObservations",
                column: "ContractorCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityObservations_PlantId",
                table: "SecurityObservations",
                column: "PlantId");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityObservations_SectorId",
                table: "SecurityObservations",
                column: "SectorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComboOptions");

            migrationBuilder.DropTable(
                name: "EquipmentMaintenances");

            migrationBuilder.DropTable(
                name: "ObserverPlantAssignments");

            migrationBuilder.DropTable(
                name: "SecurityObservationObservers");

            migrationBuilder.DropTable(
                name: "EquipmentItems");

            migrationBuilder.DropTable(
                name: "Persons");

            migrationBuilder.DropTable(
                name: "Observers");

            migrationBuilder.DropTable(
                name: "SecurityObservations");

            migrationBuilder.DropTable(
                name: "ContractorCompanies");

            migrationBuilder.DropTable(
                name: "Plants");

            migrationBuilder.DropTable(
                name: "Sectors");
        }
    }
}
