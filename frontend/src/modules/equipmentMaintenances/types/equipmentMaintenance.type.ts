import type { Filters } from '@/types/table.type';
import { dateNotInFuture } from '@/utils/validations';
import { z } from 'zod';

export const equipmentMaintenanceType = {
    Preventivo: 1,
    Correctivo: 2,
} as const;

export const equipmentMaintenanceStatus = {
    Pendiente: 1,
    Completado: 2,
} as const;

const equipmentMaintenanceEquipmentItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    status: z.number(),
});

const equipmentMaintenancePersonSchema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    dni: z.number(),
    email: z.email().or(z.literal('')), // Maneja el string vacío del backend
});

export const equipmentMaintenanceResponseSchema = z.object({
    id: z.number(),
    date: z.string(),
    type: z.enum(equipmentMaintenanceType),
    status: z.enum(equipmentMaintenanceStatus),
    activity: z.string().max(255).default(''),
    closedAt: z.string().optional(),
    person: equipmentMaintenancePersonSchema,
    equipmentItem: equipmentMaintenanceEquipmentItemSchema,
});

export const equipmentMaintenanceSchema = z
    .object({
        id: z.number(),
        date: z.preprocess(
            (arg) =>
                arg instanceof Date
                    ? arg.toLocaleDateString('en-CA')
                    : typeof arg === 'string' && arg
                      ? new Date(arg).toLocaleDateString('en-CA')
                      : undefined,
            z
                .string({ message: 'La fecha es obligatoria' })
                .min(1, 'La fecha es obligatoria')
                .refine(...dateNotInFuture()),
        ),
        type: z.preprocess(
            (val) => Number(val),
            z.enum(equipmentMaintenanceType),
        ),
        status: z.preprocess(
            (val) => Number(val),
            z.enum(equipmentMaintenanceStatus),
        ),
        activity: z
            .string()
            .max(255, 'La actividad no puede tener más de 255 caracteres')
            .optional(),
        closedAt: z.preprocess(
            (arg) =>
                arg instanceof Date
                    ? arg.toLocaleDateString('en-CA')
                    : typeof arg === 'string' && arg
                      ? new Date(arg).toLocaleDateString('en-CA')
                      : undefined,
            z
                .string()
                .refine(...dateNotInFuture())
                .optional(),
        ),
        equipmentItemId: z.coerce.number().min(1, 'Debe ingresar el Equipo'),
        personId: z.coerce.number().min(1, 'Debe ingresar un Responsable'),
        equipmentStatus: z.number().optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.status === equipmentMaintenanceStatus.Completado &&
            !data.closedAt
        ) {
            ctx.addIssue({
                code: 'custom',
                message:
                    'La fecha de cierre es obligatoria cuando el estado es Completado',
                path: ['closedAt'],
            });
        }
        if (data.closedAt && data.date > data.closedAt) {
            ctx.addIssue({
                code: 'custom',
                message:
                    'La fecha de cierre no puede ser anterior a la fecha de creación.',
                path: ['closedAt'],
            });
        }
    });

export type EquipmentMaintenance = z.infer<typeof equipmentMaintenanceSchema>;
export type EquipmentMaintenanceResponse = z.infer<
    typeof equipmentMaintenanceResponseSchema
>;

export type EquipmentMaintenanceFilters = Filters<EquipmentMaintenanceResponse>;
