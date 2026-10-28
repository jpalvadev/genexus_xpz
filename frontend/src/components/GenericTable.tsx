import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    type OnChangeFn,
    type PaginationOptions,
    type PaginationState,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';

import {
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
    Table,
} from './ui/table';
import { Button } from './ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { SelectGroup } from '@radix-ui/react-select';
import { Input } from './ui/input';
import {
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    FunnelIcon,
    Settings2Icon,
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DebouncedInput } from './DebouncedInput';

import {
    getFilterValue,
    type FilterVariant,
    type Operator,
} from '@/utils/gridifyFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { cn } from '@/lib/utils';

export const DEFAULT_PAGE_INDEX = 0;
export const DEFAULT_PAGE_SIZE = 10;

type Props<T extends Record<string, unknown>> = {
    data: T[];
    columns: ColumnDef<T>[];
    pagination: PaginationState;
    paginationOptions: Pick<
        PaginationOptions,
        'onPaginationChange' | 'rowCount'
    >;

    /** Filter string crudo de Gridify, ej: "name=*juan*,status=active" */
    filter?: string;
    /**
     * Callback unificado para cambios de filtro.
     * field: nombre del campo en el filter string
     * value: nuevo valor (vacío = eliminar)
     */
    onFilterChange: (
        field: string,
        value: string,
        options?: { variant?: FilterVariant; operator?: Operator },
    ) => void;

    sorting: SortingState;
    onSortingChange: OnChangeFn<SortingState>;
    containerClassName?: string;

    /** Habilitar ordenamiento global en la tabla (default: true) */
    sortable?: boolean;
    /** Habilitar filtrado en la tabla (default: true) */
    filterable?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function GenericTable<T extends Record<string, unknown>>({
    data,
    columns,
    pagination,
    paginationOptions,
    filter,
    onFilterChange,
    sorting,
    onSortingChange,
    containerClassName,
    sortable = true,
    filterable = true,
}: Props<T>) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );

    const table = useReactTable({
        data,
        columns,
        enableSorting: sortable,
        enableFilters: filterable,
        onColumnVisibilityChange: setColumnVisibility,
        state: { pagination, sorting, columnVisibility },
        onSortingChange,
        ...paginationOptions,
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div
            className={cn(
                'w-full overflow-hidden flex flex-col md:bg-card md:border md:border-border/60 md:rounded-lg md:shadow-sm',
                containerClassName,
            )}
        >
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => {
                                    const meta = header.column.columnDef.meta;
                                    const filterKey = meta?.filterKey as
                                        string | undefined;

                                    // Valor actual de este campo en el filter string
                                    const currentFilterValue = filterKey
                                        ? (getFilterValue(filter, filterKey) ??
                                          '')
                                        : '';

                                    const isSortable =
                                        sortable && header.column.getCanSort();
                                    const isFilterable =
                                        filterable &&
                                        header.column.getCanFilter() &&
                                        filterKey !== undefined;
                                    const isLastColumn =
                                        index === headerGroup.headers.length - 1;

                                    return (
                                        <TableHead key={header.id}>
                                            <div className="select-none flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}

                                                    {/* Sort toggle */}
                                                    {isSortable && (
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {{
                                                                asc: (
                                                                    <ChevronUp
                                                                        size={18}
                                                                    />
                                                                ),
                                                                desc: (
                                                                    <ChevronDown
                                                                        size={18}
                                                                    />
                                                                ),
                                                                false: (
                                                                    <ChevronsUpDown
                                                                        size={18}
                                                                    />
                                                                ),
                                                            }[
                                                                header.column.getIsSorted() as string
                                                            ] ?? null}
                                                        </div>
                                                    )}

                                                    {/* Filter popover */}
                                                    {isFilterable ? (
                                                        <Popover>
                                                            <PopoverTrigger
                                                                asChild
                                                            >
                                                                <FunnelIcon
                                                                    size={18}
                                                                    fill={
                                                                        currentFilterValue
                                                                            ? 'currentColor'
                                                                            : 'none'
                                                                    }
                                                                    className="cursor-pointer"
                                                                />
                                                            </PopoverTrigger>

                                                            <PopoverContent className="w-full flex flex-col gap-4">
                                                                {meta?.filterVariant ===
                                                                'date' ? (
                                                                    <DateRangeFilter
                                                                        label={
                                                                            meta?.headerText ??
                                                                            filterKey
                                                                        }
                                                                        filterKey={
                                                                            filterKey
                                                                        }
                                                                        onFilterChange={
                                                                            onFilterChange
                                                                        }
                                                                    />
                                                                ) : meta?.filterVariant ===
                                                                  'select' ? (
                                                                    <Select
                                                                        value={
                                                                            currentFilterValue ??
                                                                            ''
                                                                        }
                                                                        onValueChange={(
                                                                            value,
                                                                        ) =>
                                                                            onFilterChange(
                                                                                filterKey,
                                                                                value,
                                                                                {
                                                                                    variant:
                                                                                        'select',
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Seleccionar..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectGroup>
                                                                                <SelectLabel>
                                                                                    Registros
                                                                                </SelectLabel>
                                                                                {/* Agregamos una opción para limpiar el filtro si es necesario */}
                                                                                <SelectItem value=" ">
                                                                                    Todos
                                                                                </SelectItem>

                                                                                {meta?.selectOptions?.map(
                                                                                    (
                                                                                        opt,
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                opt.value
                                                                                            }
                                                                                            value={opt.value.toString()} // Radix requiere que el value sea string
                                                                                        >
                                                                                            {
                                                                                                opt.label
                                                                                            }
                                                                                        </SelectItem>
                                                                                    ),
                                                                                )}
                                                                            </SelectGroup>
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <DebouncedInput
                                                                        className="w-full border shadow rounded"
                                                                        onChange={(
                                                                            value,
                                                                        ) =>
                                                                            onFilterChange(
                                                                                filterKey,
                                                                                value as string,
                                                                                {
                                                                                    variant:
                                                                                        (meta?.filterVariant ??
                                                                                            'text') as FilterVariant,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Filtrar..."
                                                                        type={
                                                                            meta?.filterVariant ===
                                                                            'number'
                                                                                ? 'number'
                                                                                : 'text'
                                                                        }
                                                                        value={
                                                                            currentFilterValue
                                                                        }
                                                                    />
                                                                )}
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : null}
                                                </div>

                                                {/* Column visibility toggle en la última columna */}
                                                {isLastColumn && (
                                                    <div className="flex justify-end mr-1.5">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Settings2Icon
                                                                    size={20}
                                                                    className="cursor-pointer"
                                                                />
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {table
                                                                    .getAllColumns()
                                                                    .filter((col) =>
                                                                        col.getCanHide(),
                                                                    )
                                                                    .map((col) => (
                                                                        <DropdownMenuCheckboxItem
                                                                            key={
                                                                                col.id
                                                                            }
                                                                            className="capitalize"
                                                                            checked={col.getIsVisible()}
                                                                            onCheckedChange={(
                                                                                value,
                                                                            ) =>
                                                                                col.toggleVisibility(
                                                                                    !!value,
                                                                                )
                                                                            }
                                                                        >
                                                                            {col.id}
                                                                        </DropdownMenuCheckboxItem>
                                                                    ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}
                                            </div>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Controles de paginación */}
            <div className="border-t border-border/40 bg-transparent md:bg-muted/20 px-2 md:px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
                <div className="flex justify-center items-center md:justify-start gap-2 text-sm text-muted-foreground">
                    <span>
                        {table.getRowCount()} registros encontrados. Mostrar
                    </span>
                    <Select
                        defaultValue="10"
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={(value) =>
                            table.setPageSize(Number(value))
                        }
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Registros</SelectLabel>
                                {[10, 20, 50].map((size) => (
                                    <SelectItem
                                        key={size}
                                        value={size.toString()}
                                    >
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Pagination buttons */}
                <div className="flex justify-center md:justify-end items-center gap-2">
                    <Button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        variant="outline"
                        size="icon-sm"
                    >
                        <ChevronFirst />
                    </Button>
                    <Button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        variant="outline"
                        size="icon-sm"
                    >
                        <ChevronLeft />
                    </Button>
                    <Input
                        type="number"
                        value={table.getState().pagination.pageIndex + 1}
                        onChange={(e) =>
                            table.setPageIndex(
                                e.target.value ? Number(e.target.value) - 1 : 0,
                            )
                        }
                        min={1}
                        max={table.getPageCount()}
                        className="rounded-md w-14 h-8 text-center my-0"
                    />
                    <Button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        variant="outline"
                        size="icon-sm"
                    >
                        <ChevronRight />
                    </Button>
                    <Button
                        onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                        variant="outline"
                        size="icon-sm"
                    >
                        <ChevronLast />
                    </Button>
                </div>
            </div>
        </div>
    );
}
