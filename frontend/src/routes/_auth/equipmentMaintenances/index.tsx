import type { EquipmentMaintenanceFilters } from '@/modules/equipmentMaintenances/types/equipmentMaintenance.type';
import EquipmentMaintenancesTablePage from '@/modules/equipmentMaintenances/views/EquipmentMaintenancesTablePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/equipmentMaintenances/')({
    component: EquipmentMaintenancesTablePage,
    validateSearch: () => ({}) as EquipmentMaintenanceFilters,
});
