const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const profiles = await prisma.clientProfile.findMany();
  console.log(profiles);
}
main().catch(console.error).finally(() => prisma.$disconnect());
