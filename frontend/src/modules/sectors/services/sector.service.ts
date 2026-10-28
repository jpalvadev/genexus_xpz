import { apiClient } from '@/api/apiClient';
import type { PaginatedData } from '@/types/table.type';
import type { GridifyResponse } from '@/types/gridifyResponse.type';
import { type GridifyQuery } from '@/utils/gridifyFilter';
import type { Sector, SectorRequest } from '../types/sector.type';

const BASE_URL = 'sectors';

export const sectorService = {
    getAllPaginated: async (gridifyQuery: GridifyQuery): Promise<PaginatedData<Sector>> => {
        const response = await apiClient.get<GridifyResponse<Sector>>(BASE_URL, {
            params: gridifyQuery,
        });
        return { data: response.data.data, rowCount: response.data.count };
    },

    getAll: async (): Promise<Sector[]> => {
        const response = await apiClient.get<GridifyResponse<Sector>>(BASE_URL, {
            params: { Page: 1, PageSize: 1000, OrderBy: 'name asc' },
        });
        return response.data.data;
    },

    getById: async (id: number): Promise<Sector> => {
        const response = await apiClient.get(`/sectors/${id}`);
        return response.data;
    },

    create: async (request: SectorRequest): Promise<Sector> => {
        const response = await apiClient.post('/sectors', request);
        return response.data;
    },

    update: async (id: number, request: SectorRequest): Promise<void> => {
        await apiClient.put(`/sectors/${id}`, request);
    },

    deleteById: async (id: number): Promise<void> => {
        await apiClient.delete(`/sectors/${id}`);
    },
};

export default sectorService;
