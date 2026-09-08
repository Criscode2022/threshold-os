import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("[migrate] DATABASE_URL not set — skip");
  process.exit(0);
}
const dir = path.join(root, "migrations");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const pool = new pg.Pool({ connectionString: url, max: 1 });
const client = await pool.connect();
try {
  await client.query(`create table if not exists _migrations (id text primary key, applied_at timestamptz default now())`);
  for (const file of files) {
    const done = await client.query("select 1 from _migrations where id = $1", [file]);
    if (done.rowCount) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    await client.query(sql);
    await client.query("insert into _migrations (id) values ($1)", [file]);
    console.log("[migrate] applied", file);
  }
} finally {
  client.release();
  await pool.end();
}
