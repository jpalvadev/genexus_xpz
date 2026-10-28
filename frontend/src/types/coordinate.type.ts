import * as z from 'zod';

export const coordinateSchema = z.object({
    lat: z.number(),
    lng: z.number(),
    message: z.string().optional(),
});

export type Coordinate = z.infer<typeof coordinateSchema>;
