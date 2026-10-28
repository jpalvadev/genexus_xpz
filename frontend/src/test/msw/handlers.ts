import { http, HttpResponse } from 'msw';

export const validMockJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAaXRyaW9uLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IiwibGFzdF9uYW1lIjoiVXNlciIsInJvbGVzIjpbImFkbWluIl19.signature';

export const defaultMockUser = {
    token: validMockJwt,
    email: 'test@itrion.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['admin'],
    permissions: [
        { module: 'general', role: 'admin', scope: null },
    ],
};

export const handlers = [
    // Auth

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
];

