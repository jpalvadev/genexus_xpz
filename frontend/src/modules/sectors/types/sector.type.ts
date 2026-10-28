import type { GridifySearchParams } from '@/hooks/useGridifyParams';

export interface Sector {
    id: number;
    name: string;
}

export interface SectorRequest {
    name: string;
}

export type SectorFilters = GridifySearchParams;
