import { apiClient } from '@/api/apiClient';
import type { PaginatedData } from '@/types/table.type';
import type { Person, PersonRequest } from '../types/person.type';

const BASE_URL = 'persons';

export const personService = {
    async getAllPaginated(
        params: Record<string, string>,
    ): Promise<PaginatedData<Person>> {
        const gridify = {
            pageIndex: Number(params.pageIndex) + 1,
            pageSize: Number(params.pageSize),
            ...(params.filter ? { filter: params.filter } : {}),
            ...(params.orderBy ? { orderBy: params.orderBy } : {}),
        };
        const response = await apiClient.get(BASE_URL, { params: gridify });
        return { data: response.data.data, rowCount: response.data.count };
    },

    async getAll(): Promise<Person[]> {
        const response = await apiClient.get(`${BASE_URL}/all`);
        return response.data;
    },

    async getById(id: number): Promise<Person> {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    async create(request: PersonRequest): Promise<Person> {
        const response = await apiClient.post(BASE_URL, request);
        return response.data;
    },

    async update(id: number, request: PersonRequest): Promise<Person> {
        const response = await apiClient.put(`${BASE_URL}/${id}`, request);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};

export default personService;
