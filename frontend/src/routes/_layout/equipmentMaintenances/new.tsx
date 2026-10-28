import CreateEquipmentMaintenanceFormPage from '@/modules/equipmentMaintenances/views/CreateEquipmentMaintenanceFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/equipmentMaintenances/new')({
    component: CreateEquipmentMaintenanceFormPage,
});
