import ContractorCompanyForm from '../components/ContractorCompanyForm';

const CreateContractorCompanyFormPage = () => {
    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">Nueva Empresa Contratista</h1>
            <ContractorCompanyForm mode="create" />
        </div>
    );
};

export default CreateContractorCompanyFormPage;
