using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SpanishSectorsSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Seguridad Preventiva");

            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Control de Acceso");

            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Ronda y Vigilancia");

            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "Respuesta a Emergencias");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Preventive Security");

            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Access Control");

            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Patrol and Surveillance");

            migrationBuilder.UpdateData(
                table: "Sectors",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "Emergency Response");
        }
    }
}
