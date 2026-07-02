const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.tenant.updateMany({
    where: { razorpaySubscriptionId: null },
    data: { subscriptionStatus: 'PENDING' }
  })
  console.log('Updated tenants to PENDING')
}

main().catch(console.error).finally(() => prisma.$disconnect())
