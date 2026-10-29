/**
 * Contractor Companies smoke — proof that the contractorCompany.* exports
 * consumed across the app (routes, Security Observations form) survive the move
 * to the config interface, with the same wire contract as the deleted clone.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
    contractorCompanyService,
    ContractorCompanyTablePage,
    CreateContractorCompanyPage,
    UpdateContractorCompanyPage,
} from './contractorCompanies.config';
import { renderWithRouter } from '@/test/test-utils';
import { server } from '@/test/msw/server';
import { fixtureCompanies } from '@/test/msw/fixtures';

const api = (path: string) =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5281/api/v1'}${path}`;

describe('contractorCompanies.config smoke', () => {
    it('produces the pages the contractorCompanies routes render', async () => {
        server.use(
            http.get(api('/contractor-companies'), () =>
                HttpResponse.json({ count: fixtureCompanies.length, data: fixtureCompanies }),
            ),
        );
        await renderWithRouter('/contractorCompanies');

        expect(await screen.findByRole('heading', { name: 'Empresas Contratistas' })).toBeInTheDocument();
        expect(ContractorCompanyTablePage).toBeTypeOf('function');
        expect(CreateContractorCompanyPage).toBeTypeOf('function');
        expect(UpdateContractorCompanyPage).toBeTypeOf('function');
    });

    it('getAll asks the wire with the config gridify order (name asc)', async () => {
        let params: URLSearchParams | null = null;
        server.use(
            http.get(api('/contractor-companies'), ({ request }) => {
                params = new URL(request.url).searchParams;
                return HttpResponse.json({ count: 0, data: [] });
            }),
        );

        const records = await contractorCompanyService.getAll();

        expect(records).toStrictEqual([]);
        expect(params!.get('OrderBy')).toBe('name asc');
        expect(params!.get('Page')).toBe('1');
        expect(params!.get('PageSize')).toBe('1000');
    });
});
