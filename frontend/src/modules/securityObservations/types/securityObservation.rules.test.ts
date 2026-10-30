import { describe, expect, it } from 'vitest';
import { format, parseISO } from 'date-fns';

import type { SafetyReviewAnswer, SecurityObservationFormValues } from './securityObservation.type';
import {
    OBSERVERS_MAX,
    SAFETY_REVIEW_FIELDS,
    SAFETY_REVIEW_INVALID_COPY,
    emptySecurityObservationFormValues,
    observationDateWindow,
    securityObservationFormValuesToRequest,
    securityObservationSchema,
    toIsoDate,
} from './securityObservation.type';

/** Mirrors SecurityObservationRulesTests.cs at the form-values level: the zod schema is the
 *  exact client-side mirror, so the same messages and the same first-rule order are expected. */

const validValues = (): SecurityObservationFormValues => {
    const base = emptySecurityObservationFormValues();
    return {
        ...base,
        task: 'Cambio de esmeril',
        lugar: 'Planta Norte',
        plantId: '1',
        sectorId: '2',
        contractorCompanyId: '3',
        observers: ['1', '2'],
        aprReviewed: 'SI',
        taskRealized: 'SI',
        requiresAtrReview: 'SI',
        trcRisk: 'SI',
        impactRiskControlled: 'SI',
        handInjuryMeasures: 'SI',
        injuryMeasures: 'SI',
        toolsReviewed: 'SI',
        mobileEquipmentReviewed: 'SI',
        energyReviewed: 'SI',
        ladderReviewed: 'SI',
        electricalEquipmentCircuitBreaker: 'SI',
        gestionRiesgo: ['1'],
        protocolosMortales: ['3'],
        clasificacionObservacion: ['2'],
        relacionObservacion: ['4'],
        resumenObservacion: 'Resumen',
        detalleAI: 'Accion detallada',
        descripcionAC: 'Accion inmediata',
    };
};

const messagesOf = (values: ReturnType<typeof validValues>) =>
    securityObservationSchema.safeParse(values).error?.issues.map((issue: { message: string }) => issue.message) ?? [];

describe('securityObservationSchema (mirror de SecurityObservationRules)', () => {
    it('acepta una observación válida', () => {
        const result = securityObservationSchema.safeParse(validValues());
        expect(result.success).toBe(true);
    });

    it('rechaza más de 10 observadores con el límite exacto', () => {
        const values = { ...validValues(), observers: Array.from({ length: 11 }, (_, i) => String(i + 1)) };
        expect(messagesOf(values)).toContain(`El máximo de observadores es ${OBSERVERS_MAX}`);
        expect(securityObservationSchema.safeParse({ ...validValues(), observers: Array.from({ length: 10 }, (_, i) => String(i + 1)) }).success).toBe(true);
    });

    it('rechaza el mismo observador repetido', () => {
        expect(messagesOf({ ...validValues(), observers: ['1', '1'] })).toContain(
            'El mismo observador no puede nombrarse dos veces en una Observación de Seguridad',
        );
    });

    it('acepta una observación con las doce respuestas en N/A (ADR-0006: N/A es respuesta)', () => {
        const values = validValues();
        for (const { key } of SAFETY_REVIEW_FIELDS) {
            values[key] = 'N/A';
        }
        expect(securityObservationSchema.safeParse(values).success).toBe(true);
    });

    it('rechaza un valor fuera del set con la copia española (ticket 04)', () => {
        const messages = messagesOf({ ...validValues(), aprReviewed: 'Sí' as unknown as SafetyReviewAnswer });
        expect(messages).toContain(SAFETY_REVIEW_INVALID_COPY);
        // Mismo orden que la cadena "primera violación" del backend: el espejo zod
        // la reporta en el parseo de campos; la obligatoriedad no cambió de mensaje.
        expect(messages).not.toContain('Todas las respuestas de la Revisión de Seguridad son obligatorias');
    });

    it('exige todas las respuestas de Safety Review respondidas', () => {
        const messages = messagesOf({ ...validValues(), trcRisk: null, energyReviewed: null });
        expect(messages.filter((m: string) => m === 'Todas las respuestas de la Revisión de Seguridad son obligatorias')).toHaveLength(2);
    });

    it('exige al menos una etiqueta por cada familia de combos', () => {
        const messages = messagesOf({ ...validValues(), protocolosMortales: [], relacionObservacion: [] });
        expect(messages).toContain('Se requiere al menos un label para Protocolos Mortales');
        expect(messages).toContain('Se requiere al menos un label para Relación de Observación');
    });

    it('exige resumen, acción detallada y descripción de acción inmediata', () => {
        const messages = messagesOf({
            ...validValues(),
            resumenObservacion: '',
            detalleAI: '   ',
            descripcionAC: '',
        });
        expect(messages).toContain('El resumen es obligatorio');
        expect(messages).toContain('La acción detallada es obligatoria');
        expect(messages).toContain('La descripción de la acción inmediata es obligatoria');
    });

    it('ventana de Fecha de Observación: [hoy-7, hoy+1] inclusive', () => {
        const { min, max } = observationDateWindow();
        expect(toIsoDate(min)).toBe(min);

        expect(messagesOf({ ...validValues(), observationDate: min })).not.toContain(
            expect.stringMatching(/debe estar entre/) as never,
        );
        expect(securityObservationSchema.safeParse({ ...validValues(), observationDate: min }).success).toBe(true);
        expect(securityObservationSchema.safeParse({ ...validValues(), observationDate: max }).success).toBe(true);

        const beforeMin = messagesOf({ ...validValues(), observationDate: '2020-01-01' });
        expect(beforeMin).toContain(`La fecha de observación debe estar entre ${format(parseISO(min), 'dd/MM/yyyy')} y ${format(parseISO(max), 'dd/MM/yyyy')}`);

        const tomorrowPlus7 = format(new Date(new Date().getTime() + 8 * 86400000), 'yyyy-MM-dd');
        expect(messagesOf({ ...validValues(), observationDate: tomorrowPlus7 })).toContain(
            `La fecha de observación debe estar entre ${format(parseISO(min), 'dd/MM/yyyy')} y ${format(parseISO(max), 'dd/MM/yyyy')}`,
        );

        expect(messagesOf({ ...validValues(), observationDate: '' })).toContain(
            'La fecha de observación es obligatoria',
        );
    });

    it('Date objects (FormDate) se normalizan a ISO antes de validar', () => {
        expect(toIsoDate(new Date(2026, 0, 15))).toBe('2026-01-15');
    });
});

describe('securityObservationFormValuesToRequest', () => {
    it('mapea ids/labels al payload SecurityObservationRequest', () => {
        const catalog = [
            { id: 1, comboKey: 'gestionRiesgo', label: 'Daily Risk Talk (DRT)', order: 1, isActive: true },
            { id: 3, comboKey: 'protocolosMortales', label: 'Working at Height', order: 1, isActive: true },
            { id: 2, comboKey: 'clasificacionObservacion', label: 'Safe Condition', order: 1, isActive: true },
            { id: 4, comboKey: 'relacionObservacion', label: 'Related to Task', order: 1, isActive: true },
        ];
        const request = securityObservationFormValuesToRequest(validValues(), catalog);

        expect(request.plantId).toBe(1);
        expect(request.sectorId).toBe(2);
        expect(request.contractorCompanyId).toBe(3);
        expect(request.observers).toEqual([{ observerId: 1 }, { observerId: 2 }]);
        expect(request.gestionRiesgo).toEqual(['Daily Risk Talk (DRT)']);
        expect(request.protocolosMortales).toEqual(['Working at Height']);
        expect(request.clasificacionObservacion).toEqual(['Safe Condition']);
        expect(request.relacionObservacion).toEqual(['Related to Task']);
        expect(request.aprReviewed).toBe('SI');
    });

    it('empresa contratista vacía viaja como null', () => {
        const request = securityObservationFormValuesToRequest(
            { ...validValues(), contractorCompanyId: '' },
            [],
        );
        expect(request.contractorCompanyId).toBeNull();
    });
});
