// GET /admin?key=ADMIN_KEY : page lisible des chiffres.
import { db } from '../lib/db.js';
import { computeStats } from '../lib/stats.js';
import { checkAdmin } from '../lib/auth.js';

const page = (s) => `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Chiffres SeinsPlon</title>
<style>body{font:18px/1.5 system-ui,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#FBF6F3;color:#2B2329}h1{color:#5B1A3A}
.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.c{background:#fff;border:1px solid #E6D6DD;border-radius:16px;padding:14px}.c b{display:block;font-size:34px;color:#A21D4C}
table{width:100%;border-collapse:collapse;margin-top:12px}td,th{padding:6px 4px;border-bottom:1px solid #E6D6DD;text-align:right}th:first-child,td:first-child{text-align:left}small{color:#5E5159}</style>
<h1>Chiffres SeinsPlon</h1>
<div class="g">
<div class="c"><b>${s.parcours_commences}</b>parcours commencés</div>
<div class="c"><b>${s.parcours_termines}</b>parcours terminés (${s.taux_de_completion_pct} %)</div>
<div class="c"><b>${s.badges_telecharges}</b>badges téléchargés</div>
<div class="c"><b>${s.visiteurs_uniques}</b>appareils différents</div></div>
<p><small>Chaque parcours et chaque badge ne sont comptés qu'une fois, même si la page est rechargée ou le badge retéléchargé. « Recommencer » ouvre un nouveau parcours. Jours en UTC.</small></p>
<table><tr><th>Jour</th><th>Commencés</th><th>Terminés</th><th>Badges</th></tr>
${s.par_jour_utc.map((d) => `<tr><td>${d.jour}</td><td>${d.parcours_commences}</td><td>${d.parcours_termines}</td><td>${d.badges_telecharges}</td></tr>`).join('')}</table></html>`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const denied = checkAdmin(req);
  if (denied) return res.status(denied.code).json(denied.body);
  try {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(page(await computeStats(await db())));
  } catch (e) {
    console.error('stats /admin', e);
    return res.status(500).json({ error: 'erreur serveur' });
  }
}
