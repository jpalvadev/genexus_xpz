import { createFileRoute } from '@tanstack/react-router';

import { CreateContractorCompanyPage } from '@/modules/contractorCompanies/contractorCompanies.config';

export const Route = createFileRoute('/_layout/contractorCompanies/new')({
    component: CreateContractorCompanyPage,
});
