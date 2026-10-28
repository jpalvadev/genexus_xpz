import Loading from '@/components/Loading';
import { equipmentMaintenanceService } from '@/modules/equipmentMaintenances/services/equipmentMaintenance.service';
import UpdateEquipmentMaintenanceFormPage from '@/modules/equipmentMaintenances/views/UpdateEquipmentMaintenanceFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/equipmentMaintenances/$id/edit')({
    loader: ({ params }) => equipmentMaintenanceService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdateEquipmentMaintenanceFormPage,
});
