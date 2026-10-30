// Live-captured API fixtures (captured with `capture-fixtures.py` against the running
// backend). Importing them with the contract types is itself a compile-time contract check:
// if a response shape drifts from the TS types, tsc fails.
import type { SecurityObservationResponse } from '@/modules/securityObservations/types/securityObservation.type';
import type { ComboOption } from '@/modules/comboOptions/types/comboOption.type';
import type { Observer } from '@/modules/observers/types/observer.type';
import type { Plant } from '@/modules/plants/types/plant.type';
import type { Sector } from '@/modules/sectors/types/sector.type';
import type { ContractorCompany } from '@/modules/contractorCompanies/types/contractorCompany.type';

import observationJson from '../fixtures/security-observation.response.json';
import observationListJson from '../fixtures/security-observation-list.response.json';
import plantListJson from '../fixtures/plant-list.response.json';
import sectorListJson from '../fixtures/sector-list.response.json';
import companyListJson from '../fixtures/contractor-company-list.response.json';
import observerListJson from '../fixtures/observer-list.response.json';
import comboOptionsJson from '../fixtures/combo-options.response.json';
import comboKeyGestionRiesgoJson from '../fixtures/combo-options-key.response.json';

export const fixtureSecurityObservation: SecurityObservationResponse =
    // JSON imports widen literals (aprReviewed: string); the live wire pins the
    // tri-state literals (ADR-0006), so the contract cast is explicit.
    observationJson as unknown as SecurityObservationResponse;
export const fixtureSecurityObservationList = observationListJson as unknown as {
    count: number;
    data: SecurityObservationResponse[];
};
export const fixturePlants: Plant[] = plantListJson.data;
export const fixtureSectors: Sector[] = sectorListJson.data;
export const fixtureCompanies: ContractorCompany[] = companyListJson.data;
export const fixtureObservers: Observer[] = observerListJson.data;
export const fixtureComboOptions: ComboOption[] = comboOptionsJson;
export const fixtureComboKeyGestionRiesgo: ComboOption[] = comboKeyGestionRiesgoJson;
