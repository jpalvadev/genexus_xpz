import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ReactNode } from 'react';

type GenericAlertDialogProps = {
    children: ReactNode;
    onAction: () => void;
    title?: string;
    description?: ReactNode;
    actionText?: string;
    cancelText?: string;
};

export function GenericAlertDialog({
    children,
    description = 'Esto no se puede deshacer',
    actionText = 'Continuar',
    cancelText = 'Cancelar',
    title = '¿Estás completamente seguro?',
    onAction,
}: GenericAlertDialogProps) {
    return (
        <AlertDialog>
            {children}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onAction}>
                        {actionText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
