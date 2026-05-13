// import {db} from '@/lib/db'
import { Prisma } from "@prisma/client";

export async function incrementReservationQuantity(
    productId: string,
    warehouseId: string,
    quantity: number,
    transaction: Prisma.TransactionClient
) {
    return transaction.stockLevel.update({
        where: {
            productId_warehouseId: {
                productId,
                warehouseId
            }
        },


        data: {
            reservedUnits: {
                increment: quantity
            },
        },
    });
}


export async function decrementReservationQuantity(
    productId: string,
    warehouseId: string,
    quantity: number,
    transaction: Prisma.TransactionClient
) {
    return transaction.stockLevel.update({
        where: {
            productId_warehouseId: {
                productId,
                warehouseId
            }
        },


        data: {
            reservedUnits: {
                decrement: quantity
            },
        },
    });
}



export async function decrementTotal(
    productId: string,
    warehouseId: string,
    quantity: number,
    transaction: Prisma.TransactionClient
) {
    return transaction.stockLevel.update({
        where: {
            productId_warehouseId: {
                productId,
                warehouseId
            }
        },


        data: {
            totalUnits: {
                decrement: quantity
            },
            reservedUnits: {
                decrement: quantity
            },
        },
    });
}


export async function incrementTotal(
    productId: string,
    warehouseId: string,
    quantity: number,
    transaction: Prisma.TransactionClient
) {
    return transaction.stockLevel.update({
        where: {
            productId_warehouseId: {
                productId,
                warehouseId
            }
        },


        data: {
            totalUnits: {
                increment: quantity
            },
            reservedUnits: {
                increment: quantity
            },
        },
    });
}
