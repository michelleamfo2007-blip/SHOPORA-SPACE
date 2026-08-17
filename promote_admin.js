const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.pyatrfilqudblubixdwz:Splash%402420!.@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
});

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
