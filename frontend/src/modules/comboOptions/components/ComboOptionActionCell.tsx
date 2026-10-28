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

import { comboOptionService } from '../services/comboOption.service';
import type { ComboOption } from '../types/comboOption.type';

type ComboOptionActionCellProps = {
    comboOption: ComboOption;
};

export default function ComboOptionActionCell({ comboOption }: ComboOptionActionCellProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () => comboOptionService.deleteById(comboOption.id),
        onSuccess: () => {
            toast.success('Opción eliminada');
            queryClient.invalidateQueries({ queryKey: ['comboOptions'] });
            queryClient.invalidateQueries({ queryKey: ['combo-options'] });
        },
        onError: (error: AxiosError) => {
            extractErrors(error, 'Ocurrió un error al intentar eliminar la opción');
        },
    });

    return (
        <div className="text-right">
            <GenericAlertDialog
                title="¿Eliminar Opción de Combo?"
                description={
                    'Estás a punto de eliminar la opción "' +
                    comboOption.label +
                    '" de ' +
                    comboOption.comboKey +
                    '.'
                }
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
                                to="/comboOptions/$id/edit"
                                params={{ id: String(comboOption.id) }}
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
