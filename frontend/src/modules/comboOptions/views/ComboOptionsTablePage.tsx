import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';

import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import GenericTable from '@/components/GenericTable';

import { COMBO_OPTION_COLUMNS } from '../components/comboOption.columns';
import { comboOptionService } from '../services/comboOption.service';

/** Combo options are a flat catalogue (GET /combo-options without gridify), so
 *  pagination and sorting are handled client-side here. */
export default function ComboOptionsTablePage() {
    const { data, isPending } = useQuery({
        queryKey: ['comboOptions'],
        queryFn: comboOptionService.getAll,
        placeholderData: keepPreviousData,
    });

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);

    const sorted = useMemo(() => {
        const all = [...(data ?? [])];
        if (sorting.length > 0) {
            const { id: key, desc } = sorting[0];
            all.sort((a, b) => {
                const av = a[key as keyof typeof a];
                const bv = b[key as keyof typeof b];
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
                <h1 className="text-2xl font-semibold">Opciones de Combo</h1>

                <Button variant="default" asChild>
                    <Link to="/comboOptions/new">
                        <Plus className="h-4 w-4" />
                        Nueva Opción
                    </Link>
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                <GenericTable
                    data={sorted}
                    columns={COMBO_OPTION_COLUMNS}
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
