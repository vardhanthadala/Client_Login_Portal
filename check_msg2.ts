import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.message.count();
  console.log("Total messages in DB:", count);
  const messages = await prisma.message.findMany();
  console.log("Messages:", messages.map(m => m.id));
}
main().catch(console.error).finally(() => prisma.$disconnect());
