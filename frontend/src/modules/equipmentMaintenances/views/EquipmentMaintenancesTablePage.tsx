import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';

import { useGridifyParams } from '@/hooks/useGridifyParams';
import { equipmentMaintenanceService } from '../services/equipmentMaintenance.service';
import { useEquipmentMaintenancesQuery } from '../hooks/useEquipmentMaintenancesQuery';
import GenericTable from '@/components/GenericTable';
import { EQUIPMENT_MAINTENANCE_COLUMNS } from '../components/equipmentMaintenance.columns';

export default function EquipmentMaintenancesTablePage() {
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

    const { data, isPending } = useEquipmentMaintenancesQuery(gridifyQuery);

    if (isPending || !data) return <Loading />;

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Registro de Tratamientos Preventivos y Correctivos
                </h1>

                <Button
                    variant="default"
                    onClick={() => {
                        equipmentMaintenanceService.exportExcel(
                            gridifyQuery,
                        );
                    }}
                >
                    Excel
                </Button>

                {hasActiveFilters && (
                    <Button onClick={onResetFilters} variant="outline">
                        Limpiar filtros
                    </Button>
                )}
            </div>

            <GenericTable
                    data={data?.data ?? []}
                    columns={EQUIPMENT_MAINTENANCE_COLUMNS}
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
