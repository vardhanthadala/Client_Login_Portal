const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const tenants = await prisma.tenant.findMany()
  if (tenants.length > 0) {
    const target = tenants[0]
    await prisma.tenant.update({
      where: { id: target.id },
      data: {
        subscriptionEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        subscriptionStatus: 'EXPIRED'
      }
    })
    console.log(`Successfully expired tenant: ${target.name}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
