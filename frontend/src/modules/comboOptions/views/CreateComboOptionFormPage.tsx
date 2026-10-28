import ComboOptionForm from '../components/ComboOptionForm';

const CreateComboOptionFormPage = () => {
    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">Nueva Opción de Combo</h1>
            <ComboOptionForm mode="create" />
        </div>
    );
};

export default CreateComboOptionFormPage;
