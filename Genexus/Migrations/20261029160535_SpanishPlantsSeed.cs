using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SpanishPlantsSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Planta Norte (RNV)");

            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Planta Sur (PLS)");

            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Planta Central (TSS)");

            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "Planta Muelle (VQG)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "North Plant (RNV)");

            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "South Plant (PLS)");

            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Central Plant (TSS)");

            migrationBuilder.UpdateData(
                table: "Plants",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "Dock Plant (VQG)");
        }
    }
}
