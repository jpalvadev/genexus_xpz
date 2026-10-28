import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, renderWithRouter, screen, waitFor, fireEvent, createTestQueryClient } from '@/test/test-utils';
import GenericTable from './GenericTable';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { validMockJwt } from '@/test/msw/handlers';
import { authService } from '@/modules/auth/services/auth.service';

interface TestItem extends Record<string, unknown> {
    id: number;
    name: string;
    status: string;
}

const testColumns: ColumnDef<TestItem>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
        enableSorting: true,
        enableColumnFilter: true,
        meta: { filterKey: 'name', filterVariant: 'string' },
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'status',
        header: 'Estado',
        enableSorting: true,
        cell: (info) => info.getValue(),
    },
];

describe('GenericTable component', () => {
    const defaultPagination: PaginationState = { pageIndex: 0, pageSize: 10 };
    const defaultSorting: SortingState = [];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renderiza encabezados y filas de datos correctamente', () => {
        const testData: TestItem[] = [
            { id: 1, name: 'Sensor Alfa', status: 'Activo' },
            { id: 2, name: 'Sensor Beta', status: 'Inactivo' },
        ];

        renderWithProviders(
            <GenericTable
                data={testData}
                columns={testColumns}
                pagination={defaultPagination}
                paginationOptions={{
                    rowCount: 2,
                    onPaginationChange: vi.fn(),
                }}
                sorting={defaultSorting}
                onSortingChange={vi.fn()}
                onFilterChange={vi.fn()}
            />
        );

        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Estado')).toBeInTheDocument();
        expect(screen.getByText('Sensor Alfa')).toBeInTheDocument();
        expect(screen.getByText('Sensor Beta')).toBeInTheDocument();
        expect(screen.getByText('2 registros encontrados. Mostrar')).toBeInTheDocument();
    });

    it('muestra "No se encontraron resultados." cuando la data está vacía', () => {
        renderWithProviders(
            <GenericTable
                data={[]}
                columns={testColumns}
                pagination={defaultPagination}
                paginationOptions={{
                    rowCount: 0,
                    onPaginationChange: vi.fn(),
                }}
                sorting={defaultSorting}
                onSortingChange={vi.fn()}
                onFilterChange={vi.fn()}
            />
        );

        expect(screen.getByText('No se encontraron resultados.')).toBeInTheDocument();
        expect(screen.getByText('0 registros encontrados. Mostrar')).toBeInTheDocument();
    });

    it('llama a onSortingChange al hacer clic en el encabezado de una columna sortable', async () => {
        const onSortingChangeMock = vi.fn();
        const testData: TestItem[] = [{ id: 1, name: 'Sensor Alfa', status: 'Activo' }];

        const { user } = renderWithProviders(
            <GenericTable
                data={testData}
                columns={testColumns}
                pagination={defaultPagination}
                paginationOptions={{
                    rowCount: 1,
                    onPaginationChange: vi.fn(),
                }}
                sorting={defaultSorting}
                onSortingChange={onSortingChangeMock}
                onFilterChange={vi.fn()}
            />
        );

        // El header de 'Nombre' contiene el toggle de ordenamiento
        const sortIconContainer = screen.getByText('Nombre').parentElement?.querySelector('.cursor-pointer');
        expect(sortIconContainer).toBeInTheDocument();

        await user.click(sortIconContainer!);

        expect(onSortingChangeMock).toHaveBeenCalled();
    });

    it('llama a onPaginationChange al hacer clic en avanzar página', async () => {
        const onPaginationChangeMock = vi.fn();
        const testData: TestItem[] = [{ id: 1, name: 'Sensor Alfa', status: 'Activo' }];

        // 30 registros con pageSize 10: hay 3 páginas
        const { user } = renderWithProviders(
            <GenericTable
                data={testData}
                columns={testColumns}
                pagination={defaultPagination}
                paginationOptions={{
                    rowCount: 30,
                    onPaginationChange: onPaginationChangeMock,
                }}
                sorting={defaultSorting}
                onSortingChange={vi.fn()}
                onFilterChange={vi.fn()}
            />
        );

        const buttons = screen.getAllByRole('button');
        const enabledButtons = buttons.filter((btn) => !btn.hasAttribute('disabled'));
        expect(enabledButtons.length).toBeGreaterThan(0);

        await user.click(enabledButtons[0]);
        expect(onPaginationChangeMock).toHaveBeenCalled();
    });

    it('abre el popover de filtro y llama a onFilterChange con debounce al escribir', async () => {
        const onFilterChangeMock = vi.fn();
        const testData: TestItem[] = [{ id: 1, name: 'Sensor Alfa', status: 'Activo' }];

        const { user } = renderWithProviders(
            <GenericTable
                data={testData}
                columns={testColumns}
                pagination={defaultPagination}
                paginationOptions={{
                    rowCount: 1,
                    onPaginationChange: vi.fn(),
                }}
                sorting={defaultSorting}
                onSortingChange={vi.fn()}
                onFilterChange={onFilterChangeMock}
            />
        );

        // Buscamos el ícono del embudo (FunnelIcon)
        const funnel = document.querySelector('svg.lucide-funnel');
        expect(funnel).toBeInTheDocument();

        await user.click(funnel!);

        // Esperamos a que se abra el popover con el input
        const filterInput = await screen.findByPlaceholderText('Filtrar...');
        expect(filterInput).toBeInTheDocument();

        // Tipeamos en el input con debounce
        fireEvent.change(filterInput, { target: { value: 'Alfa' } });

        // Esperamos que pase el tiempo de debounce (200ms)
        await waitFor(() => {
            expect(onFilterChangeMock).toHaveBeenCalledWith(
                'name',
                'Alfa',
                expect.objectContaining({ variant: 'string' })
            );
        }, { timeout: 1000 });
    });

    describe('integración con MSW (DevicesTablePage)', () => {
        it('muestra los registros obtenidos de MSW en la tabla real', async () => {
            authService.saveToken(validMockJwt);
            authService.savePermissions([
                { module: 'general', role: 'admin', scope: null },
                { module: 'device', role: 'admin', scope: null },
            ]);

            server.use(
                http.get('*/api/v1/devices', () => {
                    return HttpResponse.json(
                        {
                            data: [
                                {
                                    id: 101,
                                    name: 'Termómetro Central',
                                    minTemperature: 15,
                                    maxTemperature: 28,
                                    minHumidity: 40,
                                    maxHumidity: 80,
                                    sleepSeconds: 300,
                                    recipients: [],
                                    sector: { id: 1, name: 'Sector Producción' },
                                },
                            ],
                            count: 1,
                        },
                        { headers: { 'total-records-count': '1' } }
                    );
                })
            );

            const queryClient = createTestQueryClient();
            queryClient.setQueryData(['devices', { Page: 1, PageSize: 10 }], {
                data: [
                    {
                        id: 101,
                        name: 'Termómetro Central',
                        minTemperature: 15,
                        maxTemperature: 28,
                        minHumidity: 40,
                        maxHumidity: 80,
                        sleepSeconds: 300,
                        recipients: [],
                        sector: { id: 1, name: 'Sector Producción' },
                    },
                ],
                rowCount: 1,
            });

            await renderWithRouter('/devices', {
                queryClient,
                user: {
                    roles: ['admin'],
                    permissions: [
                        { module: 'general', role: 'admin', scope: null },
                        { module: 'device', role: 'admin', scope: null },
                        { module: 'device', role: 'reports', scope: null },
                    ],
                },
            });

            expect(await screen.findByText('Termómetro Central')).toBeInTheDocument();
            expect(screen.getByText('Sector Producción')).toBeInTheDocument();
            expect(screen.getByText('1 registros encontrados. Mostrar')).toBeInTheDocument();
        });
    });

    describe('props sortable y filterable opcionales y columnas con id', () => {
        it('renderiza el título de columna incluso cuando no es sortable (usando id)', () => {
            const columnsWithId: ColumnDef<TestItem>[] = [
                {
                    id: 'customDescription',
                    header: () => <span>Descripción Personalizada</span>,
                    enableSorting: false,
                    cell: () => 'Detalle',
                },
                {
                    id: 'actions',
                    header: '',
                    enableSorting: false,
                    cell: () => 'Acciones',
                },
            ];
            const testData: TestItem[] = [{ id: 1, name: 'Sensor 1', status: 'Activo' }];

            renderWithProviders(
                <GenericTable<TestItem>
                    data={testData}
                    columns={columnsWithId}
                    pagination={defaultPagination}
                    paginationOptions={{
                        rowCount: 1,
                        onPaginationChange: vi.fn(),
                    }}
                    sorting={defaultSorting}
                    onSortingChange={vi.fn()}
                    onFilterChange={vi.fn()}
                />
            );

            // Debe mostrar el título de la columna sin reemplazarlo por un icono
            expect(screen.getByText('Descripción Personalizada')).toBeInTheDocument();
        });

        it('deshabilita iconos de ordenamiento y filtrado si sortable=false y filterable=false', () => {
            const testData: TestItem[] = [{ id: 1, name: 'Sensor 1', status: 'Activo' }];

            renderWithProviders(
                <GenericTable<TestItem>
                    data={testData}
                    columns={testColumns}
                    pagination={defaultPagination}
                    paginationOptions={{
                        rowCount: 1,
                        onPaginationChange: vi.fn(),
                    }}
                    sorting={defaultSorting}
                    onSortingChange={vi.fn()}
                    onFilterChange={vi.fn()}
                    sortable={false}
                    filterable={false}
                />
            );

            expect(screen.getByText('Nombre')).toBeInTheDocument();
            // No debe haber triggers de ordenamiento ni filtrado en la columna 'Nombre'
            const nombreHeader = screen.getByText('Nombre').parentElement;
            expect(nombreHeader?.querySelector('.cursor-pointer')).toBeNull();
        });
    });
});

