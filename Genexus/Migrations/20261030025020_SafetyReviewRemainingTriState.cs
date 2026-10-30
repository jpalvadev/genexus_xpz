using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SafetyReviewRemainingTriState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TrcRisk",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ToolsReviewed",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskRealized",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RequiresAtrReview",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MobileEquipmentReviewed",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LadderReviewed",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "InjuryMeasures",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ImpactRiskControlled",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "HandInjuryMeasures",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EnergyReviewed",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ElectricalEquipmentCircuitBreaker",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            // ADR-0006: las once respuestas restantes pasan de INTEGER (1/0/NULL) a
            // TEXT con los literales del wire. La reconstrucción de tabla de SQLite
            // copia los enteros a las columnas TEXT por afinidad ('1'/'0'/NULL), así
            // que la traducción a los literales se hace explícitamente después.
            migrationBuilder.Sql(
                """
                UPDATE SecurityObservations
                SET TrcRisk = CASE CAST(TrcRisk AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(TrcRisk AS TEXT) END,
                    ToolsReviewed = CASE CAST(ToolsReviewed AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(ToolsReviewed AS TEXT) END,
                    TaskRealized = CASE CAST(TaskRealized AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(TaskRealized AS TEXT) END,
                    RequiresAtrReview = CASE CAST(RequiresAtrReview AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(RequiresAtrReview AS TEXT) END,
                    MobileEquipmentReviewed = CASE CAST(MobileEquipmentReviewed AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(MobileEquipmentReviewed AS TEXT) END,
                    LadderReviewed = CASE CAST(LadderReviewed AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(LadderReviewed AS TEXT) END,
                    InjuryMeasures = CASE CAST(InjuryMeasures AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(InjuryMeasures AS TEXT) END,
                    ImpactRiskControlled = CASE CAST(ImpactRiskControlled AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(ImpactRiskControlled AS TEXT) END,
                    HandInjuryMeasures = CASE CAST(HandInjuryMeasures AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(HandInjuryMeasures AS TEXT) END,
                    EnergyReviewed = CASE CAST(EnergyReviewed AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(EnergyReviewed AS TEXT) END,
                    ElectricalEquipmentCircuitBreaker = CASE CAST(ElectricalEquipmentCircuitBreaker AS TEXT) WHEN '1' THEN 'SI' WHEN '0' THEN 'NO' ELSE CAST(ElectricalEquipmentCircuitBreaker AS TEXT) END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Espejo: los literales vuelven a la forma numérica ANTES de la
            // reconstrucción a INTEGER (afinidad: '1'/'0' textuales se almacenan
            // como 1/0); 'N/A' — imposible en el estado bool original — se pierde
            // como NULL, igual que cualquier valor inválido.
            migrationBuilder.Sql(
                """
                UPDATE SecurityObservations
                SET TrcRisk = CASE TrcRisk WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE TrcRisk END,
                    ToolsReviewed = CASE ToolsReviewed WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE ToolsReviewed END,
                    TaskRealized = CASE TaskRealized WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE TaskRealized END,
                    RequiresAtrReview = CASE RequiresAtrReview WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE RequiresAtrReview END,
                    MobileEquipmentReviewed = CASE MobileEquipmentReviewed WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE MobileEquipmentReviewed END,
                    LadderReviewed = CASE LadderReviewed WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE LadderReviewed END,
                    InjuryMeasures = CASE InjuryMeasures WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE InjuryMeasures END,
                    ImpactRiskControlled = CASE ImpactRiskControlled WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE ImpactRiskControlled END,
                    HandInjuryMeasures = CASE HandInjuryMeasures WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE HandInjuryMeasures END,
                    EnergyReviewed = CASE EnergyReviewed WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE EnergyReviewed END,
                    ElectricalEquipmentCircuitBreaker = CASE ElectricalEquipmentCircuitBreaker WHEN 'SI' THEN '1' WHEN 'NO' THEN '0' WHEN 'N/A' THEN NULL ELSE ElectricalEquipmentCircuitBreaker END;
                """);

            migrationBuilder.AlterColumn<bool>(
                name: "TrcRisk",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "ToolsReviewed",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "TaskRealized",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "RequiresAtrReview",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "MobileEquipmentReviewed",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "LadderReviewed",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "InjuryMeasures",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "ImpactRiskControlled",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "HandInjuryMeasures",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "EnergyReviewed",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "ElectricalEquipmentCircuitBreaker",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);
        }
    }
}
