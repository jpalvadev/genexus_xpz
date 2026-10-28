import { apiClient } from '@/api/apiClient';
import type {
    EquipmentMaintenance,
    EquipmentMaintenanceResponse,
} from '../types/equipmentMaintenance.type';
import type { PaginatedData } from '@/types/table.type';
import type { GridifyQuery } from '@/utils/gridifyFilter';
import type { GridifyResponse } from '../../../types/gridifyResponse.type';

export const equipmentMaintenanceService = {
    getAllPaginated: async (
        gridifyQuery: GridifyQuery,
    ): Promise<PaginatedData<EquipmentMaintenanceResponse>> => {
        const response = await apiClient.get<
            GridifyResponse<EquipmentMaintenanceResponse>
        >('/equipment-maintenances', {
            params: gridifyQuery,
        });
        return {
            data: response.data.data,
            rowCount: response.data.count,
        };
    },
    getAll: async (
        gridifyQuery: GridifyQuery,
    ): Promise<PaginatedData<EquipmentMaintenanceResponse>> => {
        const response = await apiClient.get<
            GridifyResponse<EquipmentMaintenanceResponse>
        >('/equipment-maintenances/charts', {
            params: gridifyQuery,
        });
        return {
            data: response.data.data,
            rowCount: response.data.count,
        };
    },
    getById: async (id: number): Promise<EquipmentMaintenanceResponse> => {
        const response = await apiClient.get(`/equipment-maintenances/${id}`);
        return response.data;
    },
    exportExcel: async (filters: GridifyQuery): Promise<void> => {
        const response = await apiClient.get(
            '/equipment-maintenances/export-excel',
            {
                params: filters,
                responseType: 'blob', // response archivo binario
            },
        );

        const url = window.URL.createObjectURL(new Blob([response.data])); // url temporal

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'mantenimientos.xlsx');
        document.body.appendChild(link);
        // clickeamos el link y lo eliminamos
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url); // liberamos la URL temporal
    },
    create: async (
        equipmentMaintenance: EquipmentMaintenance,
    ): Promise<EquipmentMaintenance> => {
        const response = await apiClient.post<EquipmentMaintenance>(
            '/equipment-maintenances',
            equipmentMaintenance,
        );
        return response.data;
    },

    update: async (
        equipmentMaintenance: EquipmentMaintenance,
    ): Promise<void> => {
        const { id, ...data } = equipmentMaintenance;
        await apiClient.put(`/equipment-maintenances/${id}`, data);
    },

    deleteById: async (id: number): Promise<boolean> => {
        return await apiClient.delete(`/equipment-maintenances/${id}`);
    },
};
