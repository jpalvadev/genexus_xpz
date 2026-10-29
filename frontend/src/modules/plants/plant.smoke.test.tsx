/**
 * Plants smoke — proof that the plant.* exports consumed across the app
 * (routes, Security Observations form) survive the move to the config
 * interface, with the same wire contract as the deleted clone.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { plantService, PlantTablePage, CreatePlantPage, UpdatePlantPage } from './plant.config';
import { renderWithRouter } from '@/test/test-utils';
import { server } from '@/test/msw/server';
import { fixturePlants } from '@/test/msw/fixtures';

const api = (path: string) =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5281/api/v1'}${path}`;

describe('plant.config smoke', () => {
    it('produces the pages the plant routes render', async () => {
        server.use(
            http.get(api('/plants'), () =>
                HttpResponse.json({ count: fixturePlants.length, data: fixturePlants }),
            ),
        );
        await renderWithRouter('/plants');

        expect(await screen.findByRole('heading', { name: 'Plantas' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Nueva Planta/ })).toBeInTheDocument();
        expect(PlantTablePage).toBeTypeOf('function');
        expect(CreatePlantPage).toBeTypeOf('function');
        expect(UpdatePlantPage).toBeTypeOf('function');
    });

    it('getAll asks the wire with the config gridify order (name asc)', async () => {
        let params: URLSearchParams | null = null;
        server.use(
            http.get(api('/plants'), ({ request }) => {
                params = new URL(request.url).searchParams;
                return HttpResponse.json({ count: 0, data: [] });
            }),
        );

        const records = await plantService.getAll();

        expect(records).toStrictEqual([]);
        expect(params!.get('OrderBy')).toBe('name asc');
        expect(params!.get('Page')).toBe('1');
        expect(params!.get('PageSize')).toBe('1000');
    });
});
