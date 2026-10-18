
require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
