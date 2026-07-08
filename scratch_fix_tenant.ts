import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Finding admin users without a tenant...')
  
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      tenantId: null
    }
  })
  
  if (admins.length === 0) {
    console.log('No admin users without a tenant found.')
    return
  }
  
  console.log(`Found ${admins.length} admin users without a tenant. Creating a tenant for them...`)
  
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default Agency',
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE',
      subscriptionStart: new Date(),
    }
  })
  
  console.log(`Created tenant with ID: ${tenant.id}`)
  
  for (const admin of admins) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { tenantId: tenant.id }
    })
    console.log(`Assigned tenant ${tenant.id} to admin ${admin.email}`)
  }
  
  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
