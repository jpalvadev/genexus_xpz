import { Route } from '@/routes/_layout/equipmentMaintenances/$id';
import EquipmentMaintenanceForm from '../components/EquipmentMaintenanceForm';

const GetEquipmentMaintenanceByIdFormPage = () => {
    const equipmentMaintenance = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Detalle de Registro de Tratamiento Preventivo y Correctivo
            </h1>
            <EquipmentMaintenanceForm
                mode="view"
                initialData={equipmentMaintenance}
            />
        </div>
    );
};

export default GetEquipmentMaintenanceByIdFormPage;
