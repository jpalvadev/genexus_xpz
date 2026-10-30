namespace Itrion.Api.Features.SecurityObservations;

/// <summary>
/// Respuesta tri-estado de una pregunta de la Revisión de Seguridad de la Observación
/// de Seguridad (GLOSSARY "Respuesta de Revisión de Seguridad", ADR-0006).
///
/// El usuario ve Sí / No / N/A (español, ADR-0005). En el wire y en la base de datos
/// el valor viaja y se guarda como texto con los literales byte-idénticos
/// "SI", "NO", "N/A": el valor respondido es copia visible, la propiedad JSON sigue
/// en inglés. NULL (ausencia) no es un valor del enum: "sin respuesta" es la
/// nulidad del campo (`SafetyReviewAnswer?`), no un miembro.
///
/// Persistencia: columna TEXT con ValueConverter SafetyReviewAnswer? &lt;-&gt; string
/// (ver ItrionDbContext); el formato de la columna es texto sin default. Parse/ToWire
/// son el mapa string &lt;-&gt; enum usado por los DTOs (límite string del framework,
/// entidad tipada) y por las reglas de validación.
/// </summary>
public enum SafetyReviewAnswer
{
    Yes,
    No,
    NotApplicable,
}

public static class SafetyReviewAnswerConverter
{
    /// <summary>Literal del wire para cada respuesta (string en el límite del framework).</summary>
    public static string ToWire(SafetyReviewAnswer answer) => answer switch
    {
        SafetyReviewAnswer.Yes => "SI",
        SafetyReviewAnswer.No => "NO",
        SafetyReviewAnswer.NotApplicable => "N/A",
        _ => throw new ArgumentOutOfRangeException(nameof(answer), answer, null)
    };

    /// <summary>Versión nulable: NULL (sin respuesta) viaja como null en el wire.</summary>
    public static string? ToWire(SafetyReviewAnswer? answer) =>
        answer is null ? null : ToWire(answer.Value);

    /// <summary>
    /// Parsea el literal del wire ("SI"/"NO"/"N/A", case-insensitive por tolerancia de
    /// entrada; el contrato pin es byte-exacto y lo verifican zod y los fixtures).
    /// Devuelve null para cualquier otro string: la regla de validación del servicio
    /// lo rechaza con copia española antes de la regla de obligatoriedad.
    /// </summary>
    public static SafetyReviewAnswer? Parse(string? wire) => wire switch
    {
        "SI" => SafetyReviewAnswer.Yes,
        "NO" => SafetyReviewAnswer.No,
        "N/A" => SafetyReviewAnswer.NotApplicable,
        var s when s is not null && s.Equals("SI", StringComparison.OrdinalIgnoreCase) => SafetyReviewAnswer.Yes,
        var s when s is not null && s.Equals("NO", StringComparison.OrdinalIgnoreCase) => SafetyReviewAnswer.No,
        var s when s is not null && s.Equals("N/A", StringComparison.OrdinalIgnoreCase) => SafetyReviewAnswer.NotApplicable,
        _ => null
    };

    /// <summary>Verdades del wire para la entidad (conversión EF ValueConverter).</summary>
    public static string ToDb(SafetyReviewAnswer answer) => ToWire(answer);

    public static SafetyReviewAnswer? FromDb(string? column) => Parse(column);
}
