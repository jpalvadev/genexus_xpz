using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SpanishContractorCompaniesSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ContractorCompanies",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Servicios de Seguridad Shield");

            migrationBuilder.UpdateData(
                table: "ContractorCompanies",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Dotaciones Guardian");

            migrationBuilder.UpdateData(
                table: "ContractorCompanies",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Protección de Instalaciones Apex");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ContractorCompanies",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Shield Security Services");

            migrationBuilder.UpdateData(
                table: "ContractorCompanies",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Guardian Staffing");

            migrationBuilder.UpdateData(
                table: "ContractorCompanies",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Apex Facility Protection");
        }
    }
}
