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

import { contractorCompanyService } from '../services/contractorCompany.service';
import type { ContractorCompany } from '../types/contractorCompany.type';

type ContractorCompanyActionCellProps = {
    contractorCompany: ContractorCompany;
};

export default function ContractorCompanyActionCell({ contractorCompany }: ContractorCompanyActionCellProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () => contractorCompanyService.deleteById(contractorCompany.id),
        onSuccess: () => {
            toast.success('empresa contratista eliminado/a');
            queryClient.invalidateQueries({ queryKey: ['contractorCompanies'] });
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
                title="¿Eliminar Empresa contratista?"
                description={'Estás a punto de eliminar el registro #' + contractorCompany.id + ' (' + contractorCompany.name + ').'}
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
                                to="/contractorCompanies/$id/edit"
                                params={{ id: String(contractorCompany.id) }}
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
