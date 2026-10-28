import type { GridifySearchParams } from '@/hooks/useGridifyParams';

export interface Observer {
    id: number;
    legajo: number;
    fullName: string;
    objective: string;
    post: number;
    active: boolean;
    plantIds: number[];
}

export interface ObserverRequest {
    legajo: number;
    fullName: string;
    objective: string;
    post: number;
    active: boolean;
    plantIds: number[];
}

/** ObserverPost enum (backend): Gerente=1, Jefe=2, Supervisor=3 (serialized as number). */
export const OBSERVER_POSTS = [
    { value: 1, label: 'Gerente' },
    { value: 2, label: 'Jefe' },
    { value: 3, label: 'Supervisor' },
] as const;

export type ObserverFilters = GridifySearchParams;
