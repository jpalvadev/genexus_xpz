import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import type { GridifySearchParams } from '@/hooks/useGridifyParams';
import type { ComboOption } from '@/modules/comboOptions/types/comboOption.type';

/**
 * Security Observation contracts (SHYMA_OPS). Types mirror SecurityObservationResponse /
 * SecurityObservationRequest; the zod schema mirrors SecurityObservationRules (ADR-0005:
 * backend enforces, frontend mirrors with the same Spanish messages, same first-rule order).
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
    aprReviewed: SafetyReviewAnswer | null;
    taskRealized: SafetyReviewAnswer | null;
    requiresAtrReview: SafetyReviewAnswer | null;
    trcRisk: SafetyReviewAnswer | null;
    impactRiskControlled: SafetyReviewAnswer | null;
    handInjuryMeasures: SafetyReviewAnswer | null;
    injuryMeasures: SafetyReviewAnswer | null;
    toolsReviewed: SafetyReviewAnswer | null;
    mobileEquipmentReviewed: SafetyReviewAnswer | null;
    energyReviewed: SafetyReviewAnswer | null;
    ladderReviewed: SafetyReviewAnswer | null;
    electricalEquipmentCircuitBreaker: SafetyReviewAnswer | null;
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
    aprReviewed: SafetyReviewAnswer | null;
    taskRealized: SafetyReviewAnswer | null;
    requiresAtrReview: SafetyReviewAnswer | null;
    trcRisk: SafetyReviewAnswer | null;
    impactRiskControlled: SafetyReviewAnswer | null;
    handInjuryMeasures: SafetyReviewAnswer | null;
    injuryMeasures: SafetyReviewAnswer | null;
    toolsReviewed: SafetyReviewAnswer | null;
    mobileEquipmentReviewed: SafetyReviewAnswer | null;
    energyReviewed: SafetyReviewAnswer | null;
    ladderReviewed: SafetyReviewAnswer | null;
    electricalEquipmentCircuitBreaker: SafetyReviewAnswer | null;
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

/**
 * Safety Review answer (ADR-0006, GLOSSARY "Respuesta de Revisión de Seguridad"):
 * tri-state wire literals "SI"/"NO"/"N/A" (Spanish values, English property names).
 * null is absence — unanswered, an error on the record; "N/A" is an answer.
 */
export type SafetyReviewAnswer = 'SI' | 'NO' | 'N/A';

export const SAFETY_REVIEW_VALUES = ['SI', 'NO', 'N/A'] as const;

/** Regla de valor fuera del set (ticket 04): mismo mensaje y mismo orden que
 *  SecurityObservationRules — se evalúa antes de la obligatoriedad. */
export const SAFETY_REVIEW_INVALID_COPY =
    'Las respuestas de la Revisión de Seguridad deben ser Sí, No o N/A';

/** Segments of the tri-state ToggleGroup: Spanish visible labels on wire values. */
export const SAFETY_REVIEW_OPTIONS: { label: string; value: SafetyReviewAnswer }[] = [
    { label: 'Sí', value: 'SI' },
    { label: 'No', value: 'NO' },
    { label: 'N/A', value: 'N/A' },
];

export const SAFETY_REVIEW_FIELDS = [
    { key: 'aprReviewed', label: 'APR revisado' },
    { key: 'taskRealized', label: 'Tarea realizada según APR' },
    { key: 'requiresAtrReview', label: 'Revisión de ATR necesaria' },
    { key: 'trcRisk', label: 'Riesgo TRC considerado' },
    { key: 'impactRiskControlled', label: 'Riesgo de impacto controlado' },
    { key: 'handInjuryMeasures', label: 'Medidas de manos y lesiones' },
    { key: 'injuryMeasures', label: 'Medidas de lesiones' },
    { key: 'toolsReviewed', label: 'Herramientas revisadas' },
    { key: 'mobileEquipmentReviewed', label: 'Equipos móviles revisados' },
    { key: 'energyReviewed', label: 'Energía revisada' },
    { key: 'ladderReviewed', label: 'Escaleras revisadas' },
    { key: 'electricalEquipmentCircuitBreaker', label: 'Equipos eléctricos y disyuntores' },
] as const;

export type SafetyReviewKey = (typeof SAFETY_REVIEW_FIELDS)[number]['key'];

/** Spanish labels used verbatim in the "Se requiere al menos un label para …" rule. */
export const MULTI_SELECT_LABELS = {
    gestionRiesgo: 'Gestión de Riesgo',
    protocolosMortales: 'Protocolos Mortales',
    clasificacionObservacion: 'Clasificación de Observación',
    relacionObservacion: 'Relación de Observación',
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
    aprReviewed: SafetyReviewAnswer | null;
    taskRealized: SafetyReviewAnswer | null;
    requiresAtrReview: SafetyReviewAnswer | null;
    trcRisk: SafetyReviewAnswer | null;
    impactRiskControlled: SafetyReviewAnswer | null;
    handInjuryMeasures: SafetyReviewAnswer | null;
    injuryMeasures: SafetyReviewAnswer | null;
    toolsReviewed: SafetyReviewAnswer | null;
    mobileEquipmentReviewed: SafetyReviewAnswer | null;
    energyReviewed: SafetyReviewAnswer | null;
    ladderReviewed: SafetyReviewAnswer | null;
    electricalEquipmentCircuitBreaker: SafetyReviewAnswer | null;
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
        task: z.string().trim().min(1, 'La tarea es obligatoria'),
        lugar: z.string().trim().min(1, 'El lugar es obligatorio'),
        plantId: z.string().min(1, 'La planta es obligatoria'),
        sectorId: z.string().min(1, 'El sector es obligatorio'),
        contractorCompanyId: z.string(),
        observers: z.array(z.string()).min(OBSERVERS_MIN, 'Se requiere al menos un observador'),
        // ADR-0006 + ticket 04: literales tri-estado con la regla de valor fuera
        // del set; zod la evalúa en el parseo de campos, antes del superRefine.
        aprReviewed: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        taskRealized: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        requiresAtrReview: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        trcRisk: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        impactRiskControlled: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        handInjuryMeasures: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        injuryMeasures: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        toolsReviewed: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        mobileEquipmentReviewed: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        energyReviewed: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        ladderReviewed: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        electricalEquipmentCircuitBreaker: z.enum(SAFETY_REVIEW_VALUES, { message: SAFETY_REVIEW_INVALID_COPY }).nullable(),
        controlesCriticos: z.string(),
        gestionRiesgo: z.array(z.string()),
        protocolosMortales: z.array(z.string()),
        clasificacionObservacion: z.array(z.string()),
        relacionObservacion: z.array(z.string()),
        resumenObservacion: z.string().trim().min(1, 'El resumen es obligatorio'),
        detalleAI: z.string().trim().min(1, 'La acción detallada es obligatoria'),
        descripcionAC: z.string().trim().min(1, 'La descripción de la acción inmediata es obligatoria'),
    })
    .superRefine((values, ctx) => {
        // Same order as SecurityObservationRules.FirstViolation
        const observerCount = values.observers.length;
        if (observerCount > OBSERVERS_MAX) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observers'],
                message: `El máximo de observadores es ${OBSERVERS_MAX}`,
            });
        }
        if (new Set(values.observers).size !== observerCount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observers'],
                message: 'El mismo observador no puede nombrarse dos veces en una Observación de Seguridad',
            });
        }

        for (const { key } of SAFETY_REVIEW_FIELDS) {
            if (values[key] === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [key],
                    message: 'Todas las respuestas de la Revisión de Seguridad son obligatorias',
                });
            }
        }

        for (const key of Object.keys(MULTI_SELECT_LABELS) as ComboFieldKey[]) {
            if (values[key].length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [key],
                    message: `Se requiere al menos un label para ${MULTI_SELECT_LABELS[key]}`,
                });
            }
        }

        const iso = toIsoDate(values.observationDate);
        if (!iso) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observationDate'],
                message: 'La fecha de observación es obligatoria',
            });
        } else if (iso < WINDOW_MIN || iso > WINDOW_MAX) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['observationDate'],
                message: `La fecha de observación debe estar entre ${format(parseISO(WINDOW_MIN), 'dd/MM/yyyy')} y ${format(parseISO(WINDOW_MAX), 'dd/MM/yyyy')}`,
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
