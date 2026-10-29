using Itrion.Api.Common;

namespace Itrion.Api.Features.SecurityObservations;

public class SecurityObservationExcelExport {
    public static Task<byte[]> ExportAsync(IList<SecurityObservationResponse> data, byte[]? logoBytes = null) =>
        ExcelExporter.ExportAsync(
            data: data,
            sheetName: "Observaciones de Seguridad",
            title: "Registro de Observaciones de Seguridad",
            headers: [
                "Fecha de Observación", "Creado El", "Planta", "Sector", "Lugar", "Tarea",
                "Empresa Contratista", "Observadores", "Gestión de Riesgo", "Protocolos Mortales",
                "Clasificación", "Relación", "Controles Críticos", "Resumen",
                "Acción Detallada", "Acción Inmediata",
            ],
            documentMetadata: ["CODE: SHYMA-OPS", "VERSION: 01", "DATE: 2026"],
            mapRow: item =>
            [
                item.ObservationDate.ToString("dd/MM/yyyy"),
                item.CreatedOn.ToString("dd/MM/yyyy HH:mm"),
                item.Plant.Name,
                item.Sector.Name,
                item.Lugar,
                item.Task,
                item.ContractorCompany?.Name ?? "",
                string.Join(", ", item.Observers.Select(o => o.FullName)),
                string.Join(", ", item.GestionRiesgo),
                string.Join(", ", item.ProtocolosMortales),
                string.Join(", ", item.ClasificacionObservacion),
                string.Join(", ", item.RelacionObservacion),
                item.ControlesCriticos,
                item.ResumenObservacion,
                item.DetalleAI,
                item.DescripcionAC,
            ],
            logoBytes: logoBytes
        );
}
