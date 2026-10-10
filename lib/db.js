// Connexion à Postgres (Neon) et création des tables au premier appel.
let sqlPromise, ready;
 
// Cherche l'adresse de la base sous n'importe quel nom : Vercel peut préfixer les variables (ex. STORAGE_DATABASE_URL).
const PG = /^postgres(ql)?:\/\//i;
export function findDbUrl(env = process.env) {
  for (const k of ['DATABASE_URL', 'POSTGRES_URL']) if (PG.test(env[k] || '')) return env[k];
  const rank = (k) => (/DATABASE_URL$/.test(k) ? 0 : /POSTGRES_URL$/.test(k) ? 1 : /NON_POOLING|NO_SSL|PRISMA/.test(k) ? 3 : 2);
  const found = Object.keys(env).filter((k) => PG.test(env[k] || '')).sort((a, b) => rank(a) - rank(b));
  return found.length ? env[found[0]] : null;
}
 
async function getSql() {
  if (globalThis.__SEINSPLON_TEST_SQL && process.env.NODE_ENV === 'test') return globalThis.__SEINSPLON_TEST_SQL;
  const url = findDbUrl();
  if (!url) {
    // Seuls les NOMS de variables proches sont cités, jamais leurs valeurs.
    const noms = Object.keys(process.env).filter((k) => /URL|POSTGRES|DATABASE|NEON|STORAGE/i.test(k)).join(', ') || 'aucune';
    throw new Error(`Adresse de base Postgres introuvable (DATABASE_URL manquante). Variables proches vues : ${noms}`);
  }
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
