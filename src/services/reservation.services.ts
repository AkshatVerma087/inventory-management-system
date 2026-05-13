import { db } from "@/lib/db";
import * as stockRepository from "@/repositories/stock.repositories";
import * as reservationRepository from "@/repositories/reservation.repository";

import { withLock } from "@/lib/lock";
import { ReservationStatus } from "@prisma/client";

import { redis } from "@/lib/redis";

export async function reserveInventory(
    productId: string,
    warehouseId: string,
    quantity: number,
    idempotencyKey?: string,
) {
    if (idempotencyKey) {
        const cached = await redis.get(idempotencyKey);

        if (cached) {
            return JSON.parse(cached);
        }
    }

    const lockKey = `${productId}--${warehouseId}`;

    return withLock(lockKey, async () => {

        const reservation = await db.$transaction(async (transaction) => {

            const stockRows = await stockRepository.findWithLock(
                productId,
                warehouseId,
                transaction
            );

            const stock = stockRows[0];
            if (!stock) {
                throw new Error("Stock not found");
            }

            const availableUnits = stock.totalUnits - stock.reservedUnits;

            if (availableUnits < quantity) {
                throw new Error("Not enough stock available");
            }


            const createdReservation = await reservationRepository.createReservation(
                {
                    productId,
                    warehouseId,
                    quantity,

                    status: ReservationStatus.PENDING,
                    idempotencyKey,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
                },
                transaction,
            );

            await stockRepository.incrementReservationQuantity(
                productId,
                warehouseId,
                quantity,
                transaction,
            );

            return createdReservation;
        });

        if (idempotencyKey) {
            await redis.set(idempotencyKey, JSON.stringify(reservation), {
                ex: 15 * 60, // expire after 15 minutes
            });
        }

        return reservation;
    });
}


export async function confirmReservation(reservationId: string) {

    const reservation =
        await reservationRepository.findReservationById(
            reservationId
        );

    if (!reservation) {
        throw new Error("Reservation not found");
    }

    const isExpired =
        reservation.expiresAt < new Date();

    const isPending =
        reservation.status ===
        ReservationStatus.PENDING;

    
    //   release if
    //   expired + still pending
    

    if (isExpired || !isPending) {

        if (isExpired && isPending) {

            await db.$transaction(
                async (transaction) => {

                    await stockRepository.decrementReservationQuantity(
                        reservation.productId,
                        reservation.warehouseId,
                        reservation.quantity,
                        transaction
                    );

                    await reservationRepository.updateReservationStatus(
                        reservationId,
                        ReservationStatus.RELEASED,
                        new Date(),
                        transaction,
                    );
                }
            );
        }

        throw new Error(
            "Reservation expired or invalid"
        );
    }

    return db.$transaction(
        async (transaction) => {

            const updatedReservation =
                await reservationRepository.updateReservationStatus(
                    reservationId,
                    ReservationStatus.CONFIRMED,
                    new Date(),
                    transaction,
                );

            await stockRepository.decrementReservationQuantity(
                reservation.productId,
                reservation.warehouseId,
                reservation.quantity,
                transaction
            );

            await stockRepository.decrementTotal(
                reservation.productId,
                reservation.warehouseId,
                reservation.quantity,
                transaction
            );

            return updatedReservation;
        }
    );
}

export async function releaseReservation(reservationId: string) {
    const reservation = await reservationRepository.findReservationById(reservationId);

    if (!reservation) {
        throw new Error("Reservation not found");
    }

    if (reservation.status !== ReservationStatus.PENDING) {
        throw new Error("Reservation is not in PENDING state");
    }

    return db.$transaction(async (transaction) => {
        const updatedReservation = await reservationRepository.updateReservationStatus(
            reservationId,
            ReservationStatus.RELEASED,
            new Date(),
            transaction
        );

        await stockRepository.decrementReservationQuantity(
            reservation.productId,
            reservation.warehouseId,
            reservation.quantity,
            transaction
        );

        return updatedReservation;
    })
}

export async function releaseExpiredReservations(){
    const expiredReservations = await reservationRepository.findExpiredReservations();

    for(const reservation of expiredReservations) {
        await db.$transaction(async (transaction) => {
            await reservationRepository.updateReservationStatus(
                reservation.id,
                ReservationStatus.RELEASED,
                new Date(),
                transaction
            );

            await stockRepository.decrementReservationQuantity(
                reservation.productId,
                reservation.warehouseId,
                reservation.quantity,
                transaction
            );
        })
    }

    return {releaseCount: expiredReservations.length};
}