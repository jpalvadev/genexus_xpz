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
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { plantService } from '../services/plant.service';
import type { Plant } from '../types/plant.type';

type PlantActionCellProps = {
    plant: Plant;
};

export default function PlantActionCell({ plant }: PlantActionCellProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () => plantService.deleteById(plant.id),
        onSuccess: () => {
            toast.success('planta eliminado/a');
            queryClient.invalidateQueries({ queryKey: ['plants'] });
        },
        onError: (error: AxiosError) => {
            extractErrors(
                error,
                'Ocurrió un error al intentar eliminar el registro',
            );
        },
    });

    return (
        <div className="text-right">
            <GenericAlertDialog
                title="¿Eliminar Planta?"
                description={'Estás a punto de eliminar el registro #' + plant.id + ' (' + plant.name + ').'}
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
                                to="/plants/$id/edit"
                                params={{ id: String(plant.id) }}
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
