import { apiClient } from '@/api/apiClient';
import type { PaginatedData } from '@/types/table.type';
import type { GridifyResponse } from '@/types/gridifyResponse.type';
import { buildGridifyParams, type GridifyQuery } from '@/utils/gridifyFilter';
import type {
    SecurityObservationRequest,
    SecurityObservationResponse,
} from '../types/securityObservation.type';

const BASE_URL = 'security-observations';

export const securityObservationService = {
    getAllPaginated: async (
        gridifyQuery: GridifyQuery,
    ): Promise<PaginatedData<SecurityObservationResponse>> => {
        const response = await apiClient.get<
            GridifyResponse<SecurityObservationResponse>
        >(BASE_URL, { params: buildGridifyParams(gridifyQuery) });
        return { data: response.data.data, rowCount: response.data.count };
    },

    getById: async (id: number): Promise<SecurityObservationResponse> => {
        const response = await apiClient.get(`/security-observations/${id}`);
        return response.data;
    },

    create: async (
        request: SecurityObservationRequest,
    ): Promise<SecurityObservationResponse> => {
        const response = await apiClient.post('/security-observations', request);
        return response.data;
    },

    update: async (id: number, request: SecurityObservationRequest): Promise<void> => {
        await apiClient.put(`/security-observations/${id}`, request);
    },

    deleteById: async (id: number): Promise<void> => {
        await apiClient.delete(`/security-observations/${id}`);
    },

    /** Excel export of the current grid view (server-side, honors filters + order). */
    exportExcel: async (gridifyQuery: GridifyQuery): Promise<void> => {
        const response = await apiClient.get('/security-observations/export-excel', {
            params: buildGridifyParams(gridifyQuery),
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'observaciones-de-seguridad.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

export default securityObservationService;
