import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
require("dotenv").config({ path: ".env" })
require("dotenv").config({ path: ".env.local" })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function run() {
  try {
    const clientProfileId = "a989a7ca-e3a0-494e-adec-32495606961f"
    const message = await prisma.message.create({
      data: {
        clientProfileId,
        senderId: "test", // This will fail foreign key constraint if senderId 'test' doesn't exist
        content: "Trace testing",
      }
    })
    console.log("Success", message)
  } catch(e) {
    console.error("Prisma Error:", e)
  } finally {
    await prisma.$disconnect()
  }
}
run()
