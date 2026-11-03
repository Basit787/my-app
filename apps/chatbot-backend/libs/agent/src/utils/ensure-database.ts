import pg from "pg";

export const ensureDatabase = async (connectionString: string): Promise<boolean> => {
  const url = new URL(connectionString);
  const name = decodeURIComponent(url.pathname.slice(1));
  url.pathname = "/postgres";
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    if (existing.rowCount) return false;
    await client.query(`CREATE DATABASE "${name.replace(/"/g, '""')}"`);
    return true;
  } finally {
    await client.end();
  }
};
