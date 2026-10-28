import type { GridifySearchParams } from '@/hooks/useGridifyParams';

export type ComboOption = {
    id: number;
    comboKey: string;
    label: string;
    order: number;
}

export interface ComboOptionRequest {
    comboKey: string;
    label: string;
    order: number;
}

/** Combo keys consumed by the Security Observation MultiSelects. */
export const COMBO_KEYS = {
    gestionRiesgo: 'gestionRiesgo',
    protocolosMortales: 'protocolosMortales',
    clasificacionObservacion: 'clasificacionObservacion',
    relacionObservacion: 'relacionObservacion',
} as const;

export type ComboOptionFilters = GridifySearchParams;
