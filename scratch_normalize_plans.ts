import { config } from 'dotenv'
config({ path: '.env' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Normalizing subscription plans...");
  
  const tenants = await prisma.tenant.findMany();
  let updated = 0;
  
  for (const tenant of tenants) {
    const plan = (tenant.subscriptionPlan || "FREE").toUpperCase().trim();
    let newPlan = "FREE";
    
    if (plan.includes("MONTHLY")) {
      newPlan = "PREMIUM_MONTHLY";
    } else if (plan.includes("YEARLY")) {
      newPlan = "PREMIUM_YEARLY";
    } else if (plan.includes("PREMIUM") || plan.includes("VIP")) {
      // Default ambiguous premium/vip ones to monthly
      newPlan = "PREMIUM_MONTHLY";
    } else {
      newPlan = "FREE";
    }
    
    if (tenant.subscriptionPlan !== newPlan) {
      console.log(`Updating tenant ${tenant.name}: '${tenant.subscriptionPlan}' -> '${newPlan}'`);
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { subscriptionPlan: newPlan }
      });
      updated++;
    }
  }
  
  console.log(`Successfully normalized ${updated} tenants.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
