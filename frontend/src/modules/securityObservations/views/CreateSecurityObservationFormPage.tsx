import SecurityObservationForm from '../components/SecurityObservationForm';

const CreateSecurityObservationFormPage = () => {
    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Nueva Observación de Seguridad
            </h1>
            <SecurityObservationForm mode="create" />
        </div>
    );
};

export default CreateSecurityObservationFormPage;
