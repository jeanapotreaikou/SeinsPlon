// Connexion à Postgres (Neon) et création des tables au premier appel.
let sqlPromise, ready;

async function getSql() {
  if (globalThis.__SEINSPLON_TEST_SQL && process.env.NODE_ENV === 'test') return globalThis.__SEINSPLON_TEST_SQL;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL manquante');
  const { neon } = await import('@neondatabase/serverless');
  return neon(url);
}

export async function db() {
  sqlPromise ??= getSql().catch((e) => { sqlPromise = null; throw e; });
  const sql = await sqlPromise;
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS visitors (vid TEXT PRIMARY KEY, first_seen BIGINT NOT NULL)`;
    await sql`CREATE TABLE IF NOT EXISTS events (
      jid TEXT NOT NULL, type TEXT NOT NULL, vid TEXT NOT NULL, ts BIGINT NOT NULL,
      PRIMARY KEY (jid, type))`;
  })().catch((e) => { ready = null; throw e; });
  await ready;
  return sql;
}
