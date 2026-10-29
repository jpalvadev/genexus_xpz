import type { GridifySearchParams } from '@/hooks/useGridifyParams';

export type Sector = {
    id: number;
    name: string;
}

export interface SectorRequest {
    name: string;
}

export type SectorFilters = GridifySearchParams;
