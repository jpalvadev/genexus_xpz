import type { GridifySearchParams } from '@/hooks/useGridifyParams';

export type Plant = {
    id: number;
    name: string;
}

export interface PlantRequest {
    name: string;
}

export type PlantFilters = GridifySearchParams;
