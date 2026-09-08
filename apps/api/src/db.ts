import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn("[db] DATABASE_URL is not set");
}

export const pool = new pg.Pool({
  connectionString: url,
  max: 8,
  ssl: url?.includes("sslmode=require") ? { rejectUnauthorized: true } : undefined,
});

export async function sql<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
