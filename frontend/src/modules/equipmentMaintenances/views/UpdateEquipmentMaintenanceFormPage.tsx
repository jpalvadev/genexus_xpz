import { Route } from '@/routes/_auth/equipmentMaintenances/$id/edit';
import EquipmentMaintenanceForm from '../components/EquipmentMaintenanceForm';
const UpdateEquipmentMaintenanceFormPage = () => {
    const equipmentMaintenance = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Actualización de Registro de Tratamiento Preventivo y Correctivo
            </h1>
            <EquipmentMaintenanceForm
                mode="update"
                initialData={equipmentMaintenance}
            />
        </div>
    );
};

export default UpdateEquipmentMaintenanceFormPage;
