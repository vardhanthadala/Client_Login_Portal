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
    const clients = await prisma.clientProfile.findMany({
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
    
    console.log("Clients and message counts:");
    clients.forEach(c => {
      console.log(`- ${c.clientName} (${c.id}): ${c._count.messages} messages`);
    });
  } catch(e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
