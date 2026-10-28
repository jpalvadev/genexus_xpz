import { http, HttpResponse } from 'msw';
import {
    fixtureComboOptions,
    fixtureCompanies,
    fixtureObservers,
    fixturePlants,
    fixtureSectors,
    fixtureSecurityObservation,
    fixtureSecurityObservationList,
} from './fixtures';

const api = (path: string) =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5281/api/v1'}${path}`;

export const handlers = [
    // Devices
    http.get('*/api/v1/devices', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    http.get('*/api/v1/devices/charts', () => {
        return HttpResponse.json([]);
    }),

    // Readings
    http.get('*/api/v1/readings', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    // Expirations
    http.get('*/api/v1/expirations', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    // Users
    http.get('*/api/v1/users', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    // Persons
    http.get('*/api/v1/persons', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    // Sectors
    http.get('*/api/v1/sectors', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    // Equipment items & Maintenances
    http.get('*/api/v1/equipment-items', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    http.get('*/api/v1/equipment-maintenances', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),

    // Forms
    http.get('*/api/v1/form-definitions', () => {
        return HttpResponse.json(
            { data: [], count: 0 },
            { headers: { 'total-records-count': '0' } }
        );
    }),
    // Security Observations (SHYMA) + catálogos maestros — contratos vivientes.
    http.get(api('/security-observations'), () => HttpResponse.json(fixtureSecurityObservationList)),
    http.get(api('/security-observations/export-excel'), () =>
        new HttpResponse(new Blob(['xlsx-fake']).stream(), {
            headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        })),
    http.get(api('/security-observations/:id'), ({ params }) =>
        HttpResponse.json({ ...fixtureSecurityObservation, id: Number(params.id) })),
    http.post(api('/security-observations'), async ({ request }) =>
        HttpResponse.json(
            { id: 99, createdOn: new Date().toISOString(), ...(await request.json() as object) },
            { status: 201 },
        )),
    http.put(api('/security-observations/:id'), async ({ request, params }) =>
        HttpResponse.json({ ...fixtureSecurityObservation, id: Number(params.id), ...(await request.json() as object) })),
    http.delete(api('/security-observations/:id'), () => new HttpResponse(null, { status: 204 })),

    http.get(api('/observers/lookup'), () =>
        HttpResponse.json({ data: fixtureObservers, rowCount: fixtureObservers.length })),
    http.get(api('/observers'), () => HttpResponse.json({ count: fixtureObservers.length, data: fixtureObservers })),
    http.get(api('/observers/:id'), ({ params }) =>
        HttpResponse.json(fixtureObservers.find((o) => o.id === Number(params.id)) ?? fixtureObservers[0])),
    http.post(api('/observers'), async ({ request }) =>
        HttpResponse.json({ id: 99, ...(await request.json() as object) }, { status: 201 })),
    http.put(api('/observers/:id'), async ({ request, params }) =>
        HttpResponse.json({ id: Number(params.id), ...(await request.json() as object) })),
    http.delete(api('/observers/:id'), () => new HttpResponse(null, { status: 204 })),

    http.get(api('/plants'), () => HttpResponse.json({ count: fixturePlants.length, data: fixturePlants })),
    http.get(api('/plants/:id'), ({ params }) =>
        HttpResponse.json(fixturePlants.find((p) => p.id === Number(params.id)) ?? fixturePlants[0])),
    http.post(api('/plants'), async ({ request }) =>
        HttpResponse.json({ id: 99, ...(await request.json() as object) }, { status: 201 })),
    http.put(api('/plants/:id'), async ({ request, params }) =>
        HttpResponse.json({ id: Number(params.id), ...(await request.json() as object) })),
    http.delete(api('/plants/:id'), () => new HttpResponse(null, { status: 204 })),

    http.get(api('/sectors'), () => HttpResponse.json({ count: fixtureSectors.length, data: fixtureSectors })),
    http.get(api('/sectors/:id'), ({ params }) =>
        HttpResponse.json(fixtureSectors.find((s) => s.id === Number(params.id)) ?? fixtureSectors[0])),
    http.post(api('/sectors'), async ({ request }) =>
        HttpResponse.json({ id: 99, ...(await request.json() as object) }, { status: 201 })),
    http.put(api('/sectors/:id'), async ({ request, params }) =>
        HttpResponse.json({ id: Number(params.id), ...(await request.json() as object) })),
    http.delete(api('/sectors/:id'), () => new HttpResponse(null, { status: 204 })),

    http.get(api('/contractor-companies'), () =>
        HttpResponse.json({ count: fixtureCompanies.length, data: fixtureCompanies })),
    http.get(api('/contractor-companies/:id'), ({ params }) =>
        HttpResponse.json(fixtureCompanies.find((c) => c.id === Number(params.id)) ?? fixtureCompanies[0])),
    http.post(api('/contractor-companies'), async ({ request }) =>
        HttpResponse.json({ id: 99, ...(await request.json() as object) }, { status: 201 })),
    http.put(api('/contractor-companies/:id'), async ({ request, params }) =>
        HttpResponse.json({ id: Number(params.id), ...(await request.json() as object) })),
    http.delete(api('/contractor-companies/:id'), () => new HttpResponse(null, { status: 204 })),

    http.get(api('/combo-options/keys'), () => HttpResponse.json([])),
    http.get(api('/combo-options/keys/:key'), () => HttpResponse.json([])),
    http.get(api('/combo-options/:comboKey'), ({ params }) =>
        HttpResponse.json(fixtureComboOptions.filter((c) => c.comboKey === params.comboKey))),
    http.get(api('/combo-options'), () => HttpResponse.json(fixtureComboOptions)),
    http.post(api('/combo-options'), async ({ request }) =>
        HttpResponse.json({ id: 99, order: 0, ...(await request.json() as object) }, { status: 201 })),
    http.put(api('/combo-options/:id'), async ({ request, params }) =>
        HttpResponse.json({ id: Number(params.id), ...(await request.json() as object) })),
    http.delete(api('/combo-options/:id'), () => new HttpResponse(null, { status: 204 })),
];
