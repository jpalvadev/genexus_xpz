import ContractorCompanyTablePage from '@/modules/contractorCompanies/views/ContractorCompanyTablePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/contractorCompanies/')({
    component: ContractorCompanyTablePage,
});
