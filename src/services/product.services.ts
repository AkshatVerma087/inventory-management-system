import * as productRepository
from "@/repositories/product.repositories";

import { ProductWithStockLevels } from "@/types";

export async function getAllProducts() {
  const products = await productRepository.findAllProducts();

  return products.map((product) => ({
    ...product,
    price: product.price.toString(),

    stockLevels: product.stockLevels.filter(
          (stockLevel) => stockLevel.totalUnits > 0).map((stockLevel) => ({...stockLevel,
          availableUnits:
            stockLevel.totalUnits -
            stockLevel.reservedUnits,
        })),
  }));
}