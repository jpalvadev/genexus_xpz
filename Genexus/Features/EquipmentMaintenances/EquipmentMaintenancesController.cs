using Gridify;
using Itrion.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.EquipmentMaintenances;

[ApiController]
[Route("api/v1/equipment-maintenances")]
public class EquipmentMaintenancesController: ControllerBase {

    private readonly IEquipmentMaintenanceService _equipmentMaintenanceService;
    
    public EquipmentMaintenancesController(IEquipmentMaintenanceService equipmentMaintenanceService) {
        _equipmentMaintenanceService = equipmentMaintenanceService;
        
    }

    [HttpGet]
    public async Task<ActionResult<IList<EquipmentMaintenanceResponse>>> GetAll([FromQuery] GridifyQuery query) {
        var response = await _equipmentMaintenanceService.GetAllAsync(query);
        return Ok(response);
    }

    [HttpGet("charts")]
    public async Task<ActionResult<Paging<EquipmentMaintenanceResponse>>> GetAllForCharts([FromQuery] GridifyQuery query) {
        Paging<EquipmentMaintenanceResponse> response = await _equipmentMaintenanceService.GetAllForChartsAsync(query);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EquipmentMaintenanceResponse>> GetById(int id) {
        var response = await _equipmentMaintenanceService.GetByIdAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse("Mantenimiento de Equipo no encontrado"));
        }
        return Ok(response);
    }

    [HttpGet("export-excel")]
    public async Task<IActionResult> Export([FromQuery] GridifyQuery query) {
        var fileBytes = await _equipmentMaintenanceService.ExportAsync(query);
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "mantenimientos.xlsx");
    }

    [HttpPost]
    public async Task<ActionResult<EquipmentMaintenanceResponse>> Create([FromBody] EquipmentMaintenanceRequest request) {
        var response = await _equipmentMaintenanceService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EquipmentMaintenanceRequest request) {
        var response = await _equipmentMaintenanceService.UpdateAsync(id, request);
        if (response is null) {
            return NotFound();
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<bool>> DeleteById(int id) {
        if (!await _equipmentMaintenanceService.DeleteByIdAsync(id)) {
            return NotFound();
        }
        return NoContent();
    }

}

