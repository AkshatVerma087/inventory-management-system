"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";

type StockLevel = {
  id: string;
  warehouseId: string;
  availableUnits: number;
  warehouse: { id: string; name: string };
};

type Product = {
  id: string;
  name: string;
  sku: string;
  price: string;
  stockLevels: StockLevel[];
};

export function ProductGrid({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);

  useEffect(() => {
    setProducts(initial);
  }, [initial]);

  function onReserved(productId: string, warehouseId: string, quantity: number) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockLevels: p.stockLevels.map((sl) =>
                sl.warehouseId === warehouseId
                  ? { ...sl, availableUnits: sl.availableUnits - quantity }
                  : sl
              ),
            }
          : p
      )
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onReserved={onReserved} />
      ))}
    </div>
  );
}
