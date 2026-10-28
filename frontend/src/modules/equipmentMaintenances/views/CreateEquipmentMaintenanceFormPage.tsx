import EquipmentMaintenanceForm from '../components/EquipmentMaintenanceForm';

const CreateEquipmentMaintenanceFormPage = () => {
    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Registro de Tratamiento Preventivo y Correctivo
            </h1>
            <EquipmentMaintenanceForm mode="create" />
        </div>
    );
};

export default CreateEquipmentMaintenanceFormPage;
