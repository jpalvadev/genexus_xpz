using Itrion.Api.Common;

namespace Itrion.Api.Features.SecurityObservations;

public class SecurityObservationExcelExport {
    public static Task<byte[]> ExportAsync(IList<SecurityObservationResponse> data, byte[]? logoBytes = null) =>
        ExcelExporter.ExportAsync(
            data: data,
            sheetName: "Security Observations",
            title: "Security Observations Register",
            headers: [
                "Observation Date", "Created On", "Plant", "Sector", "Place", "Task",
                "Contractor Company", "Observers", "Risk Management", "Fatal-Risk Protocols",
                "Classification", "Relation", "Critical Controls", "Summary",
                "Detailed Action", "Immediate Action",
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
