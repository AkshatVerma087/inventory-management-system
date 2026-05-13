import {db} from '@/lib/db'

export async function findAllWarehouses(){
    return await db.warehouse.findMany();

}

export async function findWarehouseById(id: string){
    return await db.warehouse.findUnique({
        where: {id}
    })
}