import ObserverForm from '../components/ObserverForm';

const CreateObserverFormPage = () => {
    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">Nuevo Observador</h1>
            <ObserverForm mode="create" />
        </div>
    );
};

export default CreateObserverFormPage;
