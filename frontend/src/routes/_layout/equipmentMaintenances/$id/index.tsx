import Loading from '@/components/Loading';
import { equipmentMaintenanceService } from '@/modules/equipmentMaintenances/services/equipmentMaintenance.service';
import GetEquipmentMaintenanceByIdFormPage from '@/modules/equipmentMaintenances/views/GetEquipmentMaintenanceByIdFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/equipmentMaintenances/$id/')({
    loader: ({ params }) => equipmentMaintenanceService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: GetEquipmentMaintenanceByIdFormPage,
});
