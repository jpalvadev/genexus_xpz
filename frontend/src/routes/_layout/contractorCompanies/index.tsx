import { createFileRoute } from '@tanstack/react-router';

import { ContractorCompanyTablePage } from '@/modules/contractorCompanies/contractorCompanies.config';

export const Route = createFileRoute('/_layout/contractorCompanies/')({
    component: ContractorCompanyTablePage,
});
