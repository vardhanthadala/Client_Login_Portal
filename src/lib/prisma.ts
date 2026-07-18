import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pgPool: pg.Pool;
};

function createPrismaClient() {
  let pool = globalForPrisma.pgPool;
  if (!pool) {
    pool = new pg.Pool({ 
      connectionString,
      max: 3, // Restrict connections in dev to avoid hitting the 15 limit
      idleTimeoutMillis: 10000
    });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.pgPool = pool;
    }
  }
  
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ 
    adapter,
    log: ['query'] 
  })
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

