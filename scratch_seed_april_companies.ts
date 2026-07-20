import { config } from 'dotenv'
config({ path: '.env' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const aprilDate = new Date('2026-04-10T10:00:00Z')
  const juneDate = new Date('2026-06-10T10:00:00Z')

  // Company 1: Yearly plan from April
  const t1 = await prisma.tenant.create({
    data: {
      name: "April Yearly Corp",
      subscriptionPlan: "PREMIUM_YEARLY",
      subscriptionStatus: "ACTIVE",
      subscriptionStart: aprilDate,
      createdAt: aprilDate 
    }
  })
  console.log(`Created Yearly Company: ${t1.id}`)

  // Company 2: Monthly plan from April, expired in June
  const t2 = await prisma.tenant.create({
    data: {
      name: "April Monthly Expired",
      subscriptionPlan: "PREMIUM_MONTHLY",
      subscriptionStatus: "EXPIRED",
      subscriptionStart: aprilDate,
      subscriptionEnd: juneDate,
      createdAt: aprilDate
    }
  })
  console.log(`Created Expired Monthly Company: ${t2.id}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
