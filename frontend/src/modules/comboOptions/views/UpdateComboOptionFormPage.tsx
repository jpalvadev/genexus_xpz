import { Route } from '@/routes/_layout/comboOptions/$id/edit';
import ComboOptionForm from '../components/ComboOptionForm';

const UpdateComboOptionFormPage = () => {
    const comboOption = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Actualización de Opción de Combo
            </h1>
            <ComboOptionForm mode="update" initialData={comboOption} />
        </div>
    );
};

export default UpdateComboOptionFormPage;
