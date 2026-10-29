using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SpanishComboOptionsSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 1,
                column: "Label",
                value: "Charla de Riesgo Diario (DRT)");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 2,
                column: "Label",
                value: "Análisis de Seguridad del Trabajo (JSA)");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 3,
                column: "Label",
                value: "Permiso de Trabajo");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 4,
                column: "Label",
                value: "Charla de Toolbox");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 5,
                column: "Label",
                value: "Trabajo en Altura");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 6,
                column: "Label",
                value: "Aislamiento de Energía (LOTO)");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Label",
                value: "Ingreso a Espacio Confinado");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 8,
                column: "Label",
                value: "Trabajo en Caliente");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 9,
                column: "Label",
                value: "Equipo Móvil en Movimiento");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 10,
                column: "Label",
                value: "Excavación");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 11,
                column: "Label",
                value: "Acto Seguro");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 12,
                column: "Label",
                value: "Condición Segura");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 13,
                column: "Label",
                value: "Acto de Riesgo");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 14,
                column: "Label",
                value: "Control Defensivo");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 15,
                column: "Label",
                value: "Relacionado con APR");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 16,
                column: "Label",
                value: "Relacionado con ATR");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 17,
                column: "Label",
                value: "Relacionado con la Tarea");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 18,
                column: "Label",
                value: "Relacionado con Condiciones del Sitio");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 1,
                column: "Label",
                value: "Daily Risk Talk (DRT)");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 2,
                column: "Label",
                value: "Job Safety Analysis (JSA)");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 3,
                column: "Label",
                value: "Permit to Work");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 4,
                column: "Label",
                value: "Toolbox Talk");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 5,
                column: "Label",
                value: "Working at Height");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 6,
                column: "Label",
                value: "Energy Isolation (LOTO)");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Label",
                value: "Confined Space Entry");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 8,
                column: "Label",
                value: "Hot Work");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 9,
                column: "Label",
                value: "Mobile Equipment in Motion");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 10,
                column: "Label",
                value: "Excavation");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 11,
                column: "Label",
                value: "Safe Act");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 12,
                column: "Label",
                value: "Safe Condition");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 13,
                column: "Label",
                value: "At-Risk Act");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 14,
                column: "Label",
                value: "Defensive Control");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 15,
                column: "Label",
                value: "Related to APR");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 16,
                column: "Label",
                value: "Related to ATR");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 17,
                column: "Label",
                value: "Related to Task");

            migrationBuilder.UpdateData(
                table: "ComboOptions",
                keyColumn: "Id",
                keyValue: 18,
                column: "Label",
                value: "Related to Site Conditions");
        }
    }
}
