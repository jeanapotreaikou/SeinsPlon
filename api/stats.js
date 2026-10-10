// GET /api/stats?key=ADMIN_KEY  (ou en-tête Authorization: Bearer ADMIN_KEY)
import { db } from '../lib/db.js';
import { computeStats } from '../lib/stats.js';
import { checkAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const denied = checkAdmin(req);
  if (denied) return res.status(denied.code).json(denied.body);
  try {
    return res.status(200).json(await computeStats(await db()));
  } catch (e) {
    console.error('stats /stats', e);
    return res.status(500).json({ error: 'erreur serveur' });
  }
}
