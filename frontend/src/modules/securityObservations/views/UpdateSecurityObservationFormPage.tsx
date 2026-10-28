import { Route } from '@/routes/_layout/securityObservations/$id/edit';
import SecurityObservationForm from '../components/SecurityObservationForm';

const UpdateSecurityObservationFormPage = () => {
    const securityObservation = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Actualización de Observación de Seguridad
            </h1>
            <SecurityObservationForm
                mode="update"
                initialData={securityObservation}
            />
        </div>
    );
};

export default UpdateSecurityObservationFormPage;
