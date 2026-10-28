import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { GridifyQuery } from '@/utils/gridifyFilter';
import { equipmentMaintenanceService } from '../services/equipmentMaintenance.service';

export function useEquipmentMaintenancesQuery(gridifyQuery: GridifyQuery) {
    return useQuery({
        queryKey: ['equipmentMaintenances', gridifyQuery],
        queryFn: () =>
            equipmentMaintenanceService.getAllPaginated(gridifyQuery),
        placeholderData: keepPreviousData,
    });
}
