/**
 * Observers smoke — proof that the observerService.* exports consumed across
 * the app (routes, Security Observations picker) survive the move to the
 * config interface, with the same wire contract as the deleted clone.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
    observerService,
    ObserverTablePage,
    CreateObserverPage,
    UpdateObserverPage,
} from './observers.config';
import { renderWithRouter } from '@/test/test-utils';
import { server } from '@/test/msw/server';
import { fixtureObservers } from '@/test/msw/fixtures';

const api = (path: string) =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5281/api/v1'}${path}`;

describe('observers.config smoke', () => {
    it('produces the pages the observers routes render', async () => {
        server.use(
            http.get(api('/observers'), () =>
                HttpResponse.json({ count: fixtureObservers.length, data: fixtureObservers }),
            ),
        );
        await renderWithRouter('/observers');

        expect(await screen.findByRole('heading', { name: 'Observadores' })).toBeInTheDocument();
        expect(ObserverTablePage).toBeTypeOf('function');
        expect(CreateObserverPage).toBeTypeOf('function');
        expect(UpdateObserverPage).toBeTypeOf('function');
    });

    it('getAll asks the wire with the config gridify order (fullName asc)', async () => {
        let params: URLSearchParams | null = null;
        server.use(
            http.get(api('/observers'), ({ request }) => {
                params = new URL(request.url).searchParams;
                return HttpResponse.json({ count: 0, data: [] });
            }),
        );

        const records = await observerService.getAll();

        expect(records).toStrictEqual([]);
        expect(params!.get('OrderBy')).toBe('fullName asc');
        expect(params!.get('Page')).toBe('1');
        expect(params!.get('PageSize')).toBe('1000');
    });

    it('lookup keeps the picker contract: active-only filter, fullName search, 30-page default', async () => {
        let params: URLSearchParams | null = null;
        server.use(
            http.get(api('/observers'), ({ request }) => {
                params = new URL(request.url).searchParams;
                return HttpResponse.json({ count: 1, data: [fixtureObservers[0]] });
            }),
        );

        const page = await observerService.lookup({ fullName: 'María', pageSize: '30' });

        expect(page.data).toStrictEqual([fixtureObservers[0]]);
        expect(params!.get('Filter')).toBe('active=true,fullName=*María');
        expect(params!.get('PageSize')).toBe('30');
        expect(params!.get('OrderBy')).toBe('fullName asc');
    });
});
