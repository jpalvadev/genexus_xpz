import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import GenericTable from '@/components/GenericTable';
import { useGridifyParams } from '@/hooks/useGridifyParams';

import { PLANT_COLUMNS } from '../components/plant.columns';
import { plantService } from '../services/plant.service';

export default function PlantTablePage() {
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
        queryKey: ['plants', gridifyQuery],
        queryFn: () => plantService.getAllPaginated(gridifyQuery),
        placeholderData: keepPreviousData,
    });

    if (isPending || !data) return <Loading />;

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold">Plantas</h1>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button onClick={onResetFilters} variant="outline">
                            Limpiar filtros
                        </Button>
                    )}
                    <Button variant="default" asChild>
                        <Link to="/plants/new">
                            <Plus className="h-4 w-4" />
                            Nueva Planta
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <GenericTable
                    data={data.data}
                    columns={PLANT_COLUMNS}
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
