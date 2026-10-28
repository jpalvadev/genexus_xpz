import { apiClient } from '@/api/apiClient';
import type { ComboOption, ComboOptionRequest } from '../types/comboOption.type';

const BASE_URL = 'combo-options';

export const comboOptionService = {
    /** Flat catalogue of every combo set (GET /combo-options). */
    getAll: async (): Promise<ComboOption[]> => {
        const response = await apiClient.get<ComboOption[]>(BASE_URL);
        return response.data;
    },

    /** Items of one combo set (GET /combo-options/{comboKey}). */
    getByKey: async (comboKey: string): Promise<ComboOption[]> => {
        const response = await apiClient.get<ComboOption[]>(`${BASE_URL}/${comboKey}`);
        return response.data;
    },

    getById: async (id: number): Promise<ComboOption> => {
        const response = await apiClient.get(`/combo-options/${id}`);
        return response.data;
    },

    create: async (request: ComboOptionRequest): Promise<ComboOption> => {
        const response = await apiClient.post('/combo-options', request);
        return response.data;
    },

    update: async (id: number, request: ComboOptionRequest): Promise<void> => {
        await apiClient.put(`/combo-options/${id}`, request);
    },

    deleteById: async (id: number): Promise<void> => {
        await apiClient.delete(`/combo-options/${id}`);
    },
};

export default comboOptionService;
