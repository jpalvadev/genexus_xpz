using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SpanishEquipmentDemoSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "EquipmentItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Línea Transportadora A");

            migrationBuilder.UpdateData(
                table: "EquipmentItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Montacargas 12");

            migrationBuilder.UpdateData(
                table: "EquipmentItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Caldera 3");

            migrationBuilder.UpdateData(
                table: "EquipmentMaintenances",
                keyColumn: "Id",
                keyValue: 1,
                column: "Activity",
                value: "Inspección de tensión de bandas y rodillos");

            migrationBuilder.UpdateData(
                table: "EquipmentMaintenances",
                keyColumn: "Id",
                keyValue: 2,
                column: "Activity",
                value: "Reemplazo de bomba hidráulica");

            migrationBuilder.UpdateData(
                table: "Persons",
                keyColumn: "Id",
                keyValue: 1,
                column: "FirstName",
                value: "Iván");

            migrationBuilder.UpdateData(
                table: "Persons",
                keyColumn: "Id",
                keyValue: 2,
                column: "FirstName",
                value: "Selva");

            migrationBuilder.UpdateData(
                table: "Persons",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "tomas.bermudez@example.com", "Tomás", "Bermúdez" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "EquipmentItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Conveyor Line A");

            migrationBuilder.UpdateData(
                table: "EquipmentItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Forklift 12");

            migrationBuilder.UpdateData(
                table: "EquipmentItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Boiler 3");

            migrationBuilder.UpdateData(
                table: "EquipmentMaintenances",
                keyColumn: "Id",
                keyValue: 1,
                column: "Activity",
                value: "Belt tension and roller inspection");

            migrationBuilder.UpdateData(
                table: "EquipmentMaintenances",
                keyColumn: "Id",
                keyValue: 2,
                column: "Activity",
                value: "Hydraulic pump replacement");

            migrationBuilder.UpdateData(
                table: "Persons",
                keyColumn: "Id",
                keyValue: 1,
                column: "FirstName",
                value: "Ivan");

            migrationBuilder.UpdateData(
                table: "Persons",
                keyColumn: "Id",
                keyValue: 2,
                column: "FirstName",
                value: "Sela");

            migrationBuilder.UpdateData(
                table: "Persons",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "tom.bermudez@example.com", "Tom", "Bermudez" });
        }
    }
}
