// Test local des fonctions avec SQLite (aucun paquet requis). Lance : npm test
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';

const lite = new DatabaseSync(':memory:');
// Adaptateur : imite la balise `sql\`...\`` de Neon (les $1, $2 deviennent des ?).
globalThis.__SEINSPLON_TEST_SQL = async (strings, ...vals) => {
  const text = strings.reduce((a, s, i) => a + '?' + s.replace(/^/, ''), '').slice(1);
  const st = lite.prepare(text);
  return /^\s*(select|insert[\s\S]*returning)/i.test(text) ? st.all(...vals) : (st.run(...vals), []);
};
process.env.ADMIN_KEY = 'cle-de-test-123456';

const { default: e } = await import('../api/e.js');
const { default: stats } = await import('../api/stats.js');
const { default: admin } = await import('../api/admin.js');

const call = async (h, { method = 'GET', url = '/', body, headers = {} } = {}) => {
  const r = { code: 0, body: null, h: {} };
  const res = { setHeader: (k, v) => (r.h[k] = v), status(c) { r.code = c; return this; }, json(b) { r.body = b; return this; }, send(b) { r.body = b; return this; } };
  await h({ method, url, body, headers }, res);
  return r;
};
const V = '11111111-1111-4111-8111-111111111111', J1 = '22222222-2222-4222-8222-222222222222', J2 = '33333333-3333-4333-8333-333333333333', V2 = '44444444-4444-4444-8444-444444444444';
const post = (v, j, ev, asObject) => call(e, { method: 'POST', body: asObject ? { v, j, e: ev } : JSON.stringify({ v, j, e: ev }) });

// 1) doublons : mêmes évènements répétés (rechargement, clics multiples, badge retéléchargé)
assert.equal((await post(V, J1, 'journey_started')).body.counted, true);
assert.equal((await post(V, J1, 'journey_started')).body.counted, false);
assert.equal((await post(V, J1, 'journey_started', true)).body.counted, false);
assert.equal((await post(V, J1, 'journey_completed')).body.counted, true);
assert.equal((await post(V, J1, 'badge_downloaded')).body.counted, true);
assert.equal((await post(V, J1, 'badge_downloaded')).body.counted, false);
assert.equal((await post(V, J1, 'badge_downloaded')).body.counted, false);
// 2) « Recommencer » : nouveau parcours, même appareil ; autre appareil
assert.equal((await post(V, J2, 'journey_started')).body.counted, true);
assert.equal((await post(V2, '55555555-5555-4555-8555-555555555555', 'journey_started')).body.counted, true);

// 3) données invalides et mauvaise méthode
for (const bad of [['x', J1, 'journey_started'], [V, 'x', 'journey_started'], [V, J1, 'health_change_reported'], [V, J1, undefined]])
  assert.equal((await post(...bad)).code, 400);
assert.equal((await call(e, { method: 'POST', body: 'pas du json' })).code, 400);
assert.equal((await call(e, { method: 'POST', body: 'x'.repeat(2000) })).code, 413);
assert.equal((await call(e, { method: 'GET' })).code, 405);

// 4) accès protégé
assert.equal((await call(stats, { url: '/api/stats' })).code, 401);
assert.equal((await call(stats, { url: '/api/stats?key=nope' })).code, 401);
const ok = await call(stats, { url: '/api/stats?key=cle-de-test-123456' });
const viaHeader = await call(stats, { url: '/api/stats', headers: { authorization: 'Bearer cle-de-test-123456' } });
assert.equal(ok.code, 200); assert.equal(viaHeader.code, 200);

// 5) les chiffres : 3 parcours commencés (J1, J2, autre appareil), 1 terminé, 1 badge, 2 appareils
const s = ok.body;
assert.equal(s.parcours_commences, 3); assert.equal(s.parcours_termines, 1);
assert.equal(s.badges_telecharges, 1); assert.equal(s.visiteurs_uniques, 2);
assert.equal(s.personnes_ayant_telecharge_un_badge, 1); assert.equal(s.taux_de_completion_pct, 33);
assert.equal(s.par_jour_utc.length, 1);
const html = await call(admin, { url: '/admin?key=cle-de-test-123456' });
assert.equal(html.code, 200); assert.match(html.body, /<b>3<\/b>parcours commencés/);
assert.equal((await call(admin, { url: '/admin' })).code, 401);
process.env.ADMIN_KEY = 'court';
assert.equal((await call(stats, { url: '/api/stats?key=court' })).code, 503);
console.log('Tous les tests passent');
console.log(JSON.stringify(s));
