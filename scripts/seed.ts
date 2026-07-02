import "dotenv/config"
import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const passwordHash = await bcrypt.hash("8639504644", 10)
  
  const superadmin = await prisma.user.upsert({
    where: { email: "vardhan.thadala23@gmail.com" },
    update: { role: "SUPER_ADMIN", passwordHash },
    create: {
      email: "vardhan.thadala23@gmail.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  })

  console.log({ superadmin })
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
