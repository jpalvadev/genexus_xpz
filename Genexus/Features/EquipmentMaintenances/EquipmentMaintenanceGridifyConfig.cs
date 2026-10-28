using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;

namespace Itrion.Api.Features.EquipmentMaintenances;

public class EquipmentMaintenanceGridifyConfig : IGridifyConfig<EquipmentMaintenance> {
    public void Configure(GridifyMapper<EquipmentMaintenance> mapper) {
        mapper.GenerateMappings()
            .AddMap("id", ei => ei.Id)
            .AddMap("date", ei => ei.Date, value => DateOnly.FromDateTime(DateTime.Parse(value))) // como del front viene un DateTime, parseamos a Date
            .AddMap("activity", ei => ei.Activity)
            .AddMap("type", ei => ei.Type)
            //.AddMap("person.name", em => em.Person.FirstName + " " + em.Person.LastName)
            .AddMap("person.lastName", em => em.Person.LastName)
            .AddMap("equipmentItem.name", ei => ei.EquipmentItem.Name)
            .AddMap("equipmentItem.code", ei => ei.EquipmentItem.Code)
            .AddMap("equipmentItem.status", ei => ei.EquipmentItem.Status)
            .AddMap("status", ei => ei.Status)
            .AddMap("closedAt", ei => ei.ClosedAt);
    }
}