const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const clientProfileId = "a989a7ca-e3a0-494e-adec-32495606961f";
    
    // Check if the profile exists first
    const profile = await prisma.clientProfile.findUnique({ where: { id: clientProfileId }});
    console.log("Profile:", profile?.id);

    // Get the actual user ID of this profile to simulate their token
    const userId = profile?.userId;
    console.log("User ID:", userId);

    if (userId) {
      const message = await prisma.message.create({
        data: {
          clientProfileId,
          senderId: userId,
          content: "Trace testing via JS script",
        },
        include: {
          sender: {
            select: { id: true, role: true, email: true, image: true, clientProfile: { select: { clientName: true, profileImageUrl: true } } }
          }
        }
      });
      console.log("Success! Message ID:", message.id);
    } else {
      console.log("Could not find user ID to send message as.");
    }

  } catch(e) {
    console.error("Prisma Error during create:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
