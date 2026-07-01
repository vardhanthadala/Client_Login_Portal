import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DIRECT_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrismaDev = global as unknown as { prismaDev: PrismaClient };

export const prisma =
  globalForPrismaDev.prismaDev ||
  new PrismaClient({ adapter, log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrismaDev.prismaDev = prisma;
