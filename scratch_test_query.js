require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Testing exact Prisma query from getMessagesAction...");
    const clientProfileId = 'a989a7ca-e3a0-494e-adec-32495606961f';
    
    const messages = await prisma.message.findMany({
      where: { clientProfileId },
      include: {
        sender: {
          select: { id: true, role: true, email: true, image: true, clientProfile: { select: { clientName: true, profileImageUrl: true } } }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    console.log(`Query returned ${messages.length} messages.`);
    if (messages.length > 0) {
      console.log("Sample message sender ID:", messages[0].senderId);
      console.log("Sample message sender object:", messages[0].sender);
    }
  } catch (e) {
    console.error("Prisma Query Failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
