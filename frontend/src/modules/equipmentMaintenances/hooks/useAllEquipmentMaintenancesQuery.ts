import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { equipmentMaintenanceService } from '../services/equipmentMaintenance.service';
import type { GridifyQuery } from '@/utils/gridifyFilter';

export function useAllEquipmentMaintenancesQuery(gridifyQuery: GridifyQuery) {
    return useQuery({
        queryKey: ['allEquipmentMaintenances', gridifyQuery],
        queryFn: () => equipmentMaintenanceService.getAll(gridifyQuery),
        placeholderData: keepPreviousData,
    });
}
