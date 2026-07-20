const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const clientProfileId = "a989a7ca-e3a0-494e-adec-32495606961f";
    
    const messages = await prisma.message.findMany({
      where: { clientProfileId },
      include: {
        sender: {
          select: { id: true, role: true, email: true, image: true, clientProfile: { select: { clientName: true, profileImageUrl: true } } }
        }
      },
      orderBy: { createdAt: "asc" }
    })
    
    console.log("Fetched messages length:", messages.length);

    if (messages.length > 0) {
       console.log("First message:", messages[0].content);
       console.log("First message sender:", messages[0].senderId);
    }
    
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      select: { tenantId: true }
    })
    
    console.log("TenantId:", clientProfile?.tenantId);
    
  } catch(e) {
    console.error("Prisma Error during fetch:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
