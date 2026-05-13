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
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    }

    const lockKey = `${productId}--${warehouseId}`;

    return withLock(lockKey, async () => {
        const stock = await stockRepository.findStock(
            productId,
            warehouseId,
        );

        if (!stock) {
            throw new Error("Stock not found");
        }

        const availableUnits = stock.totalUnits - stock.reservedUnits;

        if (availableUnits < quantity) {
            throw new Error("Not enough stock available");
        }

        const reservation = await reservationRepository.createReservation(
            {
                productId,
                warehouseId,
                quantity,
                status: ReservationStatus.PENDING,
                idempotencyKey,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        );

        await stockRepository.incrementReservationQuantity(
            productId,
            warehouseId,
            quantity,
        );

        if (idempotencyKey) {
            await redis.set(idempotencyKey, JSON.stringify(reservation), {
                ex: 15 * 60, // expire after 15 minutes
            });
        }

        return reservation;
    });
}

export async function confirmReservation(reservationId: string) {
    const reservation = await reservationRepository.findReservationById(reservationId);

    if (!reservation) {
        throw new Error("Reservation not found");
    }

    const isExpired = reservation.expiresAt < new Date();
    const isPending = reservation.status === ReservationStatus.PENDING;

    if (isExpired || !isPending) {
        if (isExpired && isPending) {
            await stockRepository.decrementReservationQuantity(
                reservation.productId,
                reservation.warehouseId,
                reservation.quantity
            );

            await reservationRepository.updateReservationStatus(
                reservationId,
                ReservationStatus.RELEASED,
                new Date()
            );
        }

        throw new Error("Reservation expired or invalid");
    }

    const updatedReservation = await reservationRepository.updateReservationStatus(
        reservationId,
        ReservationStatus.CONFIRMED,
        new Date()
    );

    // This decrements both totalUnits and reservedUnits in one call
    await stockRepository.decrementTotal(
        reservation.productId,
        reservation.warehouseId,
        reservation.quantity
    );

    return updatedReservation;
}

export async function releaseReservation(reservationId: string) {
    const reservation = await reservationRepository.findReservationById(reservationId);

    if (!reservation) {
        throw new Error("Reservation not found");
    }

    if (reservation.status !== ReservationStatus.PENDING) {
        throw new Error("Reservation is not in PENDING state");
    }

    const updatedReservation = await reservationRepository.updateReservationStatus(
        reservationId,
        ReservationStatus.RELEASED,
        new Date()
    );

    await stockRepository.decrementReservationQuantity(
        reservation.productId,
        reservation.warehouseId,
        reservation.quantity
    );

    return updatedReservation;
}

export async function releaseExpiredReservations() {
    const expiredReservations = await reservationRepository.findExpiredReservations();

    for (const reservation of expiredReservations) {
        await reservationRepository.updateReservationStatus(
            reservation.id,
            ReservationStatus.RELEASED,
            new Date()
        );

        await stockRepository.decrementReservationQuantity(
            reservation.productId,
            reservation.warehouseId,
            reservation.quantity
        );
    }

    return { releaseCount: expiredReservations.length };
}