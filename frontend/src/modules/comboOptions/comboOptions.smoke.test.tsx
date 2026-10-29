/**
 * Combo Options smoke — proof that the comboOption.* exports consumed across
 * the app (routes, Security Observations form dropdowns) survive the move to
 * the config interface, with the same flat-catalogue wire as the deleted clone.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
    comboOptionService,
    ComboOptionTablePage,
    CreateComboOptionPage,
    UpdateComboOptionPage,
} from './comboOptions.config';
import { renderWithRouter } from '@/test/test-utils';
import { server } from '@/test/msw/server';
import { fixtureComboOptions } from '@/test/msw/fixtures';

const api = (path: string) =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5281/api/v1'}${path}`;

describe('comboOptions.config smoke', () => {
    it('produces the pages the comboOptions routes render', async () => {
        await renderWithRouter('/comboOptions');

        expect(await screen.findByRole('heading', { name: 'Opciones de Combo' })).toBeInTheDocument();
        expect(ComboOptionTablePage).toBeTypeOf('function');
        expect(CreateComboOptionPage).toBeTypeOf('function');
        expect(UpdateComboOptionPage).toBeTypeOf('function');
    });

    it('getAll asks the flat wire without gridify params, getByKey asks the comboKey path', async () => {
        let listParams: URLSearchParams | null = null;
        let keyUrl = '';
        server.use(
            http.get(api('/combo-options'), ({ request }) => {
                listParams = new URL(request.url).searchParams;
                return HttpResponse.json(fixtureComboOptions);
            }),
            http.get(api('/combo-options/:comboKey'), ({ request }) => {
                keyUrl = new URL(request.url).pathname;
                return HttpResponse.json([]);
            }),
        );

        const all = await comboOptionService.getAll();
        const keys = await comboOptionService.getByKey('gestionRiesgo');

        expect(all).toStrictEqual(fixtureComboOptions);
        expect(listParams!.get('Page')).toBeNull();
        expect(listParams!.get('OrderBy')).toBeNull();
        expect(keys).toStrictEqual([]);
        expect(keyUrl).toBe('/api/v1/combo-options/gestionRiesgo');
    });
});
