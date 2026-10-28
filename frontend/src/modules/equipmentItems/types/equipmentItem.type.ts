export const equipmentItemStatus = {
    Operativo: 1,
    'Fuera de Servicio': 3,
} as const;

export interface EquipmentItem {
    id: number;
    code: string;
    name: string;
    status: number;
}

export interface EquipmentItemRequest {
    code: string;
    name: string;
    status: number;
}
