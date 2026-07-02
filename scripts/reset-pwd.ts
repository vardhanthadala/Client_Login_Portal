import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function reset() {
  const email = 'thadalavardhangoud@gmail.com'
  const user = await prisma.user.findUnique({ where: { email } })
  
  if (user) {
    const passwordHash = await bcrypt.hash('password123', 10)
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    })
    console.log(`Successfully reset password for ${email} to 'password123'`)
  } else {
    console.log('User not found in the database!')
  }
}

reset()
