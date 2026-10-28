import { describe, expect, it } from 'vitest';
import { format } from 'date-fns';

import type { SecurityObservationFormValues } from './securityObservation.type';
import {
    OBSERVERS_MAX,
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
        aprReviewed: true,
        taskRealized: true,
        requiresAtrReview: true,
        trcRisk: true,
        impactRiskControlled: true,
        handInjuryMeasures: true,
        injuryMeasures: true,
        toolsReviewed: true,
        mobileEquipmentReviewed: true,
        energyReviewed: true,
        ladderReviewed: true,
        electricalEquipmentCircuitBreaker: true,
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
        expect(messagesOf(values)).toContain(`The maximum number of observers is ${OBSERVERS_MAX}`);
        expect(securityObservationSchema.safeParse({ ...validValues(), observers: Array.from({ length: 10 }, (_, i) => String(i + 1)) }).success).toBe(true);
    });

    it('rechaza el mismo observador repetido', () => {
        expect(messagesOf({ ...validValues(), observers: ['1', '1'] })).toContain(
            'The same observer cannot be named twice on one Security Observation',
        );
    });

    it('exige todos los checkboxes de Safety Review respondidos', () => {
        const messages = messagesOf({ ...validValues(), trcRisk: null, energyReviewed: null });
        expect(messages.filter((m: string) => m === 'Every Safety Review answer is required')).toHaveLength(2);
    });

    it('exige al menos una etiqueta por cada familia de combos', () => {
        const messages = messagesOf({ ...validValues(), protocolosMortales: [], relacionObservacion: [] });
        expect(messages).toContain('At least one label is required for Fatal-Risk Protocols');
        expect(messages).toContain('At least one label is required for Observation Relation');
    });

    it('exige resumen, acción detallada y descripción de acción inmediata', () => {
        const messages = messagesOf({
            ...validValues(),
            resumenObservacion: '',
            detalleAI: '   ',
            descripcionAC: '',
        });
        expect(messages).toContain('Summary is required');
        expect(messages).toContain('Detailed Action is required');
        expect(messages).toContain('Immediate Action Description is required');
    });

    it('ventana de Fecha de Observación: [hoy-7, hoy+1] inclusive', () => {
        const { min, max } = observationDateWindow();
        expect(toIsoDate(min)).toBe(min);

        expect(messagesOf({ ...validValues(), observationDate: min })).not.toContain(
            expect.stringMatching(/must be between/) as never,
        );
        expect(securityObservationSchema.safeParse({ ...validValues(), observationDate: min }).success).toBe(true);
        expect(securityObservationSchema.safeParse({ ...validValues(), observationDate: max }).success).toBe(true);

        const beforeMin = messagesOf({ ...validValues(), observationDate: '2020-01-01' });
        expect(beforeMin).toContain(`Observation Date must be between ${min} and ${max}`);

        const tomorrowPlus7 = format(new Date(new Date().getTime() + 8 * 86400000), 'yyyy-MM-dd');
        expect(messagesOf({ ...validValues(), observationDate: tomorrowPlus7 })).toContain(
            `Observation Date must be between ${min} and ${max}`,
        );

        expect(messagesOf({ ...validValues(), observationDate: '' })).toContain(
            'Observation Date is required',
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
        expect(request.aprReviewed).toBe(true);
    });

    it('empresa contratista vacía viaja como null', () => {
        const request = securityObservationFormValuesToRequest(
            { ...validValues(), contractorCompanyId: '' },
            [],
        );
        expect(request.contractorCompanyId).toBeNull();
    });
});
