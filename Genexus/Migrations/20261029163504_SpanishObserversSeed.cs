using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SpanishObserversSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FullName", "Objective" },
                values: new object[] { "Elena Herrera", "Ronda perimetral y control de accesos" });

            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FullName", "Objective" },
                values: new object[] { "Rubén Mercado", "Simulacros de incendio y respuesta a emergencias" });

            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "FullName", "Objective" },
                values: new object[] { "Javier Sosa", "Escolta de contratistas y control de portería" });

            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 4,
                column: "Objective",
                value: "Supervisión del programa de seguridad");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FullName", "Objective" },
                values: new object[] { "Dana Herrera", "Perimeter patrol and access control" });

            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FullName", "Objective" },
                values: new object[] { "Owen Mercado", "Fire and emergency response drills" });

            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "FullName", "Objective" },
                values: new object[] { "Liam Sosa", "Contractor escort and gate checks" });

            migrationBuilder.UpdateData(
                table: "Observers",
                keyColumn: "Id",
                keyValue: 4,
                column: "Objective",
                value: "Security program oversight");
        }
    }
}
