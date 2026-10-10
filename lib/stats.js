const n = (x) => Number(x) || 0;

export async function computeStats(sql) {
  const totals = Object.fromEntries((await sql`SELECT type, COUNT(*) AS n FROM events GROUP BY type`).map((r) => [r.type, n(r.n)]));
  const [{ n: visiteurs }] = await sql`SELECT COUNT(*) AS n FROM visitors`;
  const [{ n: porteurs }] = await sql`SELECT COUNT(DISTINCT vid) AS n FROM events WHERE type = 'badge_downloaded'`;
  const rows = await sql`SELECT ts / 86400000 AS day, type, COUNT(*) AS n FROM events GROUP BY day, type`;

  const [{ n: nbParticipants }] = await sql`SELECT COUNT(*) AS n FROM participants`;
  const pays = await sql`SELECT LOWER(country) AS c, COUNT(*) AS n FROM participants WHERE country <> '' GROUP BY LOWER(country) ORDER BY n DESC LIMIT 30`;
  const liste = await sql`SELECT name, country, email, consent_at FROM participants ORDER BY consent_at DESC LIMIT 200`;

  const byDay = new Map();
  for (const r of rows) {
    const jour = new Date(n(r.day) * 86400000).toISOString().slice(0, 10); // jours en UTC
    const d = byDay.get(jour) || { jour, parcours_commences: 0, parcours_termines: 0, badges_telecharges: 0 };
    if (r.type === 'journey_started') d.parcours_commences = n(r.n);
    if (r.type === 'journey_completed') d.parcours_termines = n(r.n);
    if (r.type === 'badge_downloaded') d.badges_telecharges = n(r.n);
    byDay.set(jour, d);
  }
  const started = totals.journey_started || 0, completed = totals.journey_completed || 0;
  return {
    visiteurs_uniques: n(visiteurs),
    parcours_commences: started,
    parcours_termines: completed,
    badges_telecharges: totals.badge_downloaded || 0,
    personnes_ayant_telecharge_un_badge: n(porteurs),
    taux_de_completion_pct: started ? Math.round((completed / started) * 100) : 0,
    participants_total: n(nbParticipants),
    par_pays: pays.map((r) => ({ pays: r.c, total: n(r.n) })),
    participants: liste.map((r) => ({ nom: r.name, pays: r.country, email: r.email, date_utc: new Date(n(r.consent_at)).toISOString().slice(0, 16).replace('T', ' ') })), // 200 plus récents
    par_jour_utc: [...byDay.values()].sort((a, b) => b.jour.localeCompare(a.jour)).slice(0, 60),
  };
}
