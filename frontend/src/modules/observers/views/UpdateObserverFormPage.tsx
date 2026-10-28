import { Route } from '@/routes/_layout/observers/$id/edit';
import ObserverForm from '../components/ObserverForm';

const UpdateObserverFormPage = () => {
    const observer = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">Actualización de Observador</h1>
            <ObserverForm mode="update" initialData={observer} />
        </div>
    );
};

export default UpdateObserverFormPage;
