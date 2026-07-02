import { Client } from 'pg'
import { config } from 'dotenv'

config({ path: '.env' })

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })
  await client.connect()
  const res = await client.query("SELECT email, role, \"tenantId\" FROM \"User\"")
  console.log(res.rows)
  await client.end()
}

main().catch(console.error)
