import { PrismaClient } from "@prisma/client";


const prismaClientSingleton = () => {
    return new PrismaClient();
}

type prismaClientSingletonType = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof prismaClientSingleton> };

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

