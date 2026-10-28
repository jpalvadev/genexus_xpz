import { GenericAlertDialog } from '@/components/GenericAlertDialog';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import extractErrors from '@/utils/extractErrors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { equipmentMaintenanceService } from '../services/equipmentMaintenance.service';
import type { EquipmentMaintenanceResponse } from '../types/equipmentMaintenance.type';

type EquipmentMaintenanceActionCellProps = {
    equipmentMaintenance: EquipmentMaintenanceResponse;
};

export default function EquipmentMaintenanceActionCell({
    equipmentMaintenance,
}: EquipmentMaintenanceActionCellProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            equipmentMaintenanceService.deleteById(equipmentMaintenance.id),
        onSuccess: () => {
            toast.success('Equipo eliminado');
            queryClient.invalidateQueries({
                queryKey: ['equipmentMaintenances'],
            });
        },
        onError: (error: AxiosError) => {
            extractErrors(
                error,
                'Ocurrió un error al intentar eliminar el equipo',
            );
        },
    });

    return (
        <div className="text-right">
            <GenericAlertDialog
                title="¿Eliminar Equipo?"
                description={`Estás a punto de eliminar ${equipmentMaintenance.activity}.`}
                actionText={isPending ? 'Eliminando...' : 'Eliminar'}
                onAction={mutate}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                                to="/equipmentMaintenances/$id"
                                params={{
                                    id: equipmentMaintenance.id
                                        .toString()
                                        .trim(),
                                }}
                            >
                                Detalle
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                                to="/equipmentMaintenances/$id/edit"
                                params={{
                                    id: equipmentMaintenance.id.toString(),
                                }}
                            >
                                Editar
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer"
                            >
                                Eliminar
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
            </GenericAlertDialog>
        </div>
    );
}
