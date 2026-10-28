import { Route } from '@/routes/_layout/sectors/$id/edit';
import SectorForm from '../components/SectorForm';

const UpdateSectorFormPage = () => {
    const sector = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Actualización de Sector
            </h1>
            <SectorForm mode="update" initialData={sector} />
        </div>
    );
};

export default UpdateSectorFormPage;
