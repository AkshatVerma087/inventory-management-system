import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the Prisma seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: "Mumbai Hub",
        location: "Bhiwandi, Maharashtra",
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Delhi Hub",
        location: "Okhla, New Delhi",
      },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Industrial Barcode Scanner",
        sku: "BCS-IND-100",
        price: new Prisma.Decimal("12999.00"),
        imageUrl: "https://images.example.com/products/barcode-scanner.jpg",
        description: "Handheld scanner for fast warehouse receiving and picking workflows.",
      },
    }),
    prisma.product.create({
      data: {
        name: "Heavy-Duty Packing Tape",
        sku: "TAPE-HD-250",
        price: new Prisma.Decimal("249.00"),
        imageUrl: "https://images.example.com/products/packing-tape.jpg",
        description: "Industrial packing tape for daily outbound dispatch operations.",
      },
    }),
    prisma.product.create({
      data: {
        name: "Handheld RFID Reader",
        sku: "RFID-HH-10",
        price: new Prisma.Decimal("18999.00"),
        imageUrl: "https://images.example.com/products/rfid-reader.jpg",
        description: "Portable RFID reader for cycle counts and rapid inventory audits.",
      },
    }),
  ]);

  await prisma.stockLevel.createMany({
    data: [
      { productId: products[0].id, warehouseId: warehouses[0].id, totalUnits: 25, reservedUnits: 0 },
      { productId: products[0].id, warehouseId: warehouses[1].id, totalUnits: 18, reservedUnits: 0 },
      { productId: products[1].id, warehouseId: warehouses[0].id, totalUnits: 40, reservedUnits: 0 },
      { productId: products[1].id, warehouseId: warehouses[1].id, totalUnits: 22, reservedUnits: 0 },
      { productId: products[2].id, warehouseId: warehouses[0].id, totalUnits: 1, reservedUnits: 0 },
      { productId: products[2].id, warehouseId: warehouses[1].id, totalUnits: 12, reservedUnits: 0 },
    ],
  });

  console.log("Seeded:");
  console.log(`- ${warehouses.length} warehouses`);
  console.log(`- ${products.length} products`);
  console.log("- 6 stock level rows");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });