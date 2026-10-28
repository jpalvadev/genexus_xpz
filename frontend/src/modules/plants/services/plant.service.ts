import { apiClient } from '@/api/apiClient';
import type { PaginatedData } from '@/types/table.type';
import type { GridifyResponse } from '@/types/gridifyResponse.type';
import { type GridifyQuery } from '@/utils/gridifyFilter';
import type { Plant, PlantRequest } from '../types/plant.type';

const BASE_URL = 'plants';

export const plantService = {
    getAllPaginated: async (gridifyQuery: GridifyQuery): Promise<PaginatedData<Plant>> => {
        const response = await apiClient.get<GridifyResponse<Plant>>(BASE_URL, {
            params: gridifyQuery,
        });
        return { data: response.data.data, rowCount: response.data.count };
    },

    getAll: async (): Promise<Plant[]> => {
        const response = await apiClient.get<GridifyResponse<Plant>>(BASE_URL, {
            params: { Page: 1, PageSize: 1000, OrderBy: 'name asc' },
        });
        return response.data.data;
    },

    getById: async (id: number): Promise<Plant> => {
        const response = await apiClient.get(`/plants/${id}`);
        return response.data;
    },

    create: async (request: PlantRequest): Promise<Plant> => {
        const response = await apiClient.post('/plants', request);
        return response.data;
    },

    update: async (id: number, request: PlantRequest): Promise<void> => {
        await apiClient.put(`/plants/${id}`, request);
    },

    deleteById: async (id: number): Promise<void> => {
        await apiClient.delete(`/plants/${id}`);
    },
};

export default plantService;
