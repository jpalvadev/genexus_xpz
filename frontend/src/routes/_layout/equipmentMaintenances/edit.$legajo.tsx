import Loading from '@/components/Loading';
import { equipmentMaintenanceService } from '@/modules/equipmentMaintenances/services/equipmentMaintenance.service';
import UpdateEquipmentMaintenanceFormPage from '@/modules/equipmentMaintenances/views/UpdateEquipmentMaintenanceFormPage';
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/equipmentMaintenances/edit/$legajo')({
    loader: ({ params }) => equipmentMaintenanceService.getById(+params.legajo),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdateEquipmentMaintenanceFormPage,
});
