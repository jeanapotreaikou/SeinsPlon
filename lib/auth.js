import { createHash, timingSafeEqual } from 'node:crypto';

// Renvoie null si l'accès est autorisé, sinon { code, body } à renvoyer.
export function checkAdmin(req) {
  const key = process.env.ADMIN_KEY;
  if (!key || key.length < 12) return { code: 503, body: { error: 'ADMIN_KEY non configurée (12 caractères minimum)' } };
  const url = new URL(req.url, 'http://x');
  const bearer = (req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
  const given = bearer || url.searchParams.get('key') || '';
  const h = (s) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(given), h(key)) ? null : { code: 401, body: { error: 'clé requise' } };
}
