import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { equipmentItemStatus } from '@/modules/equipmentItems/types/equipmentItem.type';

type EquipmentStatusDialogProps = {
    open: boolean;
    onStatusSelected: (status: number) => void;
    onCancel: () => void;
};

export default function EquipmentStatusDialog({
    open,
    onStatusSelected,
    onCancel,
}: EquipmentStatusDialogProps) {
    const [selected, setSelected] = useState<number | null>(null);

    const handleConfirm = () => {
        if (selected !== null) {
            onStatusSelected(selected);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Seleccione el estado final del equipo.
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                    <Button
                        variant={
                            selected === equipmentItemStatus.Operativo
                                ? 'default'
                                : 'outline'
                        }
                        className="justify-start"
                        onClick={() =>
                            setSelected(equipmentItemStatus.Operativo)
                        }
                        type="button"
                    >
                        Operativo
                    </Button>
                    <Button
                        variant={
                            selected ===
                            equipmentItemStatus['Fuera de Servicio']
                                ? 'default'
                                : 'outline'
                        }
                        className="justify-start"
                        onClick={() =>
                            setSelected(
                                equipmentItemStatus['Fuera de Servicio'],
                            )
                        }
                        type="button"
                    >
                        Fuera de Servicio
                    </Button>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel} type="button">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selected === null}
                        type="button"
                    >
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
