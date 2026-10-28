import { z } from 'zod';
import { format } from 'date-fns';
import type { GridifySearchParams } from '@/hooks/useGridifyParams';
import type { ComboOption } from '@/modules/comboOptions/types/comboOption.type';

/**
 * Security Observation contracts (SHYMA_OPS). Types mirror SecurityObservationResponse /
 * SecurityObservationRequest; the zod schema mirrors SecurityObservationRules (spec: backend
 * enforces, frontend mirrors with the same English messages, same first-rule order).
 */

// ─── Response / payload ─────────────────────────────────────────────────────────────

export interface SecurityObservationRef {
    id: number;
    name: string;
}

export interface SecurityObservationObserverRef {
    id: number;
    fullName: string;
    legajo: number;
    active: boolean;
}

export type SecurityObservationResponse = {
    id: number;
    observationDate: string;
    createdOn: string;
    task: string;
    lugar: string;
    aprReviewed: boolean | null;
    taskRealized: boolean | null;
    requiresAtrReview: boolean | null;
    trcRisk: boolean | null;
    impactRiskControlled: boolean | null;
    handInjuryMeasures: boolean | null;
    injuryMeasures: boolean | null;
    toolsReviewed: boolean | null;
    mobileEquipmentReviewed: boolean | null;
    energyReviewed: boolean | null;
    ladderReviewed: boolean | null;
    electricalEquipmentCircuitBreaker: boolean | null;
    controlesCriticos: string | null;
    gestionRiesgo: string[];
    protocolosMortales: string[];
    clasificacionObservacion: string[];
    relacionObservacion: string[];
    resumenObservacion: string;
    detalleAI: string;
    descripcionAC: string;
    plant: SecurityObservationRef;
    sector: SecurityObservationRef;
    contractorCompany: SecurityObservationRef | null;
    observers: SecurityObservationObserverRef[];
}

/** Create/update payload (SecurityObservationRequest). */
export interface SecurityObservationRequest {
    observationDate: string;
    task: string;
    lugar: string;
    plantId: number;
    sectorId: number;
    contractorCompanyId: number | null;
    observers: { observerId: number }[];
    aprReviewed: boolean | null;
    taskRealized: boolean | null;
    requiresAtrReview: boolean | null;
    trcRisk: boolean | null;
    impactRiskControlled: boolean | null;
    handInjuryMeasures: boolean | null;
    injuryMeasures: boolean | null;
    toolsReviewed: boolean | null;
    mobileEquipmentReviewed: boolean | null;
    energyReviewed: boolean | null;
    ladderReviewed: boolean | null;
    electricalEquipmentCircuitBreaker: boolean | null;
    controlesCriticos: string;
    gestionRiesgo: string[];
    protocolosMortales: string[];
    clasificacionObservacion: string[];
    relacionObservacion: string[];
    resumenObservacion: string;
    detalleAI: string;
    descripcionAC: string;
}

export type SecurityObservationFilters = GridifySearchParams;

// ─── Rule constants (mirror SecurityObservationRules.cs) ───────────────────────────

export const OBSERVERS_MIN = 1;
export const OBSERVERS_MAX = 10;
export const OBSERVATION_DATE_BACK_DAYS = 7;
export const OBSERVATION_DATE_FWD_DAYS = 1;

export const SAFETY_REVIEW_FIELDS = [
    { key: 'aprReviewed', label: 'APR reviewed' },
    { key: 'taskRealized', label: 'Task realized as planned' },
    { key: 'requiresAtrReview', label: 'Requires ATR review' },
    { key: 'trcRisk', label: 'TRC risk' },
    { key: 'impactRiskControlled', label: 'Impact risk controlled' },
    { key: 'handInjuryMeasures', label: 'Hand injury measures' },
    { key: 'injuryMeasures', label: 'Injury measures' },
    { key: 'toolsReviewed', label: 'Tools reviewed' },
    { key: 'mobileEquipmentReviewed', label: 'Mobile equipment reviewed' },
    { key: 'energyReviewed', label: 'Energy reviewed' },
    { key: 'ladderReviewed', label: 'Ladder reviewed' },
    { key: 'electricalEquipmentCircuitBreaker', label: 'Electrical equipment circuit breaker' },
] as const;

export type SafetyReviewKey = (typeof SAFETY_REVIEW_FIELDS)[number]['key'];

/** English labels used verbatim in the "At least one label is required for …" rule. */
export const MULTI_SELECT_LABELS = {
    gestionRiesgo: 'Risk Management',
    protocolosMortales: 'Fatal-Risk Protocols',
    clasificacionObservacion: 'Observation Classification',
    relacionObservacion: 'Observation Relation',
} as const;

export type ComboFieldKey = keyof typeof MULTI_SELECT_LABELS;

/** Observation Date window [today − 7, today + 1] as ISO (yyyy-MM-dd) strings. */
export function observationDateWindow(today: Date = new Date()): { min: string; max: string } {
    return {
        min: format(
            new Date(today.getFullYear(), today.getMonth(), today.getDate() - OBSERVATION_DATE_BACK_DAYS),
            'yyyy-MM-dd',
        ),
        max: format(
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + OBSERVATION_DATE_FWD_DAYS),
            'yyyy-MM-dd',
        ),
    };
}

/** FormDate hands over a Date on pick; persisted values arrive as 'yyyy-MM-dd' strings. */
export function toIsoDate(value: string | Date): string {
    return value instanceof Date ? format(value, 'yyyy-MM-dd') : value;
}

// ─── Form values + zod ─────────────────────────────────────────────────────────────

export type SecurityObservationFormValues = {
    observationDate: string | Date;
    task: string;
    lugar: string;
    plantId: string;
    sectorId: string;
    contractorCompanyId: string;
    observers: string[];
    aprReviewed: boolean | null;
    taskRealized: boolean | null;
    requiresAtrReview: boolean | null;
    trcRisk: boolean | null;
    impactRiskControlled: boolean | null;
    handInjuryMeasures: boolean | null;
    injuryMeasures: boolean | null;
    toolsReviewed: boolean | null;
    mobileEquipmentReviewed: boolean | null;
    energyReviewed: boolean | null;
    ladderReviewed: boolean | null;
    electricalEquipmentCircuitBreaker: boolean | null;
    controlesCriticos: string;
    gestionRiesgo: string[];
    protocolosMortales: string[];
    clasificacionObservacion: string[];
    relacionObservacion: string[];
    resumenObservacion: string;
    detalleAI: string;
    descripcionAC: string;
}

const { min: WINDOW_MIN, max: WINDOW_MAX } = observationDateWindow();

export const securityObservationSchema = z
    .object({
        observationDate: z.union([z.string(), z.date()]),
        task: z.string().trim().min(1, 'Task is required'),
        lugar: z.string().trim().min(1, 'Place is required'),
        plantId: z.string().min(1, 'Plant is required'),
        sectorId: z.string().min(1, 'Sector is required'),
        contractorCompanyId: z.string(),
        observers: z.array(z.string()).min(OBSERVERS_MIN, 'At least one observer is required'),
        aprReviewed: z.boolean().nullable(),
        taskRealized: z.boolean().nullable(),
        requiresAtrReview: z.boolean().nullable(),
        trcRisk: z.boolean().nullable(),
        impactRiskControlled: z.boolean().nullable(),
        handInjuryMeasures: z.boolean().nullable(),
        injuryMeasures: z.boolean().nullable(),
        toolsReviewed: z.boolean().nullable(),
        mobileEquipmentReviewed: z.boolean().nullable(),
        energyReviewed: z.boolean().nullable(),
        ladderReviewed: z.boolean().nullable(),
        electricalEquipmentCircuitBreaker: z.boolean().nullable(),
        controlesCriticos: z.string(),
        gestionRiesgo: z.array(z.string()),
        protocolosMortales: z.array(z.string()),
        clasificacionObservacion: z.array(z.string()),
        relacionObservacion: z.array(z.string()),
        resumenObservacion: z.string().trim().min(1, 'Summary is required'),
        detalleAI: z.string().trim().min(1, 'Detailed Action is required'),
        descripcionAC: z.string().trim().min(1, 'Immediate Action Description is required'),
    })
    .superRefine((values, ctx) => {
        // Same order as SecurityObservationRules.FirstViolation
        const observerCount = values.observers.length;
        if (observerCount > OBSERVERS_MAX) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observers'],
                message: `The maximum number of observers is ${OBSERVERS_MAX}`,
            });
        }
        if (new Set(values.observers).size !== observerCount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observers'],
                message: 'The same observer cannot be named twice on one Security Observation',
            });
        }

        for (const { key } of SAFETY_REVIEW_FIELDS) {
            if (values[key] === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [key],
                    message: 'Every Safety Review answer is required',
                });
            }
        }

        for (const key of Object.keys(MULTI_SELECT_LABELS) as ComboFieldKey[]) {
            if (values[key].length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [key],
                    message: `At least one label is required for ${MULTI_SELECT_LABELS[key]}`,
                });
            }
        }

        const iso = toIsoDate(values.observationDate);
        if (!iso) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observationDate'],
                message: 'Observation Date is required',
            });
        } else if (iso < WINDOW_MIN || iso > WINDOW_MAX) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observationDate'],
                message: `Observation Date must be between ${WINDOW_MIN} and ${WINDOW_MAX}`,
            });
        }
    });

// ─── Mapping helpers ───────────────────────────────────────────────────────────────

export function emptySecurityObservationFormValues(): SecurityObservationFormValues {
    return {
        observationDate: format(new Date(), 'yyyy-MM-dd'),
        task: '',
        lugar: '',
        plantId: '',
        sectorId: '',
        contractorCompanyId: '',
        observers: [],
        controlesCriticos: '',
        gestionRiesgo: [],
        protocolosMortales: [],
        clasificacionObservacion: [],
        relacionObservacion: [],
        resumenObservacion: '',
        detalleAI: '',
        descripcionAC: '',
        aprReviewed: null,
        taskRealized: null,
        requiresAtrReview: null,
        trcRisk: null,
        impactRiskControlled: null,
        handInjuryMeasures: null,
        injuryMeasures: null,
        toolsReviewed: null,
        mobileEquipmentReviewed: null,
        energyReviewed: null,
        ladderReviewed: null,
        electricalEquipmentCircuitBreaker: null,
    };
}

/**
 * Persisted record → form values. The combo MultiSelects work with combo option ids,
 * so the saved label arrays are resolved against the loaded catalogue.
 */
export function securityObservationToFormValues(
    record: SecurityObservationResponse,
    comboCatalog: ComboOption[],
): SecurityObservationFormValues {
    const idsFor = (key: ComboFieldKey, labels: string[]): string[] =>
        comboCatalog
            .filter((item) => item.comboKey === key && labels.includes(item.label))
            .map((item) => String(item.id));

    return {
        observationDate: record.observationDate,
        task: record.task,
        lugar: record.lugar,
        plantId: String(record.plant.id),
        sectorId: String(record.sector.id),
        contractorCompanyId: record.contractorCompany ? String(record.contractorCompany.id) : '',
        observers: record.observers.map((o) => String(o.id)),
        aprReviewed: record.aprReviewed,
        taskRealized: record.taskRealized,
        requiresAtrReview: record.requiresAtrReview,
        trcRisk: record.trcRisk,
        impactRiskControlled: record.impactRiskControlled,
        handInjuryMeasures: record.handInjuryMeasures,
        injuryMeasures: record.injuryMeasures,
        toolsReviewed: record.toolsReviewed,
        mobileEquipmentReviewed: record.mobileEquipmentReviewed,
        energyReviewed: record.energyReviewed,
        ladderReviewed: record.ladderReviewed,
        electricalEquipmentCircuitBreaker: record.electricalEquipmentCircuitBreaker,
        controlesCriticos: record.controlesCriticos ?? '',
        gestionRiesgo: idsFor('gestionRiesgo', record.gestionRiesgo),
        protocolosMortales: idsFor('protocolosMortales', record.protocolosMortales),
        clasificacionObservacion: idsFor('clasificacionObservacion', record.clasificacionObservacion),
        relacionObservacion: idsFor('relacionObservacion', record.relacionObservacion),
        resumenObservacion: record.resumenObservacion,
        detalleAI: record.detalleAI,
        descripcionAC: record.descripcionAC,
    };
}

export function securityObservationFormValuesToRequest(
    values: SecurityObservationFormValues,
    comboCatalog: ComboOption[],
): SecurityObservationRequest {
    const labelsFor = (ids: string[]): string[] =>
        ids
            .map((id) => comboCatalog.find((item) => String(item.id) === id)?.label)
            .filter((label): label is string => Boolean(label));

    return {
        observationDate: toIsoDate(values.observationDate),
        task: values.task.trim(),
        lugar: values.lugar.trim(),
        plantId: Number(values.plantId),
        sectorId: Number(values.sectorId),
        contractorCompanyId: values.contractorCompanyId === '' ? null : Number(values.contractorCompanyId),
        observers: values.observers.map((id) => ({ observerId: Number(id) })),
        aprReviewed: values.aprReviewed,
        taskRealized: values.taskRealized,
        requiresAtrReview: values.requiresAtrReview,
        trcRisk: values.trcRisk,
        impactRiskControlled: values.impactRiskControlled,
        handInjuryMeasures: values.handInjuryMeasures,
        injuryMeasures: values.injuryMeasures,
        toolsReviewed: values.toolsReviewed,
        mobileEquipmentReviewed: values.mobileEquipmentReviewed,
        energyReviewed: values.energyReviewed,
        ladderReviewed: values.ladderReviewed,
        electricalEquipmentCircuitBreaker: values.electricalEquipmentCircuitBreaker,
        controlesCriticos: values.controlesCriticos,
        gestionRiesgo: labelsFor(values.gestionRiesgo),
        protocolosMortales: labelsFor(values.protocolosMortales),
        clasificacionObservacion: labelsFor(values.clasificacionObservacion),
        relacionObservacion: labelsFor(values.relacionObservacion),
        resumenObservacion: values.resumenObservacion.trim(),
        detalleAI: values.detalleAI.trim(),
        descripcionAC: values.descripcionAC.trim(),
    };
}
