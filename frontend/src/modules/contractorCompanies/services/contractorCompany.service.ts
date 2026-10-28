import { apiClient } from '@/api/apiClient';
import type { PaginatedData } from '@/types/table.type';
import type { GridifyResponse } from '@/types/gridifyResponse.type';
import { type GridifyQuery } from '@/utils/gridifyFilter';
import type {
    ContractorCompany,
    ContractorCompanyRequest,
} from '../types/contractorCompany.type';

const BASE_URL = 'contractor-companies';

export const contractorCompanyService = {
    getAllPaginated: async (
        gridifyQuery: GridifyQuery,
    ): Promise<PaginatedData<ContractorCompany>> => {
        const response = await apiClient.get<GridifyResponse<ContractorCompany>>(
            BASE_URL,
            { params: gridifyQuery },
        );
        return { data: response.data.data, rowCount: response.data.count };
    },

    getAll: async (): Promise<ContractorCompany[]> => {
        const response = await apiClient.get<GridifyResponse<ContractorCompany>>(
            BASE_URL,
            { params: { Page: 1, PageSize: 1000, OrderBy: 'name asc' } },
        );
        return response.data.data;
    },

    getById: async (id: number): Promise<ContractorCompany> => {
        const response = await apiClient.get(`/contractor-companies/${id}`);
        return response.data;
    },

    create: async (request: ContractorCompanyRequest): Promise<ContractorCompany> => {
        const response = await apiClient.post('/contractor-companies', request);
        return response.data;
    },

    update: async (id: number, request: ContractorCompanyRequest): Promise<void> => {
        await apiClient.put(`/contractor-companies/${id}`, request);
    },

    deleteById: async (id: number): Promise<void> => {
        await apiClient.delete(`/contractor-companies/${id}`);
    },
};

export default contractorCompanyService;
