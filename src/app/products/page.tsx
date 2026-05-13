import * as productService from "@/services/product.services";
import { ProductGrid } from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await productService.getAllProducts();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
