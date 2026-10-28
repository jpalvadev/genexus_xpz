import { apiClient } from '@/api/apiClient';
import type { PaginatedData } from '@/types/table.type';
import type { EquipmentItem, EquipmentItemRequest } from '../types/equipmentItem.type';

const BASE_URL = 'equipment-items';

export const equipmentItemService = {
    async getAllPaginated(
        params: Record<string, string>,
    ): Promise<PaginatedData<EquipmentItem>> {
        const gridify = {
            pageIndex: Number(params.pageIndex) + 1,
            pageSize: Number(params.pageSize),
            ...(params.filter ? { filter: params.filter } : {}),
            ...(params.orderBy ? { orderBy: params.orderBy } : {}),
        };
        const response = await apiClient.get(BASE_URL, { params: gridify });
        return { data: response.data.data, rowCount: response.data.count };
    },

    async getAll(): Promise<EquipmentItem[]> {
        const response = await apiClient.get(`${BASE_URL}/all`);
        return response.data;
    },

    async getById(id: number): Promise<EquipmentItem> {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    async updateStatus(id: number, status: number): Promise<void> {
        await apiClient.patch(`${BASE_URL}/${id}/status`, status);
    },

    async create(request: EquipmentItemRequest): Promise<EquipmentItem> {
        const response = await apiClient.post(BASE_URL, request);
        return response.data;
    },

    async update(id: number, request: EquipmentItemRequest): Promise<EquipmentItem> {
        const response = await apiClient.put(`${BASE_URL}/${id}`, request);
        return response.data;
    },
};

export default equipmentItemService;
