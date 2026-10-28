import { describe, it, expect } from 'vitest';
import { cleanEmptyParams } from './cleanEmptyParams';
import {
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
} from '@/components/GenericTable';

describe('cleanEmptyParams', () => {
    it('elimina propiedades con undefined, string vacío y NaN', () => {
        const input = {
            search: '',
            filter: undefined,
            invalidNumber: NaN,
            validText: 'hola',
            count: 42,
        };

        const result = cleanEmptyParams(input);

        expect(result).toEqual({
            validText: 'hola',
            count: 42,
        });
        expect(result).not.toHaveProperty('search');
        expect(result).not.toHaveProperty('filter');
        expect(result).not.toHaveProperty('invalidNumber');
    });

    it('conserva valores falsy válidos como 0 y false', () => {
        const input = {
            zeroValue: 0,
            isActive: false,
            nullValue: null, // null no es undefined ni string vacío ni NaN
        };

        const result = cleanEmptyParams(input);

        expect(result).toEqual({
            zeroValue: 0,
            isActive: false,
            nullValue: null,
        });
    });

    it('elimina pageIndex y pageSize cuando son los valores por defecto', () => {
        const input = {
            query: 'dispositivo',
            pageIndex: DEFAULT_PAGE_INDEX, // 0
            pageSize: DEFAULT_PAGE_SIZE,   // 10
        };

        const result = cleanEmptyParams(input);

        expect(result).toEqual({
            query: 'dispositivo',
        });
        expect(result).not.toHaveProperty('pageIndex');
        expect(result).not.toHaveProperty('pageSize');
    });

    it('conserva pageIndex y pageSize cuando difieren de los valores por defecto', () => {
        const input = {
            query: 'dispositivo',
            pageIndex: 2,
            pageSize: 25,
        };

        const result = cleanEmptyParams(input);

        expect(result).toEqual({
            query: 'dispositivo',
            pageIndex: 2,
            pageSize: 25,
        });
    });

    it('no muta el objeto original pasado por parámetro', () => {
        const original = {
            empty: '',
            pageIndex: DEFAULT_PAGE_INDEX,
            name: 'test',
        };
        const copia = { ...original };

        cleanEmptyParams(original);

        expect(original).toEqual(copia);
    });
});

