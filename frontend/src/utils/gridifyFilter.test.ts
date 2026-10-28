import { describe, it, expect } from 'vitest';
import {
    parseFilter,
    upsertFilter,
    removeFiltersByPrefix,
    getFilterValue,
} from './gridifyFilter';

describe('gridifyFilter', () => {
    describe('parseFilter', () => {
        it('devuelve array vacío si el filtro es undefined o vacío', () => {
            expect(parseFilter(undefined)).toEqual([]);
            expect(parseFilter('')).toEqual([]);
        });

        it('parsea un filtro de texto tipo LIKE (prefijo *)', () => {
            const resultado = parseFilter('name=*acme');
            expect(resultado).toEqual([
                {
                    field: 'name',
                    operator: '=',
                    value: 'acme',
                    isLike: true,
                },
            ]);
        });

        it('parsea filtros numéricos y de comparación con operadores', () => {
            expect(parseFilter('age>=18')).toEqual([
                {
                    field: 'age',
                    operator: '>=',
                    value: '18',
                    isLike: false,
                },
            ]);

            expect(parseFilter('temperature<25')).toEqual([
                {
                    field: 'temperature',
                    operator: '<',
                    value: '25',
                    isLike: false,
                },
            ]);

            expect(parseFilter('count=10')).toEqual([
                {
                    field: 'count',
                    operator: '=',
                    value: '10',
                    isLike: false,
                },
            ]);
        });

        it('parsea múltiples filtros separados por comas y descarta espacios con trim', () => {
            const resultado = parseFilter(' name=*ana , age>=30 , status=active ');
            expect(resultado).toHaveLength(3);
            expect(resultado).toEqual([
                { field: 'name', operator: '=', value: 'ana', isLike: true },
                { field: 'age', operator: '>=', value: '30', isLike: false },
                { field: 'status', operator: '=', value: 'active', isLike: false },
            ]);
        });

        it('ignora de forma segura condiciones mal formadas', () => {
            const resultado = parseFilter('name=*ana,invalidoSinOperador,age>=30,,===');
            expect(resultado).toEqual([
                { field: 'name', operator: '=', value: 'ana', isLike: true },
                { field: 'age', operator: '>=', value: '30', isLike: false },
            ]);
        });

        it('Bug B1: parseFilter debería soportar campos anidados con notación de punto (ej: module.name)', () => {
            // Falla actualmente porque la regex ^(\w+) rechaza el caracter '.'
            const resultado = parseFilter('module.name=*dispositivos');
            expect(resultado).toEqual([
                {
                    field: 'module.name',
                    operator: '=',
                    value: 'dispositivos',
                    isLike: true,
                },
            ]);
        });
    });

    describe('upsertFilter', () => {
        it('agrega un nuevo filtro de texto cuando el filtro previo está vacío o undefined', () => {
            const resultado = upsertFilter(undefined, 'name', 'acme');
            expect(resultado).toBe('name=*acme');
        });

        it('reemplaza el valor de un campo existente', () => {
            const resultado = upsertFilter('name=*ana,age=30', 'name', 'luis');
            expect(resultado).toBe('age=30,name=*luis');
        });

        it('elimina el campo si el nuevo valor es un string vacío o de solo espacios', () => {
            expect(upsertFilter('name=*ana,age=30', 'name', '')).toBe('age=30');
            expect(upsertFilter('name=*ana,age=30', 'name', '   ')).toBe('age=30');
        });

        it('soporta variante number con operador exacto o de comparación', () => {
            const exacto = upsertFilter('name=*ana', 'age', '25', {
                variant: 'number',
                operator: '=',
            });
            expect(exacto).toBe('name=*ana,age=25');

            const mayorOIgual = upsertFilter('name=*ana', 'age', '18', {
                variant: 'number',
                operator: '>=',
            });
            expect(mayorOIgual).toBe('name=*ana,age>=18');
        });

        it('soporta variante date con operador de rango', () => {
            const fecha = upsertFilter(undefined, 'createdAt', '2026-10-09', {
                variant: 'date',
                operator: '>=',
            });
            expect(fecha).toBe('createdAt>=2026-10-09');
        });
    });

    describe('removeFiltersByPrefix', () => {
        it('elimina todos los filtros cuyo campo empiece con el prefijo especificado', () => {
            const filtroOriginal = 'createdAtFrom>=2026-01-01,name=*test,createdAtTo<=2026-12-31';
            const resultado = removeFiltersByPrefix(filtroOriginal, 'createdAt');
            expect(resultado).toBe('name=*test');
        });

        it('devuelve el mismo filtro si ningún campo coincide con el prefijo', () => {
            const filtroOriginal = 'name=*test,age>=18';
            expect(removeFiltersByPrefix(filtroOriginal, 'createdAt')).toBe('name=*test,age>=18');
        });
    });

    describe('getFilterValue', () => {
        it('obtiene el valor correspondiente a un campo', () => {
            const filtro = 'name=*acme,age>=21';
            expect(getFilterValue(filtro, 'name')).toBe('acme');
            expect(getFilterValue(filtro, 'age')).toBe('21');
        });

        it('devuelve undefined si el campo no existe en el filtro o si el filtro es undefined', () => {
            expect(getFilterValue('name=*acme', 'status')).toBeUndefined();
            expect(getFilterValue(undefined, 'name')).toBeUndefined();
        });
    });

    describe('Round-trip (parse -> upsert/serialize)', () => {
        it('preserva las condiciones idénticas al parsear y re-insertar', () => {
            const original = 'name=*term,age=40';
            const parsed = parseFilter(original);

            let reconstruido: string | undefined = undefined;
            for (const cond of parsed) {
                reconstruido = upsertFilter(reconstruido, cond.field, cond.value, {
                    variant: cond.isLike ? 'string' : 'number',
                    operator: cond.operator,
                });
            }

            expect(parseFilter(reconstruido)).toEqual(parsed);
        });
    });
});

