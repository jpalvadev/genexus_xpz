import { describe, it, expect } from 'vitest';
import { LoginRequestSchema } from '@/modules/auth/types/auth.type';
import { deviceSchema } from '@/modules/devices/types/device.type';
import { PersonSchema } from '@/modules/persons/types/person.type';
import { userSchema } from '@/modules/users/types/user.type';
import { userPermissionRequestSchema } from '@/modules/users/types/userPermission.type';
import { expirationSchema } from '@/modules/expirations/types/expiration.type';

describe('Zod Schema Contracts', () => {
    describe('LoginRequestSchema', () => {
        it('valida con éxito un payload de login correcto', () => {
            const valid = {
                email: 'admin@itrion.com',
                password: 'Password123!',
            };

            const result = LoginRequestSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('falla cuando el email es inválido', () => {
            const invalid = {
                email: 'no-es-un-email',
                password: 'Password123!',
            };

            const result = LoginRequestSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Email inválido');
            }
        });

        it('falla cuando la contraseña tiene menos de 8 caracteres', () => {
            const invalid = {
                email: 'admin@itrion.com',
                password: '123',
            };

            const result = LoginRequestSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    'La contraseña debe tener al menos 8 caracteres',
                );
            }
        });
    });

    describe('deviceSchema', () => {
        it('valida con éxito un dispositivo con campos completos', () => {
            const valid = {
                id: 1,
                name: 'Sensor Humedad 01',
                minTemperature: 15,
                maxTemperature: 30,
                minHumidity: 40,
                maxHumidity: 80,
                sleepSeconds: 3600,
                recipientIds: [1, 2],
                sectorId: 10,
            };

            const result = deviceSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('coerciona strings numéricos a números válidos', () => {
            const validCoerced = {
                id: 1,
                name: 'Sensor Temperatura',
                sleepSeconds: '3600',
                recipientIds: ['10', '20'],
                sectorId: '5',
            };

            const result = deviceSchema.safeParse(validCoerced);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.sleepSeconds).toBe(3600);
                expect(result.data.recipientIds).toEqual([10, 20]);
                expect(result.data.sectorId).toBe(5);
            }
        });

        it('falla si el nombre tiene menos de 2 caracteres', () => {
            const invalid = {
                id: 1,
                name: 'A',
                sleepSeconds: 3600,
                recipientIds: [],
            };

            const result = deviceSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    'El nombre del Dispositivo debe tener al menos 2 caracteres',
                );
            }
        });
    });

    describe('PersonSchema', () => {
        it('valida una persona con email y DNI válidos', () => {
            const valid = {
                id: 1,
                firstName: 'Juan',
                lastName: 'Pérez',
                dni: 35123456,
                email: 'juan.perez@empresa.com',
                isActive: true,
            };

            const result = PersonSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('permite email vacío como string vacío legítimo', () => {
            const validSinEmail = {
                id: 2,
                firstName: 'Maria',
                lastName: 'Lopez',
                dni: 28987654,
                email: '',
            };

            const result = PersonSchema.safeParse(validSinEmail);
            expect(result.success).toBe(true);
        });

        it('falla si el DNI tiene menos de 7 dígitos', () => {
            const invalid = {
                id: 3,
                firstName: 'Carlos',
                lastName: 'Gomez',
                dni: 12345, // Menor a 1.000.000
                email: '',
            };

            const result = PersonSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    'El DNI debe tener al menos 7 dígitos',
                );
            }
        });
    });

    describe('userSchema', () => {
        it('valida con éxito un usuario nuevo con contraseña', () => {
            const valid = {
                id: 1,
                tenantId: 10,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'usuario@itrion.com',
                password: 'password123',
                active: true,
            };

            const result = userSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('permite contraseña vacía o ausente en modo edición', () => {
            const validSinPassword = {
                id: 1,
                tenantId: 10,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'usuario@itrion.com',
                password: '',
                active: true,
            };

            const result = userSchema.safeParse(validSinPassword);
            expect(result.success).toBe(true);
        });

        it('falla si tenantId no se suministra o es cero', () => {
            const invalid = {
                id: 1,
                tenantId: 0,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'usuario@itrion.com',
                active: true,
            };

            const result = userSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('El tenant es requerido');
            }
        });
    });

    describe('userPermissionRequestSchema', () => {
        it('valida con éxito una asignación de permiso', () => {
            const valid = {
                userId: 1,
                moduleId: 2,
                roleId: 3,
                scopeId: 4,
            };

            const result = userPermissionRequestSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('falla si falta moduleId o roleId', () => {
            const invalid = {
                userId: 1,
                moduleId: 0,
                roleId: 0,
            };

            const result = userPermissionRequestSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            expect(result.error?.issues.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('expirationSchema', () => {
        it('valida con éxito una expiración con fecha válida y preprocesamiento', () => {
            const valid = {
                id: 1,
                title: 'Mantenimiento Preventivo Caldera',
                expiryDate: '2026-11-15T12:00:00',
                description: 'Revisión semestral',
                isActive: true,
                recurrenceDays: 180,
                emails: 'admin@itrion.com,tecnico@itrion.com',
                recipientIds: [1, 2],
                reminderIds: [7, 1],
            };

            const result = expirationSchema.safeParse(valid);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.expiryDate).toBe('2026-11-15');
            }
        });

        it('falla si el título tiene menos de 6 caracteres', () => {
            const invalid = {
                id: 1,
                title: 'Corto',
                expiryDate: '2026-11-15',
                isActive: true,
                recurrenceDays: 0,
                recipientIds: [],
                reminderIds: [],
            };

            const result = expirationSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    'El título es requerido y debe contar con al menos 6 caracteres',
                );
            }
        });
    });
});

