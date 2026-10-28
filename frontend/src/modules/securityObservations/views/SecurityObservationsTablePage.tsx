import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';

import { useGridifyParams } from '@/hooks/useGridifyParams';
import { useSecurityObservationsQuery } from '../hooks/useSecurityObservationsQuery';
import { securityObservationService } from '../services/securityObservation.service';
import GenericTable from '@/components/GenericTable';
import { SECURITY_OBSERVATION_COLUMNS } from '../components/securityObservation.columns';
import { Link } from '@tanstack/react-router';
import { Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import extractErrors from '@/utils/extractErrors';

export default function SecurityObservationsTablePage() {
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

    const { data, isPending } = useSecurityObservationsQuery(gridifyQuery);

    const handleExport = async () => {
        try {
            await securityObservationService.exportExcel(gridifyQuery);
        } catch (error) {
            extractErrors(error as AxiosError, 'Ocurrió un error al exportar a Excel');
            toast.error('No se pudo exportar a Excel');
        }
    };

    if (isPending) return <Loading />;

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold">Observaciones de Seguridad</h1>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button onClick={onResetFilters} variant="outline">
                            Limpiar filtros
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Excel
                    </Button>
                    <Button variant="default" asChild>
                        <Link to="/securityObservations/new">
                            <Plus className="h-4 w-4" />
                            Nueva Observación
                        </Link>
                    </Button>
                </div>
            </div>

            <GenericTable
                data={data?.data ?? []}
                columns={SECURITY_OBSERVATION_COLUMNS}
                pagination={pagination}
                paginationOptions={{
                    onPaginationChange,
                    rowCount: data?.rowCount,
                }}
                filter={filter}
                onFilterChange={onFilterChange}
                sorting={sorting}
                onSortingChange={onSortingChange}
            />
        </div>
    );
}
