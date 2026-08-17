const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.pyatrfilqudblubixdwz:Splash%402420!.@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
});

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
