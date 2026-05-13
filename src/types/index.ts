import {
    Product,
    Reservation,
    StockLevel,
    Warehouse,
} from '@prisma/client';

export type StockLevelWithWarehouse = StockLevel & {
    warehouse: Warehouse;
    availableQuantity: number;
};

export type ProductWithStockLevels = Product & {
    stockLevels: StockLevelWithWarehouse[];
};

export type ReservationWithProductAndWarehouse = Reservation & {
    product: Product;
    warehouse: Warehouse;
};
