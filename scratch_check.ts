import { config } from 'dotenv'
config({ path: '.env' })
import { prisma } from './src/lib/prisma'

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "vardhan.thadala23@gmail.com" }
  })
  console.log(user)
}

main().catch(console.error).finally(() => prisma.$disconnect())
