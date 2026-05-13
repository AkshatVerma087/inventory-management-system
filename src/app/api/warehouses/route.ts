import * as warehouseController from '@/controllers/warehouse.controller'

export async function GET() {
    return warehouseController.getWarehouses();
}