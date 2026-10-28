import PlantForm from '../components/PlantForm';

const CreatePlantFormPage = () => {
    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">Nueva Planta</h1>
            <PlantForm mode="create" />
        </div>
    );
};

export default CreatePlantFormPage;
