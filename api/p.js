// POST /api/p : enregistre le formulaire du badge { v, j, nom, pays, email, consent }.
// Un seul enregistrement par parcours : renvoyer le formulaire met à jour la ligne existante.
import { db } from '../lib/db.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (x, max) => (typeof x === 'string' ? x.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max + 1) : null);

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
      if (d.length > 2048) return res.status(413).json({ error: 'trop volumineux' });
      d = JSON.parse(d);
    }
  } catch {
    return res.status(400).json({ error: 'json invalide' });
  }
  if (!d || typeof d !== 'object' || !UUID.test(d.v) || !UUID.test(d.j)) return res.status(400).json({ error: 'requête invalide' });
  if (d.consent !== true) return res.status(400).json({ error: 'consentement requis' });

  const name = clean(d.nom, 80), country = clean(d.pays ?? '', 60), email = (clean(d.email ?? '', 254) || '').toLowerCase();
  if (!name || name.length > 80) return res.status(400).json({ error: 'prénom ou pseudo invalide' });
  if (country === null || country.length > 60) return res.status(400).json({ error: 'pays invalide' });
  if (email && (email.length > 254 || !MAIL.test(email))) return res.status(400).json({ error: 'e-mail invalide' });

  try {
    const sql = await db();
    const now = Date.now(), v = d.v.toLowerCase(), j = d.j.toLowerCase();
    await sql`INSERT INTO visitors (vid, first_seen) VALUES (${v}, ${now}) ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO participants (jid, vid, name, country, email, consent_at, updated_at)
      VALUES (${j}, ${v}, ${name}, ${country}, ${email}, ${now}, ${now})
      ON CONFLICT (jid) DO UPDATE SET name = excluded.name, country = excluded.country, email = excluded.email, updated_at = excluded.updated_at`;
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('stats /p', e);
    return res.status(500).json({ error: 'erreur serveur' });
  }
}
