import type { GridifySearchParams } from '@/hooks/useGridifyParams';

export interface ContractorCompany {
    id: number;
    name: string;
}

export interface ContractorCompanyRequest {
    name: string;
}

export type ContractorCompanyFilters = GridifySearchParams;
