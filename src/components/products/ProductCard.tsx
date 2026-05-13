import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReserveDialog } from "./ReserveDialog";

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

export function ProductCard({
  product,
  onReserved,
}: {
  product: Product;
  onReserved: (productId: string, warehouseId: string, quantity: number) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          <p className="font-medium">₹{product.price}</p>
        </div>

        <div className="space-y-1">
          {product.stockLevels.map((sl) => (
            <div key={sl.id} className="flex items-center justify-between text-sm">
              <span>{sl.warehouse.name}</span>
              <Badge variant={sl.availableUnits > 0 ? "default" : "destructive"}>
                {sl.availableUnits}
              </Badge>
            </div>
          ))}
        </div>

        <ReserveDialog
          productId={product.id}
          warehouses={product.stockLevels.map((sl) => ({
            id: sl.warehouseId,
            name: sl.warehouse.name,
            available: sl.availableUnits,
          }))}
          onReserved={onReserved}
        />
      </CardContent>
    </Card>
  );
}
