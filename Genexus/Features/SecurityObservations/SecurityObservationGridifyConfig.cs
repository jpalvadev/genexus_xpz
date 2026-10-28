using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;

namespace Itrion.Api.Features.SecurityObservations;

public class SecurityObservationGridifyConfig : IGridifyConfig<SecurityObservation> {
    public void Configure(GridifyMapper<SecurityObservation> mapper) {
        mapper.GenerateMappings()
            .AddMap("id", o => o.Id)
            // The grid sends dates as DateTime strings, the column is a Date.
            .AddMap("observationDate", o => o.ObservationDate, value => DateOnly.FromDateTime(DateTime.Parse(value)))
            .AddMap("createdOn", o => o.CreatedOn)
            .AddMap("task", o => o.Task)
            .AddMap("lugar", o => o.Lugar)
            .AddMap("plant.name", o => o.Plant.Name)
            .AddMap("sector.name", o => o.Sector.Name)
            .AddMap("company.name", o => o.ContractorCompany!.Name)
            .AddMap("controlesCriticos", o => o.ControlesCriticos)
            .AddMap("resumenObservacion", o => o.ResumenObservacion);
    }
}
