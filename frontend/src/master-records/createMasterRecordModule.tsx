/**
 * Master record module — the factory behind a single config interface
 * (GLOSSARY.md: "Master record"; ADR-0003).
 *
 * A reference catalog is a config, never a copy of the previous catalog. The
 * factory produces the six shallow pieces every catalog used to hand-roll —
 * { service, TablePage, ActionCell, CreatePage, UpdatePage, Form } — so the
 * pagination/sorting/filter/delete/mutation wiring lands in exactly one place.
 *
 * Seam discipline: the interface is CRUD-only. Catalog-specific queries
 * (Observers' `lookup`, Combo Options' `getByKey`) compose through the config's
 * `extraService` extension point; catalog quirks are expressed in the schema /
 * `fields` / `toRequest` language, never as factory special cases.
 *
 * The HTTP seam is the existing `apiClient` adapter (live API in prod, the MSW
 * `crudMasterHandlers` factory in tests). Tests render the produced pages and
 * exercise CRUD through that seam.
 */

import { apiClient } from '@/api/apiClient';
import { GenericAlertDialog } from '@/components/GenericAlertDialog';
import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import GenericTable from '@/components/GenericTable';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGridifyParams } from '@/hooks/useGridifyParams';
import extractErrors from '@/utils/extractErrors';
import type { GridifyResponse } from '@/types/gridifyResponse.type';
import type { PaginatedData } from '@/types/table.type';
import type { FormMode } from '@/types/FormMode.type';
import type { GridifyQuery } from '@/utils/gridifyFilter';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { useMemo, useState, type ReactElement } from 'react';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from 'sonner';
import type { ZodType } from 'zod';

// ─── Interface ───────────────────────────────────────────────────────────────

/** CRUD wire contract every Master record shares (verified live per catalog). */
export type MasterRecordService<TRecord, TRequest> = {
    getAllPaginated: (gridifyQuery: GridifyQuery) => Promise<PaginatedData<TRecord>>;
    getAll: () => Promise<TRecord[]>;
    getById: (id: number) => Promise<TRecord>;
    create: (request: TRequest) => Promise<TRecord>;
    update: (id: number, request: TRequest) => Promise<void>;
    deleteById: (id: number) => Promise<void>;
};

/** All screen copy as data. Strings move from the old clone files verbatim. */
export type MasterRecordLabels<TRecord> = {
    /** Grid heading. */
    title: string;
    /** Delete-dialog noun. */
    singular: string;
    /** Grid "new" button label. */
    create: string;
    /** Create-page heading. */
    createTitle: string;
    /** Update-page heading. */
    updateTitle: string;
    toastCreated: string;
    toastUpdated: string;
    toastDeleted: string;
    deleteTitle: string;
    /** Delete dialog body naming the record. */
    deleteDescription: (record: TRecord) => string;
    saveError: string;
    deleteError: string;
};

export type MasterRecordConfig<
    TRecord extends { id: number },
    TRequest,
    TFormValues extends Record<string, unknown>,
    TExtra extends object = Record<never, never>,
> = {
    /** Wire path: GET/POST/PUT/DELETE `<resource>`, `<resource>/<id>`. */
    resource: string;
    /** Route segment under `_layout` (route files stay in `src/routes`). */
    route: string;
    /** react-query key (prefix-invalidated on every mutation). */
    queryKey: string;
    /** Extra legacy query keys to invalidate alongside `queryKey`. */
    extraQueryKeys?: string[];
    /** Display field naming the record in the delete dialog. */
    nameField: keyof TRecord & string;
    /** Grid data source: gridify wire, or the flat-catalogue local table. */
    list: { mode: 'gridify'; order: string } | { mode: 'local'; pageSize: number };
    labels: MasterRecordLabels<TRecord>;
    /** Data columns; the factory appends the actions column. */
    columns: ColumnDef<TRecord>[];
    /** Passed straight into GenericForm. */
    schema: ZodType<TFormValues>;
    /** FieldConfig[], straight into GenericForm. A function for catalogs whose
     *  children depend on the record being edited (Observers' Plants feed). */
    fields:
        | FieldConfig<TFormValues>[]
        | ((initialData: TRecord | undefined) => FieldConfig<TFormValues>[]);
    /** Create-mode form defaults. */
    initialValues: TFormValues;
    /** Update-mode mapping from server record to form values (identity by default). */
    toFormValues?: (record: TRecord) => TFormValues;
    /** Form values to wire request (identity by default). */
    toRequest?: (values: TFormValues) => TRequest;
    /** The one named composition point: catalog-specific queries (CRUD-only factory). */
    extraService?: (
        base: MasterRecordService<TRecord, TRequest>,
    ) => MasterRecordService<TRecord, TRequest> & TExtra;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Route paths are config data, so Link/navigate props are assembled here —
 *  the factory's single typing choke point (route names are literals per config).
 *  The router checks literal `to` unions; inside the factory the path is a
 *  template over the config's route segment, so `to`/`params` cross as `never`. */
function linkProps(props: Record<string, unknown>): { to: never; params?: never } {
    return props as { to: never; params?: never };
}

const DELETE_ACTION_PENDING = 'Eliminando...';

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createMasterRecordModule<
    TRecord extends { id: number },
    TRequest,
    TFormValues extends Record<string, unknown>,
    TExtra extends object = Record<never, never>,
>(config: MasterRecordConfig<TRecord, TRequest, TFormValues, TExtra>): {
    service: MasterRecordService<TRecord, TRequest> & NoInfer<TExtra>;
    TablePage: () => ReactElement;
    ActionCell: (props: { record: TRecord }) => ReactElement;
    Form: (props: { initialData?: TRecord; mode: FormMode }) => ReactElement;
    CreatePage: () => ReactElement;
    UpdatePage: (props: { initialData: TRecord }) => ReactElement;
} {
    const { resource, queryKey, extraQueryKeys = [], labels, list } = config;
    const invalidateKeys = [queryKey, ...extraQueryKeys];
    const localPageSize = list.mode === 'local' ? list.pageSize : 10;

    const baseService: MasterRecordService<TRecord, TRequest> = {
        getAllPaginated: async (gridifyQuery: GridifyQuery): Promise<PaginatedData<TRecord>> => {
            const response = await apiClient.get<GridifyResponse<TRecord>>(resource, {
                params: gridifyQuery,
            });
            return { data: response.data.data, rowCount: response.data.count };
        },

        getAll: async (): Promise<TRecord[]> => {
            if (list.mode === 'local') {
                const response = await apiClient.get<TRecord[]>(resource);
                return response.data;
            }
            const response = await apiClient.get<GridifyResponse<TRecord>>(resource, {
                params: { Page: 1, PageSize: 1000, OrderBy: list.order },
            });
            return response.data.data;
        },

        getById: async (id: number): Promise<TRecord> => {
            const response = await apiClient.get(`/${resource}/${id}`);
            return response.data;
        },

        create: async (request: TRequest): Promise<TRecord> => {
            const response = await apiClient.post(`/${resource}`, request);
            return response.data;
        },

        update: async (id: number, request: TRequest): Promise<void> => {
            await apiClient.put(`/${resource}/${id}`, request);
        },

        deleteById: async (id: number): Promise<void> => {
            await apiClient.delete(`/${resource}/${id}`);
        },
    };

    const service = ((config.extraService ?? ((base: MasterRecordService<TRecord, TRequest>) => base))(
        baseService,
    )) as MasterRecordService<TRecord, TRequest> & NoInfer<TExtra>;

    function ActionCell({ record }: { record: TRecord }) {
        const queryClient = useQueryClient();

        const { mutate, isPending } = useMutation({
            mutationFn: () => service.deleteById(record.id),
            onSuccess: () => {
                toast.success(labels.toastDeleted);
                for (const key of invalidateKeys) {
                    queryClient.invalidateQueries({ queryKey: [key] });
                }
            },
            onError: (error: AxiosError) => {
                extractErrors(error, labels.deleteError);
            },
        });

        return (
            <div className="text-right">
                <GenericAlertDialog
                    title={labels.deleteTitle}
                    description={labels.deleteDescription(record)}
                    actionText={isPending ? DELETE_ACTION_PENDING : 'Eliminar'}
                    onAction={mutate}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir acciones</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link
                                    {...linkProps({
                                        to: `/${config.route}/$id/edit`,
                                        params: { id: String(record.id) },
                                    })}
                                >
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </GenericAlertDialog>
            </div>
        );
    }

    const columns: ColumnDef<TRecord>[] = [
        ...config.columns,
        {
            id: 'actions',
            accessorKey: 'id',
            header: () => <span>Acciones</span>,
            cell: ({ row }) => <ActionCell record={row.original} />,
        },
    ];

    /** Flat catalogue (GET <resource> without gridify): client-side paging and
     *  sorting, exactly as the hand-rolled combo grid worked. */
    function LocalTablePage() {
        const { data, isPending } = useQuery({
            queryKey: [queryKey],
            queryFn: service.getAll,
            placeholderData: keepPreviousData,
        });

        const [pagination, setPagination] = useState<PaginationState>({
            pageIndex: 0,
            pageSize: localPageSize,
        });
        const [sorting, setSorting] = useState<SortingState>([]);

        const sorted = useMemo(() => {
            const all = [...(data ?? [])];
            if (sorting.length > 0) {
                const { id: key, desc } = sorting[0];
                all.sort((a, b) => {
                    const av = a[key as keyof TRecord] as string | number;
                    const bv = b[key as keyof TRecord] as string | number;
                    if (av === bv) return 0;
                    return desc ? (av < bv ? 1 : -1) : av < bv ? -1 : 1;
                });
            }
            return all;
        }, [data, sorting]);

        if (isPending || !data) return <Loading />;

        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-semibold">{labels.title}</h1>

                    <Button variant="default" asChild>
                        <Link {...linkProps({ to: `/${config.route}/new` })}>
                            <Plus className="h-4 w-4" />
                            {labels.create}
                        </Link>
                    </Button>
                </div>

                <div className="flex-1 min-h-0">
                    <GenericTable
                        data={sorted}
                        columns={columns}
                        pagination={pagination}
                        paginationOptions={{
                            onPaginationChange: setPagination,
                            rowCount: sorted.length,
                        }}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        onFilterChange={() => undefined}
                        filterable={false}
                    />
                </div>
            </div>
        );
    }

    function GridifyTablePage() {
        const {
            pagination,
            sorting,
            filter,
            onPaginationChange,
            onSortingChange,
            onFilterChange,
            hasActiveFilters,
            onResetFilters,
            gridifyQuery,
        } = useGridifyParams();

        const { data, isPending } = useQuery({
            queryKey: [queryKey, gridifyQuery],
            queryFn: () => service.getAllPaginated(gridifyQuery),
            placeholderData: keepPreviousData,
        });

        if (isPending || !data) return <Loading />;

        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-semibold">{labels.title}</h1>

                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button onClick={onResetFilters} variant="outline">
                                Limpiar filtros
                            </Button>
                        )}
                        <Button variant="default" asChild>
                            <Link {...linkProps({ to: `/${config.route}/new` })}>
                                <Plus className="h-4 w-4" />
                                {labels.create}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <GenericTable
                        data={data.data}
                        columns={columns}
                        pagination={pagination}
                        paginationOptions={{
                            onPaginationChange,
                            rowCount: data.rowCount,
                        }}
                        filter={filter}
                        onFilterChange={onFilterChange}
                        sorting={sorting}
                        onSortingChange={onSortingChange}
                    />
                </div>
            </div>
        );
    }

    function TablePage() {
        return list.mode === 'local' ? <LocalTablePage /> : <GridifyTablePage />;
    }

    function Form({ initialData, mode }: { initialData?: TRecord; mode: FormMode }) {
        const router = useRouter();
        const queryClient = useQueryClient();

        const { mutate, isPending } = useMutation({
            mutationFn: async (values: TFormValues) => {
                const request = config.toRequest
                    ? config.toRequest(values)
                    : (values as unknown as TRequest);
                if (mode === 'create') {
                    return service.create(request);
                }
                if (mode === 'update' && initialData) {
                    await service.update(initialData.id, request);
                    return null;
                }
                return Promise.reject(new Error('Modo de formulario inválido'));
            },
            onSuccess: () => {
                for (const key of invalidateKeys) {
                    queryClient.invalidateQueries({ queryKey: [key] });
                }
                toast.success(mode === 'create' ? labels.toastCreated : labels.toastUpdated);
                router.invalidate();
                router.navigate({ to: `/${config.route}` } as never);
            },
            onError: (error: AxiosError) => {
                extractErrors(error, labels.saveError);
            },
        });

        const initialFormValues: TFormValues =
            mode === 'update' && initialData
                ? config.toFormValues
                    ? config.toFormValues(initialData)
                    : (initialData as unknown as TFormValues)
                : config.initialValues;

        const fields =
            typeof config.fields === 'function' ? config.fields(initialData) : config.fields;

        return (
            <GenericForm<TFormValues>
                initialData={initialFormValues}
                fields={fields}
                schema={config.schema as never}
                isPending={isPending}
                onSubmit={mutate}
                mode={mode}
            />
        );
    }

    function CreatePage() {
        return (
            <div className="flex flex-col h-full gap-8">
                <h1 className="text-2xl font-semibold text-center">{labels.createTitle}</h1>
                <Form mode="create" />
            </div>
        );
    }

    function UpdatePage({ initialData }: { initialData: TRecord }) {
        return (
            <div className="flex flex-col h-full gap-8">
                <h1 className="text-2xl font-semibold text-center">{labels.updateTitle}</h1>
                <Form mode="update" initialData={initialData} />
            </div>
        );
    }

    return { service, TablePage, ActionCell, CreatePage, UpdatePage, Form };
}
