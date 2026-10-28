import type { GridifySearchParams } from '@/hooks/useGridifyParams';

export type ContractorCompany = {
    id: number;
    name: string;
}

export interface ContractorCompanyRequest {
    name: string;
}

export type ContractorCompanyFilters = GridifySearchParams;
