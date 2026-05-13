import * as productController from '@/controllers/product.controller'

export async function GET() {
    return productController.getProducts();
}