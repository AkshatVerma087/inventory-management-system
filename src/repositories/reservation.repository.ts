import { db } from '@/lib/db'

import { Prisma, ReservationStatus } from "@prisma/client";


export async function createReservation(data: Prisma.ReservationUncheckedCreateInput, transaction: Prisma.TransactionClient) {
    return transaction.reservation.create({ data });
}

export async function findReservationById(id: string) {
    return await db.reservation.findUnique({
        where: {
            id
        },
        include: {
            product: true,
            warehouse: true
        }
    });
}


export async function findReservationByIdempotencyKey(idempotencyKey: string) {
    return await db.reservation.findUnique({
        where: {
            idempotencyKey
        }
    });
}

export async function updateReservationStatus(id: string, status: ReservationStatus, timestamp: Date, transaction: Prisma.TransactionClient) {
    return transaction.reservation.update({
        where: {
            id
        },
        data: {
            status,

            confirmedAt: status === 'CONFIRMED' ? timestamp : undefined,
            releasedAt: status === 'RELEASED' ? timestamp : undefined,
        }
    })
}

export async function findExpiredReservations() {
    return db.reservation.findMany({
        where: {
            status: 'PENDING',
            expiresAt: {
                lt: new Date()
            }
        },

        include: {
            product: true,
            warehouse: true
        }
    })
}