import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { firstLetterUppercase, dateNotInFuture } from './validations';

describe('validations', () => {
    describe('firstLetterUppercase', () => {
        it('devuelve true si la primera letra es mayúscula', () => {
            const [validate] = firstLetterUppercase();
            expect(validate('Juan')).toBe(true);
            expect(validate('Dispositivo')).toBe(true);
        });

        it('devuelve false si la primera letra es minúscula', () => {
            const [validate] = firstLetterUppercase();
            expect(validate('juan')).toBe(false);
            expect(validate('dispositivo')).toBe(false);
        });

        it('soporta caracteres con tildes y diacríticos del español', () => {
            const [validate] = firstLetterUppercase();
            expect(validate('Ángel')).toBe(true);
            expect(validate('ángel')).toBe(false);
            expect(validate('Ñandú')).toBe(true);
            expect(validate('ñandú')).toBe(false);
        });

        it('documenta el comportamiento con strings vacíos y números', () => {
            const [validate] = firstLetterUppercase();
            // charAt(0) de string vacío es "", y "".toUpperCase() es "" -> true.
            // Esto es estándar: la validación de presencia (required) es responsabilidad de otro validador.
            expect(validate('')).toBe(true);
            // Un número al inicio no tiene variante de caja -> charAt(0) === charAt(0).toUpperCase() -> true
            expect(validate('123calle')).toBe(true);
        });

        it('devuelve el mensaje por defecto o uno personalizado', () => {
            const [, defaultMsg] = firstLetterUppercase();
            expect(defaultMsg).toBe('La primer letra debe ser mayúscula');

            const [, customMsg] = firstLetterUppercase('Debe comenzar con mayúscula');
            expect(customMsg).toBe('Debe comenzar con mayúscula');
        });
    });

    describe('dateNotInFuture', () => {
        const frozenNow = new Date('2026-10-09T12:00:00.000Z');

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(frozenNow);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('devuelve true para fechas en el pasado', () => {
            const [validate] = dateNotInFuture();
            expect(validate('2026-10-08T12:00:00.000Z')).toBe(true);
            expect(validate('2025-01-01T00:00:00.000Z')).toBe(true);
        });

        it('devuelve true para la fecha y hora actual exacta', () => {
            const [validate] = dateNotInFuture();
            expect(validate('2026-10-09T12:00:00.000Z')).toBe(true);
        });

        it('devuelve false para fechas en el futuro', () => {
            const [validate] = dateNotInFuture();
            expect(validate('2026-10-09T12:00:01.000Z')).toBe(false);
            expect(validate('2026-10-10T00:00:00.000Z')).toBe(false);
            expect(validate('2027-01-01T00:00:00.000Z')).toBe(false);
        });

        it('devuelve el mensaje de error por defecto o personalizado', () => {
            const [, defaultMsg] = dateNotInFuture();
            expect(defaultMsg).toBe('La fecha seleccionada no puede ser posterior al día de hoy');

            const [, customMsg] = dateNotInFuture('Fecha inválida');
            expect(customMsg).toBe('Fecha inválida');
        });
    });
});

