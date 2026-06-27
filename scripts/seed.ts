import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@dexze.com" },
    update: {},
    create: {
      email: "admin@dexze.com",
      passwordHash,
      role: "ADMIN",
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
