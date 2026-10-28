import SectorForm from '../components/SectorForm';

const CreateSectorFormPage = () => {
    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">Nuevo Sector</h1>
            <SectorForm mode="create" />
        </div>
    );
};

export default CreateSectorFormPage;
