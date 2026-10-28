import { describe, it, expect } from 'vitest';
import { stateToSortBy, sortByToState } from './tableSortMapper';
import type { SortingState } from '@tanstack/react-table';
import type { SortParams } from '@/types/table.type';

describe('tableSortMapper', () => {
    describe('stateToSortBy', () => {
        it('devuelve undefined cuando sorting es undefined o array vacío', () => {
            expect(stateToSortBy(undefined)).toBeUndefined();
            expect(stateToSortBy([])).toBeUndefined();
        });

        it('convierte un ordenamiento simple asc y desc a formato de Gridify', () => {
            expect(stateToSortBy([{ id: 'name', desc: false }])).toBe('name asc');
            expect(stateToSortBy([{ id: 'createdAt', desc: true }])).toBe('createdAt desc');
        });

        it('normaliza IDs de TanStack con snake_case a notación de punto para relaciones anidadas', () => {
            // TanStack Table convierte 'device.name' en 'device_name'
            const sorting: SortingState = [{ id: 'device_name', desc: false }];
            expect(stateToSortBy(sorting)).toBe('device.name asc');

            const nestedMultiple: SortingState = [{ id: 'tenant_user_email', desc: true }];
            expect(stateToSortBy(nestedMultiple)).toBe('tenant.user.email desc');
        });

        it('toma solo la primera columna si se proporcionan múltiples columnas', () => {
            const multiSort: SortingState = [
                { id: 'lastName', desc: false },
                { id: 'firstName', desc: true },
            ];
            expect(stateToSortBy(multiSort)).toBe('lastName asc');
        });
    });

    describe('sortByToState', () => {
        it('devuelve array vacío cuando sortBy es undefined o vacío', () => {
            expect(sortByToState(undefined)).toEqual([]);
            expect(sortByToState('' as unknown as SortParams['orderBy'])).toEqual([]);
        });

        it('convierte un formato de string a SortingState de TanStack Table', () => {
            expect(sortByToState('name asc')).toEqual([{ id: 'name', desc: false }]);
            expect(sortByToState('age desc')).toEqual([{ id: 'age', desc: true }]);
        });

        it('convierte notación de punto a snake_case para que TanStack Table ubique la columna', () => {
            expect(sortByToState('module.name desc')).toEqual([{ id: 'module_name', desc: true }]);
            expect(sortByToState('device.sector.name asc')).toEqual([
                { id: 'device_sector_name', desc: false },
            ]);
        });
    });

    describe('Round-trip (stateToSortBy <-> sortByToState)', () => {
        it('mantiene la paridad al convertir ida y vuelta para columnas simples y anidadas', () => {
            const estadoInicial: SortingState = [{ id: 'device_name', desc: true }];
            const urlFormat = stateToSortBy(estadoInicial);
            expect(urlFormat).toBe('device.name desc');

            const estadoReconstruido = sortByToState(urlFormat as SortParams['orderBy']);
            expect(estadoReconstruido).toEqual(estadoInicial);
        });
    });
});

