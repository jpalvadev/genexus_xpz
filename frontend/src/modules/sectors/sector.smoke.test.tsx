/**
 * Sectors smoke — proof that the sector.* exports consumed across the app
 * (routes, Security Observations form) survive the move to the config
 * interface, with the same wire contract as the deleted clone.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
    sectorService,
    SectorTablePage,
    CreateSectorPage,
    UpdateSectorPage,
} from './sector.config';
import { renderWithRouter } from '@/test/test-utils';
import { server } from '@/test/msw/server';
import { fixtureSectors } from '@/test/msw/fixtures';

const api = (path: string) =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5281/api/v1'}${path}`;

describe('sector.config smoke', () => {
    it('produces the pages the sector routes render', async () => {
        server.use(
            http.get(api('/sectors'), () =>
                HttpResponse.json({ count: fixtureSectors.length, data: fixtureSectors }),
            ),
        );
        await renderWithRouter('/sectors');

        expect(await screen.findByRole('heading', { name: 'Sectores' })).toBeInTheDocument();
        expect(SectorTablePage).toBeTypeOf('function');
        expect(CreateSectorPage).toBeTypeOf('function');
        expect(UpdateSectorPage).toBeTypeOf('function');
    });

    it('getAll asks the wire with the config gridify order (name asc)', async () => {
        let params: URLSearchParams | null = null;
        server.use(
            http.get(api('/sectors'), ({ request }) => {
                params = new URL(request.url).searchParams;
                return HttpResponse.json({ count: 0, data: [] });
            }),
        );

        const records = await sectorService.getAll();

        expect(records).toStrictEqual([]);
        expect(params!.get('OrderBy')).toBe('name asc');
        expect(params!.get('Page')).toBe('1');
        expect(params!.get('PageSize')).toBe('1000');
    });
});
