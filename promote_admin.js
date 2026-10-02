const { Client } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL before running this script.")
  process.exit(1)
}

const client = new Client({ connectionString });

async function run() {
  await client.connect();
  
  // Set all users to SUPER_ADMIN (since you're the only user right now)
  const res = await client.query(`UPDATE "User" SET "platformRole" = 'SUPER_ADMIN' RETURNING *;`);
  
  if (res.rowCount === 0) {
    console.log("No users found in the database. Please sign in first!");
  } else {
    console.log(`Successfully promoted ${res.rowCount} user(s) to SUPER_ADMIN!`);
  }

  await client.end();
}

run().catch(console.error);
