import { describe, it, expect } from 'vitest';
import { formatDateTime, formatDate, formatTime } from './dateTime';

describe('dateTime utilities', () => {
    describe('formatDateTime', () => {
        it('formatea un objeto Date en 24 horas (dd/MM/yyyy HH:mm)', () => {
            const d = new Date(2026, 9, 12, 15, 30, 45); // 12 de Octubre de 2026, 15:30:45
            expect(formatDateTime(d)).toBe('12/10/2026 15:30');
        });

        it('mantiene las 24 horas sin sufijos AM/PM ni reducción a 12 horas en medianoche y noche', () => {
            const midnight = new Date(2026, 0, 1, 0, 5, 0);
            expect(formatDateTime(midnight)).toBe('01/01/2026 00:05');

            const night = new Date(2026, 0, 1, 23, 59, 0);
            expect(formatDateTime(night)).toBe('01/01/2026 23:59');
        });

        it('soporta la opción includeSeconds', () => {
            const d = new Date(2026, 4, 25, 8, 9, 5);
            expect(formatDateTime(d, { includeSeconds: true })).toBe('25/05/2026 08:09:05');
        });

        it('soporta separador personalizado', () => {
            const d = new Date(2026, 4, 25, 14, 20);
            expect(formatDateTime(d, { separator: ', ' })).toBe('25/05/2026, 14:20');
        });

        it('retorna cadena vacía para valores nulos, indefinidos o fechas inválidas', () => {
            expect(formatDateTime(null)).toBe('');
            expect(formatDateTime(undefined)).toBe('');
            expect(formatDateTime('')).toBe('');
            expect(formatDateTime('fecha-invalida')).toBe('');
        });
    });

    describe('formatDate', () => {
        it('formatea correctamente dd/MM/yyyy', () => {
            const d = new Date(2026, 2, 8); // 8 de Marzo de 2026
            expect(formatDate(d)).toBe('08/03/2026');
        });

        it('retorna cadena vacía para entradas inválidas', () => {
            expect(formatDate(null)).toBe('');
            expect(formatDate(undefined)).toBe('');
            expect(formatDate('foo')).toBe('');
        });
    });

    describe('formatTime', () => {
        it('formatea cadenas de hora existentes a 2 dígitos (HH:mm)', () => {
            expect(formatTime('15:30')).toBe('15:30');
            expect(formatTime('8:5')).toBe('08:05');
            expect(formatTime('23:45')).toBe('23:45');
            expect(formatTime('0:0')).toBe('00:00');
        });

        it('formatea un objeto Date en 24 horas', () => {
            const d = new Date(2026, 0, 1, 19, 45, 12);
            expect(formatTime(d)).toBe('19:45');
            expect(formatTime(d, { includeSeconds: true })).toBe('19:45:12');
        });

        it('retorna cadena vacía para entradas nulas o inválidas', () => {
            expect(formatTime(null)).toBe('');
            expect(formatTime(undefined)).toBe('');
            expect(formatTime('invalido')).toBe('');
        });
    });
});

