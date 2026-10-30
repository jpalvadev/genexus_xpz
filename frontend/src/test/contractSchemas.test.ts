import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import observationJson from './fixtures/security-observation.response.json';
import observationListJson from './fixtures/security-observation-list.response.json';
import plantListJson from './fixtures/plant-list.response.json';
import sectorListJson from './fixtures/sector-list.response.json';
import companyListJson from './fixtures/contractor-company-list.response.json';
import observerListJson from './fixtures/observer-list.response.json';
import comboOptionsJson from './fixtures/combo-options.response.json';
import comboKeyJson from './fixtures/combo-options-key.response.json';

import type { SecurityObservationResponse } from '@/modules/securityObservations/types/securityObservation.type';
import type { ComboOption } from '@/modules/comboOptions/types/comboOption.type';
import type { Observer } from '@/modules/observers/types/observer.type';
import type { Plant } from '@/modules/plants/types/plant.type';
import type { Sector } from '@/modules/sectors/types/sector.type';
import type { ContractorCompany } from '@/modules/contractorCompanies/types/contractorCompany.type';

/**
 * Contract schemas: zod parsers for the LIVE API responses captured in src/test/fixtures.
 * The fixtures were recorded from the running backend (capture-fixtures.py); parsing them
 * with these schemas — and with the frontend's own TS types — is the contract check.
 */

const refSchema = z.object({ id: z.number(), name: z.string() });
const safetyBooleans = {
    // Ticket 02 trace (ADR-0006): aprReviewed is a tri-state wire literal;
    // the remaining 11 flip with ticket 03.
    aprReviewed: z.enum(['SI', 'NO', 'N/A']).nullable(),
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
};

const observationResponseSchema = z.object({
    id: z.number(),
    observationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    createdOn: z.string(),
    task: z.string(),
    lugar: z.string(),
    ...safetyBooleans,
    controlesCriticos: z.string().nullable(),
    gestionRiesgo: z.array(z.string()),
    protocolosMortales: z.array(z.string()),
    clasificacionObservacion: z.array(z.string()),
    relacionObservacion: z.array(z.string()),
    resumenObservacion: z.string(),
    detalleAI: z.string(),
    descripcionAC: z.string(),
    plant: refSchema,
    sector: refSchema,
    contractorCompany: refSchema.nullable(),
    observers: z.array(z.object({
        id: z.number(),
        fullName: z.string(),
        legajo: z.number(),
        active: z.boolean(),
    })),
});

const listEnvelope = <T extends z.ZodTypeAny>(data: T) =>
    z.object({ count: z.number(), data: z.array(data) });

const comboOptionSchema = z.object({
    id: z.number(),
    comboKey: z.string(),
    label: z.string(),
    order: z.number(),
});

const observerSchema = z.object({
    id: z.number(),
    legajo: z.number(),
    fullName: z.string(),
    objective: z.string(),
    post: z.number(),
    active: z.boolean(),
    plantIds: z.array(z.number()),
});

const namedListSchema = listEnvelope(refSchema);

describe('contratos de API (fixtures vivientes parseados con zod)', () => {
    it('SecurityObservationResponse coincide con el fixture capturado', () => {
        const parsed = observationResponseSchema.parse(observationJson);
        expect(parsed.id).toBe(observationJson.id);
        expect(parsed.observers.length).toBeGreaterThan(0);
        expect(parsed.plant.name).toBeTruthy();
    });

    it('el listado paginado {count,data} coincide', () => {
        const parsed = listEnvelope(observationResponseSchema).parse(observationListJson);
        expect(parsed.count).toBeGreaterThanOrEqual(parsed.data.length);
    });

    it('listas maestras (plants/sectors/contractor-companies) coinciden', () => {
        expect(namedListSchema.parse(plantListJson).data.length).toBeGreaterThan(0);
        expect(namedListSchema.parse(sectorListJson).data.length).toBeGreaterThan(0);
        expect(namedListSchema.parse(companyListJson).data.length).toBeGreaterThan(0);
    });

    it('observer-list coincide (legajo, post numérico, plantIds)', () => {
        const parsed = listEnvelope(observerSchema).parse(observerListJson);
        expect(parsed.data[0]).toHaveProperty('legajo');
        expect(parsed.data[0].plantIds.length).toBeGreaterThan(0);
    });

    it('combo-options (plano y por clave) coincide', () => {
        expect(z.array(comboOptionSchema).parse(comboOptionsJson).length).toBeGreaterThan(0);
        expect(z.array(comboOptionSchema).parse(comboKeyJson).length).toBeGreaterThan(0);
    });
});

describe('contratos de API (tipos TS de frontend aplican a los fixtures)', () => {
    it('los fixtures viven tipados como los tipos del módulo', () => {
        const observation: SecurityObservationResponse =
            observationJson as unknown as SecurityObservationResponse;
        const plants: Plant[] = plantListJson.data;
        const sectors: Sector[] = sectorListJson.data;
        const companies: ContractorCompany[] = companyListJson.data;
        const observers: Observer[] = observerListJson.data;
        const combos: ComboOption[] = comboOptionsJson;
        const combosByKey: ComboOption[] = comboKeyJson;

        expect(observation.observers[0].active).toBe(true);
        expect(plants.length).toBeGreaterThan(0);
        expect(sectors.length).toBeGreaterThan(0);
        expect(companies.length).toBeGreaterThan(0);
        expect(observers.length).toBeGreaterThan(0);
        expect(combos.length).toBeGreaterThan(0);
        expect(combosByKey.length).toBeGreaterThan(0);
    });
});
