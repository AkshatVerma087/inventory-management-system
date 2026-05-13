import {db} from '@/lib/db'

import {Prisma, ReservationStatus} from "@prisma/client";
import { timeStamp } from 'console';
import { includes } from 'zod';

export async function CreateReservation( data: Prisma.ReservationCreateInput, transaction: Prisma.TransactionClient) {
    return transaction.reservation.create({ data });
}

export async function findReservationById(id: string){
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


export async function findReservationByIdempotencyKey(idempotencyKey: string){
    return await db.reservation.findUnique({
        where: {
            idempotencyKey
        }
    });
}

export async function updateReservationStatus(id: string, status: ReservationStatus, timestamp: Date, transaction: Prisma.TransactionClient){
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

async function findExpiredReservations(){
    return db.$transaction.findMany({
        where: {
            status: 'PENDING',
            expiredAt: {
                lt: new Date()
            }
        },

        include: {
            product: true,
            warehouse: true
        }
    })
}