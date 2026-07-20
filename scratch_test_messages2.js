require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL ? "Exists" : "Missing");
  
  const pool = new pg.Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 3
  });
  
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const messages = await prisma.message.findMany();
    console.log('Total messages in DB:', messages.length);
    if (messages.length > 0) {
      console.log('Sample message ClientProfileId:', messages[0].clientProfileId);
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
