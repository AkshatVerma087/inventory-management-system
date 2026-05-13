import * as warehouseRepository
from "@/repositories/warehouse.repositories";



export async function getAllWarehouses() {

    return await warehouseRepository.findAllWarehouses();
}



export async function getWarehouseById(
    id: string
) {

    return await warehouseRepository.findWarehouseById(
        id
    );
}