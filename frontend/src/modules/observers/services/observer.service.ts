import { apiClient } from '@/api/apiClient';
import type { PaginatedData } from '@/types/table.type';
import type { GridifyResponse } from '@/types/gridifyResponse.type';
import { buildGridifyParams, type GridifyQuery } from '@/utils/gridifyFilter';
import type { Observer, ObserverRequest } from '../types/observer.type';

const BASE_URL = 'observers';

export const observerService = {
    getAllPaginated: async (gridifyQuery: GridifyQuery): Promise<PaginatedData<Observer>> => {
        const response = await apiClient.get<GridifyResponse<Observer>>(BASE_URL, {
            params: buildGridifyParams(gridifyQuery),
        });
        return { data: response.data.data, rowCount: response.data.count };
    },

    getAll: async (): Promise<Observer[]> => {
        const response = await apiClient.get<GridifyResponse<Observer>>(BASE_URL, {
            params: { Page: 1, PageSize: 1000, OrderBy: 'fullName asc' },
        });
        return response.data.data;
    },

    /**
     * Feed for the Security Observation observers picker: active observers only
     * (spec), contains search on fullName driven by the MultiSelect search box.
     */
    lookup: async (params: Record<string, string>): Promise<PaginatedData<Observer>> => {
        const filters = ['active eq true'];
        const term = (params.fullName ?? '').trim();
        if (term) {
            filters.push(`fullName=*${term}`);
        }
        const response = await apiClient.get<GridifyResponse<Observer>>(BASE_URL, {
            params: {
                Page: 1,
                PageSize: Number(params.pageSize) || 30,
                OrderBy: 'fullName asc',
                Filters: filters.join(','),
            },
        });
        return { data: response.data.data, rowCount: response.data.count };
    },

    getById: async (id: number): Promise<Observer> => {
        const response = await apiClient.get(`/observers/${id}`);
        return response.data;
    },

    create: async (request: ObserverRequest): Promise<Observer> => {
        const response = await apiClient.post('/observers', request);
        return response.data;
    },

    update: async (id: number, request: ObserverRequest): Promise<void> => {
        await apiClient.put(`/observers/${id}`, request);
    },

    deleteById: async (id: number): Promise<void> => {
        await apiClient.delete(`/observers/${id}`);
    },
};

export default observerService;
