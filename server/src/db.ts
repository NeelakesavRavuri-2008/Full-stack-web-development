import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

export async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS telemetry_records (
      id SERIAL PRIMARY KEY,
      vessel_id VARCHAR(50) NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      temperature NUMERIC(5, 2) NOT NULL,
      ph NUMERIC(4, 2) NOT NULL,
      dissolved_oxygen NUMERIC(5, 2) NOT NULL,
      agitation INT NOT NULL,
      status VARCHAR(50) NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_telemetry_time ON telemetry_records (timestamp DESC);
  `;
  try {
    await pool.query(query);
    console.log("[DB] Connected to PostgreSQL & telemetry table initialized.");
  } catch (err) {
    console.error("[DB] Migration error:", err);
  }
}