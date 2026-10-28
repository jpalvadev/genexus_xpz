import { Route } from '@/routes/_layout/plants/$id/edit';
import PlantForm from '../components/PlantForm';

const UpdatePlantFormPage = () => {
    const plant = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Actualización de Planta
            </h1>
            <PlantForm mode="update" initialData={plant} />
        </div>
    );
};

export default UpdatePlantFormPage;
