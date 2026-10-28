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
import { Eye, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { securityObservationService } from '../services/securityObservation.service';
import type { SecurityObservationResponse } from '../types/securityObservation.type';

type SecurityObservationActionCellProps = {
    securityObservation: SecurityObservationResponse;
};

export default function SecurityObservationActionCell({
    securityObservation,
}: SecurityObservationActionCellProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            securityObservationService.deleteById(securityObservation.id),
        onSuccess: () => {
            toast.success('Observación eliminada');
            queryClient.invalidateQueries({
                queryKey: ['securityObservations'],
            });
        },
        onError: (error: AxiosError) => {
            extractErrors(
                error,
                'Ocurrió un error al intentar eliminar la observación',
            );
        },
    });

    return (
        <div className="text-right">
            <GenericAlertDialog
                title="¿Eliminar Observación de Seguridad?"
                description={`Estás a punto de eliminar la observación #${securityObservation.id} (${securityObservation.task}).`}
                actionText={isPending ? 'Eliminando...' : 'Eliminar'}
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
                                to="/securityObservations/$id"
                                params={{ id: String(securityObservation.id) }}
                            >
                                <Eye className="mr-2 h-4 w-4" /> Ver
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                to="/securityObservations/$id/edit"
                                params={{ id: String(securityObservation.id) }}
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
