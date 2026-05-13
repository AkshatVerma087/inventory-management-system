import { NextRequest, NextResponse } from "next/server";

import { CreateReservationSchema, ConfirmReservationSchema } from "@/schemas/reservation.schema";
import * as reservationService from "@/services/reservation.services";
import { revalidatePath } from "next/cache";

export async function create(req: NextRequest) {
    try {
        const body = await req.json();

        const parsed = CreateReservationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: parsed.error.flatten().fieldErrors,
                },
                {
                    status: 400,
                }
            );
        }

        const idempotencyKey = req.headers.get("Idempotency-Key") ?? undefined;

        const { productId, warehouseId, quantity } = parsed.data;

        const reservation = await reservationService.reserveInventory(
            productId,
            warehouseId,
            quantity,
            idempotencyKey,
        );

        revalidatePath("/products");

        return NextResponse.json(
            {
                success: true,
                data: reservation,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown error";

        const isConflict =
            message === "Not enough stock available" ||
            message === "Stock not found" ||
            message.includes("lock");

        if (isConflict) {
            return NextResponse.json(
                {
                    success: false,
                    message,
                },
                {
                    status: 409,
                }
            );
        }

        console.error("Error creating reservation:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}

export async function confirm(id: string) {
    const parsed = ConfirmReservationSchema.safeParse({ Id: id });

    if (!parsed.success) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid reservation ID",
                errors: parsed.error.flatten().fieldErrors,
            },
            {
                status: 400,
            }
        );
    }

    try {
        const reservation = await reservationService.confirmReservation(
            parsed.data.Id,
        );

        revalidatePath("/products");

        return NextResponse.json(
            {
                success: true,
                data: reservation,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                success: false,
                message
            },
            {
                status: 400
            }
        );
    }
}

export async function release(id: string) {
    const parsed = ConfirmReservationSchema.safeParse({ Id: id });

    if (!parsed.success) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid reservation ID",
                errors: parsed.error.flatten().fieldErrors,
            },
            {
                status: 400,
            }
        );
    }

    try {
        const reservation = await reservationService.releaseReservation(
            parsed.data.Id,
        );

        revalidatePath("/products");

        return NextResponse.json(
            {
                success: true,
                data: reservation,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({
            success: false,
            message
        },
            {
                status: 400
            }
        );
    }
}
