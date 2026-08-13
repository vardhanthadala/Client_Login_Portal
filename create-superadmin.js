const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://postgres.sqqsongjnhfnzcnucpqe:8639504644Ab%2B%2B%2B%2B@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'vardhan.thadala23@gmail.com';
  const password = '86395Ab+';
  
  const existing = await prisma.user.findFirst({
    where: { email }
  });

  if (existing) {
    console.log('Superadmin already exists!');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const superadmin = await prisma.user.create({
    data: {
      email: email,
      name: 'System Superadmin',
      passwordHash: passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Successfully created Super Admin!');
  console.log('Email:', superadmin.email);
  console.log('Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
