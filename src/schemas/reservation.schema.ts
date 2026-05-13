import {z} from 'zod';

export const CreateReservationSchema = z.object({
    productId: z.string().cuid(),
    warehouseId: z.string().cuid(),
    quantity: z.number().int().min(1).max(100)
});

export const ConfirmReservationSchema = z.object({
    Id: z.string().cuid()
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;