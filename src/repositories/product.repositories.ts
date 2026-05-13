import {db} from  '@/lib/db'

export async function findAllProducts(){
    return await db.product.findMany({
        include: {
            stockLevels: {
                include: {
                    warehouse: true
                }
            }  
        }
    })
}

export async function findProductById(id: string){
    return await db.product.findUnique({
        where: {id},
        include: {
            stockLevels: {
                include: {
                    warehouse: true
                }
            }
        }
    })
}

