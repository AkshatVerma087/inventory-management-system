import { db } from "@/lib/db";

export async function findStock(
    productId: string,
    warehouseId: string,
) {
    return db.stockLevel.findFirst({
        where: { productId, warehouseId },
    });
}

export async function incrementReservationQuantity(
    productId: string,
    warehouseId: string,
    quantity: number,
) {
    return db.stockLevel.update({
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
) {
    return db.stockLevel.update({
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
) {
    return db.stockLevel.update({
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
) {
    return db.stockLevel.update({
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
