const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.message.findMany();
  console.log('Total messages in DB:', messages.length);
  if (messages.length > 0) {
    console.log('Sample message ID:', messages[0].id);
    console.log('Sample message ClientProfileId:', messages[0].clientProfileId);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
