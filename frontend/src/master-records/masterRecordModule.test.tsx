/**
 * Master record module — deep test through the single production instance
 * wired at ticket 01 (Sectors). Everything a hand-rolled catalog used to
 * guarantee (gridify contract, delete naming, mutation toasts, client-side
 * flat catalogue) is exercised against the MSW seam via the config interface.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
} from '@tanstack/react-router';
import { http, HttpResponse, type DefaultBodyType } from 'msw';
import { toast } from 'sonner';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
import type { Mock } from 'vitest';

import { createMasterRecordModule } from './createMasterRecordModule';
import {
    renderWithProviders,
    renderWithRouter,
    userEvent,
} from '@/test/test-utils';
import { server } from '@/test/msw/server';
import { fixtureSectors } from '@/test/msw/fixtures';

const api = (path: string) =>
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5281/api/v1'}${path}`;

/** Points every request at a spy that records the URLs the factory produces. */
function spySectorsGridify() {
    const urls: URL[] = [];
    server.use(
        http.get(api('/sectors'), ({ request }) => {
            urls.push(new URL(request.url));
            return HttpResponse.json({
                count: fixtureSectors.length,
                data: fixtureSectors,
            });
        }),
    );
    return urls;
}

function spySectorsMutations() {
    const posts: DefaultBodyType[] = [];
    const puts: { url: URL; body: DefaultBodyType }[] = [];
    const deletes: URL[] = [];
    server.use(
        http.post(api('/sectors'), async ({ request }) => {
            posts.push(await request.json());
            return HttpResponse.json({ id: 99, ...(posts.at(-1) as object) }, { status: 201 });        }),
        http.put(api('/sectors/:id'), async ({ request }) => {
            puts.push({ url: new URL(request.url), body: await request.json() });
            return HttpResponse.json({ id: 1 });
        }),
        http.delete(api('/sectors/:id'), ({ request }) => {
            deletes.push(new URL(request.url));
            return new HttpResponse(null, { status: 204 });
        }),
    );
    return { posts, puts, deletes };
}

async function openRowActions(user: ReturnType<typeof userEvent.setup>) {
    const triggers = screen.getAllByRole('button', { name: 'Abrir acciones' });
    await user.click(triggers[0]);
}

describe('Master record module — gridify catalog (Sectors pilot)', () => {
    let successSpy: Mock;

    beforeEach(() => {
        successSpy = vi.spyOn(toast, 'success');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the grid from the config copy', async () => {
        spySectorsGridify();
        await renderWithRouter('/sectors');

        expect(await screen.findByRole('heading', { name: 'Sectores' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Nuevo Sector/ })).toBeInTheDocument();
        expect(screen.getByText('Seguridad Preventiva')).toBeInTheDocument();
    });

    it('requests page 1 with the gridify defaults (no sort set yet)', async () => {
        const urls = spySectorsGridify();
        await renderWithRouter('/sectors');

        await screen.findByRole('heading', { name: 'Sectores' });
        const params = urls.at(-1)!.searchParams;
        expect(params.get('Page')).toBe('1');
        expect(params.get('PageSize')).toBe('10');
        expect(params.get('OrderBy')).toBeNull();
    });

    it('sort toggle cycles ascending then descending, re-requesting each time', async () => {
        const urls = spySectorsGridify();
        const { user } = await renderWithRouter('/sectors');
        await screen.findByRole('heading', { name: 'Sectores' });

        const toggle = screen.getByText('Nombre').parentElement?.querySelector('.cursor-pointer');
        expect(toggle).not.toBeNull();
        await user.click(toggle as Element);

        await waitFor(() => {
            expect(urls.at(-1)!.searchParams.get('OrderBy')).toBe('name asc');
        });

        await user.click(toggle as Element);
        await waitFor(() => {
            expect(urls.at(-1)!.searchParams.get('OrderBy')).toBe('name desc');
        });
    });

    it('filter in the URL reaches the gridify request and offers the reset button', async () => {
        const urls = spySectorsGridify();
        await renderWithRouter('/sectors?filter=name%3D*Security*');
        await screen.findByRole('heading', { name: 'Sectores' });

        const params = urls.at(-1)!.searchParams;
        expect(params.get('Filter')).toBe('name=*Security*');
        expect(params.get('Page')).toBe('1');

        // Factory's hasActiveFilters wiring: reset button appears and clears the filter.
        const reset = screen.getByRole('button', { name: 'Limpiar filtros' });
        const before = urls.length;
        await userEvent.click(reset);
        await waitFor(() => expect(urls.length).toBeGreaterThan(before));
        expect(urls.at(-1)!.searchParams.get('Filter')).toBeNull();
    });

    it('URL pagination advances the gridify page param', async () => {
        const urls = spySectorsGridify();
        await renderWithRouter('/sectors?pageIndex=1&pageSize=10');
        await screen.findByRole('heading', { name: 'Sectores' });

        const params = urls.at(-1)!.searchParams;
        expect(params.get('Page')).toBe('2');
        expect(params.get('PageSize')).toBe('10');
    });

    it('create posts the toRequest body, toasts and returns to the list', async () => {
        spySectorsGridify();
        const { posts } = spySectorsMutations();
        const { user } = await renderWithRouter('/sectors/new');

        expect(await screen.findByRole('heading', { name: 'Nuevo Sector' })).toBeInTheDocument();

        const nameInput = screen.getByLabelText('Nombre');
        await user.click(nameInput);
        await user.paste(' Sector de Prueba ');

        fireEvent.submit(screen.getByRole('button', { name: 'Guardar' }).closest('form')!);

        await waitFor(() => expect(posts).toHaveLength(1));
        expect(posts[0]).toStrictEqual({ name: 'Sector de Prueba' }); // toRequest trims
        expect(successSpy).toHaveBeenCalledWith('Sector creado');
        expect(await screen.findByRole('heading', { name: 'Sectores' })).toBeInTheDocument();
    });

    it('update prefills via toFormValues, PUTs the record id, toasts and returns', async () => {
        spySectorsGridify();
        const { puts } = spySectorsMutations();
        const { user } = await renderWithRouter('/sectors/2/edit');

        expect(
            await screen.findByRole('heading', { name: 'Actualización de Sector' }),
        ).toBeInTheDocument();
        const nameInput = screen.getByLabelText('Nombre') as HTMLInputElement;
        expect(nameInput.value).toBe('Control de Acceso'); // toFormValues mapping

        await user.click(nameInput);
        await user.clear(nameInput);
        await user.paste('Control de Acceso');
        fireEvent.submit(screen.getByRole('button', { name: 'Guardar' }).closest('form')!);

        await waitFor(() => expect(puts).toHaveLength(1));
        expect(puts[0].url.pathname).toBe('/api/v1/sectors/2');
        expect(puts[0].body).toStrictEqual({ name: 'Control de Acceso' });
        expect(successSpy).toHaveBeenCalledWith('Sector actualizado');
        expect(await screen.findByRole('heading', { name: 'Sectores' })).toBeInTheDocument();
    });

    it('delete names the record in the dialog, DELETEs, toasts and refetches', async () => {
        const urls = spySectorsGridify();
        const { deletes } = spySectorsMutations();
        const { user } = await renderWithRouter('/sectors');
        await screen.findByRole('heading', { name: 'Sectores' });

        await openRowActions(user);
        await user.click(await screen.findByRole('menuitem', { name: /Eliminar/ }));

        const dialog = await screen.findByRole('alertdialog');
        expect(dialog).toHaveTextContent('¿Eliminar Sector?');
        // deleteDescription names the exact record rendered in the row.
        expect(dialog).toHaveTextContent(
            'Estás a punto de eliminar el registro #1 (Seguridad Preventiva).',
        );

        const initialFetches = urls.length;
        await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

        expect(successSpy).toHaveBeenCalledWith('sector eliminado/a');
        await waitFor(() => expect(deletes).toHaveLength(1));
        expect(deletes[0].pathname).toBe('/api/v1/sectors/1');
        await waitFor(() => expect(urls.length).toBeGreaterThan(initialFetches)); // invalidated
    });
});

// ─── Local (flat catalogue) mode — parity with the hand-rolled combo grid ────

type TestItem = { id: number; label: string };

const localColumns: ColumnDef<TestItem>[] = [
    {
        id: 'label',
        accessorKey: 'label',
        header: () => <span>Label</span>,
    },
];

const localModule = createMasterRecordModule<TestItem, { label: string }, { label: string }>({
    resource: 'test-items',
    route: 'root-test',
    queryKey: 'testItems',
    nameField: 'label',
    list: { mode: 'local', pageSize: 10 },
    labels: {
        title: 'Ítems de Prueba',
        singular: 'ítem',
        create: 'Nuevo Ítem',
        createTitle: 'Nuevo Ítem',
        updateTitle: 'Actualización de Ítem',
        toastCreated: 'Ítem creado',
        toastUpdated: 'Ítem actualizado',
        toastDeleted: 'ítem eliminado',
        deleteTitle: '¿Eliminar Ítem?',
        deleteDescription: (item) => `Estás a punto de eliminar ${item.label}.`,
        saveError: 'error',
        deleteError: 'error',
    },
    columns: localColumns,
    schema: z.object({ label: z.string().min(1) }),
    fields: [{ name: 'label', label: 'Label', formField: 'input', colSpan: 12 }],
    initialValues: { label: '' },
});

function renderLocalTable() {
    const root = createRootRoute();
    const list = createRoute({
        getParentRoute: () => root,
        path: '/',
        component: localModule.TablePage,
    });
    const create = createRoute({
        getParentRoute: () => root,
        path: '/root-test/new',
        component: () => <div />,
    });
    const router = createRouter({
        routeTree: root.addChildren([list, create]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    return renderWithProviders(<RouterProvider router={router} />);
}

function spyLocalFetch() {
    const items: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        label: `item-${String(i + 1).padStart(2, '0')}`,
    }));
    const calls = vi.fn();
    server.use(
        http.get(api('/test-items'), () => {
            calls();
            return HttpResponse.json(items);
        }),
    );
    return { calls };
}

describe('Master record module — local flat catalogue (combo-style)', () => {
    it('fetches once, then pages entirely client-side', async () => {
        const { calls } = spyLocalFetch();
        const { user } = renderLocalTable();

        expect(await screen.findByRole('heading', { name: 'Ítems de Prueba' })).toBeInTheDocument();
        expect(calls).toHaveBeenCalledTimes(1);
        // The flat catalogue renders the full array; paging never re-hits the server.
        expect(screen.getByText('item-01')).toBeInTheDocument();

        const pageInput = document.querySelector('input[type="number"]') as HTMLInputElement;
        expect(pageInput.value).toBe('1');

        const next = document.querySelector('svg.lucide-chevron-right')?.closest('button');
        await user.click(next as HTMLButtonElement);

        await waitFor(() => expect(pageInput.value).toBe('2'));
        expect(screen.getByText('item-11')).toBeInTheDocument();
        expect(calls).toHaveBeenCalledTimes(1); // no refetch to page
    });

    it('sorts client-side without refetching and exposes no filter funnel', async () => {
        const { calls } = spyLocalFetch();
        const { user } = renderLocalTable();

        await screen.findByRole('heading', { name: 'Ítems de Prueba' });
        expect(document.querySelector('svg.lucide-funnel')).toBeNull(); // filterable={false}

        const toggle = screen.getByText('Label').parentElement?.querySelector('.cursor-pointer');
        await user.click(toggle as Element);

        await waitFor(() => expect(screen.getByText('item-25')).toBeInTheDocument());
        expect(calls).toHaveBeenCalledTimes(1);
    });
});
