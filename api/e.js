// POST /api/e : reçoit { v: visiteur, j: parcours, e: évènement }. Idempotent.
import { db } from '../lib/db.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TYPES = new Set(['journey_started', 'journey_completed', 'badge_downloaded']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'méthode non autorisée' });
  }
  let d = req.body;
  try {
    if (Buffer.isBuffer(d)) d = d.toString('utf8');
    if (typeof d === 'string') {
      if (d.length > 1024) return res.status(413).json({ error: 'trop volumineux' });
      d = JSON.parse(d);
    }
  } catch {
    return res.status(400).json({ error: 'json invalide' });
  }
  if (!d || typeof d !== 'object' || !UUID.test(d.v) || !UUID.test(d.j) || !TYPES.has(d.e)) {
    return res.status(400).json({ error: 'évènement invalide' });
  }
  try {
    const sql = await db();
    const now = Date.now(), v = d.v.toLowerCase(), j = d.j.toLowerCase();
    await sql`INSERT INTO visitors (vid, first_seen) VALUES (${v}, ${now}) ON CONFLICT DO NOTHING`;
    const rows = await sql`INSERT INTO events (jid, type, vid, ts) VALUES (${j}, ${d.e}, ${v}, ${now}) ON CONFLICT DO NOTHING RETURNING jid`;
    return res.status(200).json({ ok: true, counted: rows.length === 1 }); // false = déjà compté
  } catch (e) {
    console.error('stats /e', e);
    return res.status(500).json({ error: 'erreur serveur' });
  }
}
