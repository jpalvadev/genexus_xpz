using Itrion.Api.Common;
using Itrion.Api.Features.EquipmentItems;

namespace Itrion.Api.Features.EquipmentMaintenances;
public class EquipmentMaintenanceExcelExport {
    public static Task<byte[]> ExportAsync(IList<EquipmentMaintenanceResponse> data, byte[]? logoBytes = null) =>
        ExcelExporter.ExportAsync(
            data: data,
            sheetName: "Mantenimientos",
            title: "Registro de Mantenimientos Preventivos y Correctivos",
            headers: ["Fecha", "Tipo", "Actividad", "Equipo", "Código", "Estado del Equipo", "Responsable", "Estado", "Cerrado"],
            documentMetadata: ["CODIGO: RTC-CP01", "VERSION: 02", "FECHA: /2026"],
            mapRow: item =>
            [
                item.Date.ToString("dd/MM/yyyy"),
                item.Type == EquipmentMaintenanceType.Preventive ? "Preventivo" : "Correctivo",
                item.Activity,
                item.EquipmentItem.Name,
                item.EquipmentItem.Code,
                item.EquipmentItem.Status switch {
                    EquipmentItemStatus.Operational => "Operativo",
                    EquipmentItemStatus.InRepair => "En Reparación",
                    EquipmentItemStatus.OutOfService => "Fuera de Servicio",
                    _ => "Desconocido"
                },
                $"{item.Person.LastName}, {item.Person.FirstName}",
                item.Status == EquipmentMaintenanceStatus.Pending ? "Pendiente" : "Completado",
                item.ClosedAt?.ToString("dd/MM/yyyy") ?? "",
            ],
            logoBytes: logoBytes
        );
}
