import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const db = globalForPrisma.db ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.db = db;
}