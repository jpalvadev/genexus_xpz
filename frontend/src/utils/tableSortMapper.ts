// import { type SortingState } from '@tanstack/react-table';
// import { type SortParams } from '@/types/table.type';

// /*
// Utility para traducir el sort entre el formato esperado por Tanstack Table y el formato de la URL
// Solo sorting por 1 columna - Ejemplos formatos:
//   TanStack Table usa un formato de array para el ordenamiento:
//   [{ id: "firstName", desc: false }] -> ordenar por firstName ascendente
//   [{ id: "age", desc: true }] -> ordenar por age descendente

//   La URL usa un formato de string más simple:
//   "firstName.asc" -> ordenar por firstName ascendente
//   "age.desc" -> ordenar por age descendente
// */

// /**
//  * @param sorting - Estado de ordenamiento de TanStack Table (array de objetos)
//  * @returns String en formato "campo.dirección" o undefined si no hay ordenamiento
//  */
// export const stateToSortBy = (sorting: SortingState | undefined) => {
//     if (!sorting || sorting.length == 0) return undefined;

//     const sort = sorting[0];

//     // return `${sort.id}.${sort.desc ? 'desc' : 'asc'}` as const;
//     return `${sort.id} ${sort.desc ? 'desc' : 'asc'}` as const;
// };

// /**
//  * @param sortBy - String en formato "campo.dirección" o undefined
//  * @returns Array con el estado de ordenamiento para TanStack Table, o array vacío si no hay ordenamiento
//  */
// // export const sortByToState = (sortBy: SortParams['sortBy'] | undefined) => {
// //     if (!sortBy) return [];
// export const sortByToState = (sortBy: SortParams['orderBy'] | undefined) => {
//     if (!sortBy) return [];

//     const [id, desc] = sortBy.split(' ');

//     return [{ id, desc: desc === 'desc' }];
// };

//////////////////////////////////////////////

import { type SortingState } from '@tanstack/react-table';
import { type SortParams } from '@/types/table.type';

/*
Utility para traducir el sort entre TanStack Table y la URL / Gridify.
Solo sorting por 1 columna.

Problema: cuando el accessorKey tiene un punto (ej: "device.name" para acceder a una
relación), TanStack Table lo convierte internamente a "device_name" como column.id
(reemplaza "." por "_"). Gridify espera camelCase: "deviceName".

La función normalizeColumnId revierte ese transform: "device_name" → "deviceName".
No afecta ids que ya son camelCase ni ids simples sin guión bajo.
*/

/**
 * Convierte el id interno de TanStack Table a camelCase para Gridify.
 * "device_name" → "deviceName"
 * "createdAt"   → "createdAt"   (sin cambios)
 * "id"          → "id"          (sin cambios)
 */
function normalizeColumnId(id: string): string {
    // dot notation for nested properties: "module_name" → "module.name"
    return id.replace(/_([a-z])/g, (_, char) => '.' + char);

    // fallback: camelCase if dot notation doesn't work
    // return id.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * @param sorting - Estado de ordenamiento de TanStack Table
 * @returns String en formato "campo dirección" o undefined si no hay ordenamiento
 */
export const stateToSortBy = (
    sorting: SortingState | undefined,
): string | undefined => {
    if (!sorting || sorting.length === 0) return undefined;

    const sort = sorting[0];
    const field = normalizeColumnId(sort.id);

    return `${field} ${sort.desc ? 'desc' : 'asc'}`;
};

/**
 * @param sortBy - String en formato "campo dirección" o undefined
 * @returns Array con el estado de ordenamiento para TanStack Table, o [] si no hay
 *
 * Nota: al reconstruir el estado desde la URL, el id puede venir como "deviceName"
 * pero TanStack Table lo usa internamente como "device_name". Por eso se hace el
 * transform inverso (camelCase → snake_case con punto) SOLO si es necesario para
 * que la columna quede resaltada. Si la columna tiene un `id` explícito definido,
 * ese id es el que hay que usar — en ese caso este round-trip no aplica.
 */
export const sortByToState = (
    sortBy: SortParams['orderBy'] | undefined,
): SortingState => {
    if (!sortBy) return [];

    const [id, direction] = sortBy.split(' ');

    // "module.name" → "module_name" so TanStack Table finds the column
    const normalizedId = id.replace(/\./g, '_');

    return [{ id: normalizedId, desc: direction === 'desc' }];
};
