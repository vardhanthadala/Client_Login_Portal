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
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: { clientProfile: true }
    });

    console.log("=== USERS WITH ROLE CLIENT ===");
    clients.forEach(c => {
      console.log(`User ID: ${c.id}, Email: ${c.email}`);
      console.log(`  ClientProfile ID: ${c.clientProfile ? c.clientProfile.id : 'NONE'}`);
    });

    const messages = await prisma.message.findMany();
    console.log("\n=== MESSAGES IN DB ===");
    console.log(`Total messages: ${messages.length}`);
    
    // Group messages by clientProfileId
    const messageGroups = {};
    messages.forEach(m => {
      if (!messageGroups[m.clientProfileId]) messageGroups[m.clientProfileId] = 0;
      messageGroups[m.clientProfileId]++;
    });

    console.log("\n=== MESSAGE GROUPS BY CLIENT_PROFILE_ID ===");
    Object.entries(messageGroups).forEach(([id, count]) => {
      console.log(`ClientProfileID on Message: ${id} (Count: ${count})`);
      
      const matchedClient = clients.find(c => c.clientProfile && c.clientProfile.id === id);
      if (matchedClient) {
        console.log(`  -> MATCHES ClientProfile for User: ${matchedClient.email}`);
      } else {
        console.log(`  -> MISMATCH: No ClientProfile found with this ID!`);
      }
    });

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
