import { Route } from '@/routes/_layout/securityObservations/$id';
import SecurityObservationForm from '../components/SecurityObservationForm';

const GetSecurityObservationByIdFormPage = () => {
    const securityObservation = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Detalle de Observación de Seguridad
            </h1>
            <SecurityObservationForm
                mode="view"
                initialData={securityObservation}
            />
        </div>
    );
};

export default GetSecurityObservationByIdFormPage;
