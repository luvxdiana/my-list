
const pool = require("./db");

async function testConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name"
    );

    console.log("PostgreSQL connected successfully!");
    console.log("Database:", result.rows[0].database_name);

  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exitCode = 1;

  } finally {
    await pool.end();
  }
}

testConnection();
