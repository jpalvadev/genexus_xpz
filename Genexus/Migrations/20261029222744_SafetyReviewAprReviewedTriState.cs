using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Genexus.Migrations
{
    /// <inheritdoc />
    public partial class SafetyReviewAprReviewedTriState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ADR-0006: AprReviewed pasa de INTEGER (1/0/NULL) a TEXT con los
            // literales del wire. La reconstrucción de tabla de SQLite copia el
            // entero a la columna TEXT por afinidad ('1'/'0'/NULL), así que la
            // traducción a los literales se hace explícitamente después.
            migrationBuilder.AlterColumn<string>(
                name: "AprReviewed",
                table: "SecurityObservations",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.Sql(
                """
                UPDATE SecurityObservations
                SET AprReviewed = CASE CAST(AprReviewed AS TEXT)
                        WHEN '1' THEN 'SI'
                        WHEN '0' THEN 'NO'
                        ELSE CAST(AprReviewed AS TEXT)
                    END;
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
                SET AprReviewed = CASE AprReviewed
                        WHEN 'SI' THEN '1'
                        WHEN 'NO' THEN '0'
                        WHEN 'N/A' THEN NULL
                        ELSE AprReviewed
                    END;
                """);

            migrationBuilder.AlterColumn<bool>(
                name: "AprReviewed",
                table: "SecurityObservations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);
        }
    }
}
