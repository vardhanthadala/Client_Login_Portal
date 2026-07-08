const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.dtshzmckqwvxidkfiglh:8639586395Ab%2B%40%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('Finding admin users without a tenant...');
  
  const client = await pool.connect();
  
  try {
    const { rows: admins } = await client.query(`SELECT id, email FROM "User" WHERE role = 'ADMIN' AND "tenantId" IS NULL`);
    
    if (admins.length === 0) {
      console.log('No admin users without a tenant found.');
      return;
    }
    
    console.log(`Found ${admins.length} admin users without a tenant. Creating a tenant for them...`);
    
    const tenantRes = await client.query(`
      INSERT INTO "Tenant" (id, name, "subscriptionPlan", "subscriptionStatus", "subscriptionStart", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Default Agency', 'PRO', 'ACTIVE', NOW(), NOW(), NOW())
      RETURNING id
    `);
    
    const tenantId = tenantRes.rows[0].id;
    console.log(`Created tenant with ID: ${tenantId}`);
    
    for (const admin of admins) {
      await client.query(`UPDATE "User" SET "tenantId" = $1 WHERE id = $2`, [tenantId, admin.id]);
      console.log(`Assigned tenant ${tenantId} to admin ${admin.email}`);
    }
    
    console.log('Done!');
  } finally {
    client.release();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
