const { Client } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL before running this script.")
  process.exit(1)
}

const client = new Client({ connectionString });

async function run() {
  await client.connect();
  console.log("Connected to DB.");

  // Delete all StoreMembers to fix the foreign key violation
  const res = await client.query('DELETE FROM "StoreMember";');
  console.log(`Deleted ${res.rowCount} StoreMember records.`);
  
  // Also delete the Super_admin table if it exists to fix the other warning
  try {
    await client.query('DROP TABLE IF EXISTS "Super_admin";');
    console.log("Dropped Super_admin table.");
  } catch (e) {
    console.log("Super_admin table not found or couldn't drop.");
  }

  await client.end();
}

run().catch(console.error);
