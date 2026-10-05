/* ===== COLLECTE : uniquement sur la page « badge » =====
   endpoint = URL du script Google Apps Script (voir collecte-apps-script.gs). Vide = mode démo : rien n'est envoyé. */
const CFG = { endpoint: 'https://script.google.com/a/macros/simplon.co/s/AKfycbw1JubMUvtAakI5OIU-KT12pQSZtBepVhD3vy5YKaxhqZVNmgSOjeDpB_lmb9cVB9C2/exec' };
const send = o => { if (!CFG.endpoint) { console.debug('[collecte démo]', o); return } try { fetch(CFG.endpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(o) }) } catch (e) { } };
const EM = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
let RN; try { RN = new Intl.DisplayNames(['fr'], { type: 'region' }) } catch (e) { }
const cname = c => c == 'XX' ? 'Autre' : (() => { try { return RN.of(c) } catch (e) { return c } })();
const CO = sel => {
    const L = 'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GF GH GM GN GP GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MQ MR MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NZ OM PA PE PF PG PH PK PL PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE YT ZA ZM ZW'.split(' ').map(c => [c, cname(c)]).sort((a, b) => a[1].localeCompare(b[1], 'fr'));
    return [['', 'Choisis ton pays'], ['BJ', cname('BJ')], ...L, ['XX', 'Autre']].map(([c, n]) => `<option value="${c}" ${c == sel ? 'selected' : ''}>${n}</option>`).join('')
};
/* ===== DONNÉES (modifiables sans toucher à l'interface) ===== */
const D = {
    q: [
        { q: "Un cancer du sein fait toujours mal. Vrai ou fake ?", o: ["Vrai", "Fake"], a: 1, e: "Fake ! Un changement peut être totalement indolore. Pas de douleur ne veut pas dire rien à signaler" },
        { q: "Lequel de ces changements mérite d'être montré à un pro ?", o: ["Une nouvelle boule", "Une peau qui change", "Un mamelon qui change", "Les 3 !"], a: 3, e: "Les 3 ! Tout changement nouveau et inhabituel, on le fait checker. Mieux vaut vérifier que stresser." },
        { q: "Une boule dans le sein = forcément un cancer. Vrai ou fake ?", o: ["Vrai", "Fake"], a: 1, e: "Fake ! Beaucoup de boules sont bénignes. Mais seul un pro peut le dire : on fait checker, sans paniquer" },
        { q: "C'est quoi « bien connaître ses seins » ?", o: ["Les mesurer tous les jours", "Savoir à quoi ils ressemblent et ce qu'on sent d'habitude", "Les comparer à ceux des copines"], a: 1, e: "Si tu connais ton « normal », tu remarques vite ce qui change. C'est ça le super-pouvoir" },
        { q: "Tes seins restent identiques toute ta vie. Vrai ou fake ?", o: ["Vrai", "Fake"], a: 1, e: "Fake ! Ils bougent avec l'âge, le cycle, une grossesse… Par contre, un changement nouveau et inhabituel, on le fait checker." },
        { q: "Tu remarques un truc inhabituel. Tu fais quoi ?", o: ["J'attends que ça passe", "J'en parle à un pro de santé", "Je cherche mes symptômes sur internet"], a: 1, e: "En parler à un pro, c'est le move ! Lui peut t'examiner. Internet, non" },
        { q: "L'auto-observation remplace les examens de dépistage. Vrai ou fake ?", o: ["Vrai", "Fake"], a: 1, e: "Fake ! Elle complète les examens, elle ne les remplace pas. Demande à un pro lesquels te concernent." },
        { q: "Où faut-il regarder ?", o: ["Juste le sein", "Sein, mamelon, peau… et le creux de l'aisselle"], a: 1, e: "Le tissu du sein va jusqu'à l'aisselle : on check tout le périmètre" },
        { q: "Pas de douleur = je peux ignorer un changement. Vrai ou fake ?", o: ["Vrai", "Fake"], a: 1, e: "Fake ! Visible ou palpable, un changement compte, même sans douleur." },
        { q: "Ce parcours peut me dire si j'ai un cancer. Vrai ou fake ?", o: ["Vrai", "Fake"], a: 1, e: "Fake ! Ici on apprend à observer, on ne diagnostique pas. Seul un pro de santé peut le faire." }
    ],
    cards: [
        ["Nouvelle boule", "Une boule ou masse que tu ne connaissais pas, dans le sein ou près de l'aisselle. Souvent bénigne, mais seul un pro peut le dire."],
        ["Zone plus épaisse", "Un endroit qui semble plus dense ou plus épais qu'avant, sans raison évidente."],
        ["Forme qui change", "Un sein dont la forme change nettement par rapport à ton « normal »."],
        ["Taille qui change", "Un sein qui devient visiblement plus gros ou plus petit qu'avant."],
        ["Peau qui change", "Rougeur, petit creux, plissement, aspect « peau d'orange » : tout ce qui est nouveau mérite un coup d'œil."],
        ["Mamelon qui change", "Un mamelon qui rentre, change de forme ou d'aspect récemment."],
        ["Écoulement bizarre", "Un liquide qui sort du mamelon tout seul, surtout si c'est nouveau."],
        ["Truc à l'aisselle", "Une bosse ou un gonflement dans le creux de l'aisselle."]
    ],
    id: ["une nouvelle boule", "un changement de la peau", "un changement au niveau du mamelon", "un écoulement bizarre", "un truc inhabituel sous l'aisselle"],
    zones: ["Haut du sein", "Haut, côté extérieur", "Côté extérieur", "Bas, côté extérieur", "Bas du sein", "Bas, côté intérieur", "Côté intérieur", "Haut, côté intérieur", "Creux de l'aisselle"]
};
const ST = ["Je sais", "J'observe", "Je vérifie", "Je reconnais", "J'identifie", "J'agis"];
const M = { quiz: 0, observe: 1, palpate: 2, cards: 3, identify: 4, directory: 5 };
const ENC = encodeURIComponent, $ = s => document.querySelector(s), app = $('#app');

/* ===== MOTEUR : état, progression, reprise locale (aucune donnée envoyée) ===== */
const KEY = 'mission-sein-v1';
let S; try { S = JSON.parse(localStorage.getItem(KEY)) } catch (e) { }
S = S || { screen: 'home', xp: 0, bd: [], qi: 0, os: 0, ps: 0, pz: [], ci: [], ii: 0, ans: { id: [] }, minor: false, started: false };
const nb = () => ({ fn: '', ln: '', em: '', cc: '', nl: false, img: null, ready: false, sent: false, err: '' });
let T = { b: nb(), s: 0, r: '', p: null, ch: [], open: null, f: { v: '', t: '', q: '' }, w: false, rem: null, c: '' };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) { } };
const track = (n, p) => console.debug('[analytics]', n, p || {}); /* jamais de données médicales */
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), 2200) }
const xp = n => { S.xp += n; toast('+' + n + ' XP') };
const badge = b => { if (!S.bd.includes(b)) { S.bd.push(b); setTimeout(() => toast('Badge « ' + b + ' » débloqué'), 900) } };
/* 0 = rien signalé · 1 = doute · 2 = changement signalé */
const flag = () => { const a = [S.ans.obs, ...S.ans.id]; return a.includes('Oui') ? 2 : a.some(x => x && x.startsWith('Je ne')) ? 1 : 0 };
function go(s, f) { if (M[s] != null) { S.last = s; if (M[s] != M[S.screen]) splash(M[s]) } S.back = S.screen; S.screen = s; save(); render(f); scrollTo(0, 0) }
function done(m, b, next) { xp(10); if (b) badge(b); track('mission_completed', { m }); burst(24); go(next) }

/* ===== COMPOSANTS ===== */
const hd = () => {
    const n = M[S.screen]; if (n == null || (S.screen == 'directory' && flag())) return '';
    return `<div class="hd"><div class="row"><span class="k" style="display:flex;align-items:center;gap:8px">${ic(MI[n], 22)}Mission ${n + 1}/6 · ${ST[n]}</span><span class="xp">${S.xp} XP · ${['Rookie', 'Curieuse', 'Pro', 'Légende'][Math.min(3, Math.floor(S.xp / 45))]}</span></div><div class="bar" role="progressbar" aria-label="Progression du parcours" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${n}"><i style="width:${Math.round((n + .5) / 6 * 100)}%"></i></div></div>`
};
const ft = () => `<div class="ft"><p>Information et sensibilisation : l'auto-observation ne remplace ni une consultation médicale ni les examens de dépistage recommandés.</p><p>SeinsPlon, une plateforme pensée par Simplon Bénin.</p><button data-a="to" data-v="sources">Sources médicales</button><button data-a="to" data-v="faq">FAQ</button><button data-a="reset">Recommencer</button></div>`;
const opts = (arr, act) => `<div role="group" aria-label="Réponses">${arr.map(o => `<button class="opt" data-a="${act}" data-v="${o}">${o}</button>`).join('')}</div>`;
const IC = {
    heart: '<path d="M20 33C8 25 6 15 12 11c4-3 8 0 8 4 0-4 4-7 8-4 6 4 4 14-8 22z"/>',
    lump: '<circle cx="20" cy="20" r="15"/><circle cx="24" cy="17" r="4" fill="currentColor"/>',
    eye: '<path d="M3 20q17-17 34 0-17 17-34 0z"/><circle cx="20" cy="20" r="5"/>',
    size: '<circle cx="13" cy="23" r="8"/><circle cx="27" cy="17" r="11"/>',
    chat: '<path d="M6 8h28v18H18l-8 7v-7H6z"/><path d="M14 17h12"/>',
    shield: '<path d="M20 4l13 5v10c0 8-6 13-13 17C13 32 7 27 7 19V9z"/><path d="M14 20l5 5 8-9"/>',
    arm: '<path d="M9 6c4 12 4 20 0 28M31 6c-4 12-4 20 0 28"/><circle cx="20" cy="22" r="4"/>',
    ribbon: '<path d="M20 18C12 6 4 6 6 14c2 6 9 6 14 4zm0 0c8-12 16-12 14-4-2 6-9 6-14 4zM20 18l-7 16 5-3 2 5 2-5 5 3z"/>',
    thick: '<path d="M5 12q8-5 15 0t15 0M5 20q8-5 15 0t15 0M5 28q8-5 15 0t15 0"/>',
    shape: '<path d="M20 6c10 0 15 8 13 16s-8 12-13 12S8 30 7 22 10 6 20 6z"/><path stroke-dasharray="2 4" d="M20 2c13 0 20 10 17 20"/>',
    skin: '<circle cx="20" cy="20" r="15"/><circle cx="14" cy="16" r="1.6" fill="currentColor"/><circle cx="23" cy="14" r="1.6" fill="currentColor"/><circle cx="26" cy="23" r="1.6" fill="currentColor"/><circle cx="16" cy="25" r="1.6" fill="currentColor"/>',
    nip: '<circle cx="20" cy="20" r="15"/><circle cx="20" cy="20" r="6"/>',
    drop: '<path d="M20 5C13 15 9 20 9 26a11 11 0 0022 0c0-6-4-11-11-21z"/>',
    bulb: '<path d="M20 4a10 10 0 00-5 19v4h10v-4a10 10 0 00-5-19zM15 32h10M17 36h6"/>',
    hand: '<path d="M12 22V10m6 12V6m6 16V8m6 14V14M10 22c-3 0-4 3-2 6l6 8h12c4-4 6-8 6-14"/>',
    cards: '<rect x="5" y="9" width="20" height="26" rx="3" transform="rotate(-8 15 22)"/><rect x="15" y="5" width="20" height="26" rx="3" transform="rotate(8 25 18)"/>',
    mag: '<circle cx="17" cy="17" r="11"/><path d="M26 26l10 10"/>',
    pin: '<path d="M20 36C10 24 8 19 8 15a12 12 0 0124 0c0 4-2 9-12 21z"/><circle cx="20" cy="15" r="4"/>'
};
const MI = ['bulb', 'eye', 'hand', 'cards', 'mag', 'pin'], CK = ['lump', 'thick', 'shape', 'size', 'skin', 'nip', 'drop', 'arm'], QI = ['heart', 'lump', 'lump', 'eye', 'size', 'chat', 'shield', 'arm', 'heart', 'ribbon'];
const ic = (k, s = 24) => `<svg class="ic" viewBox="0 0 40 40" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
const ib = k => `<span class="ib">${ic(k, 32)}</span>`;
/* Illustrations : buste stylisé (0 bras bas · 1 deux bras levés · 2 un bras levé), miroir, fleurs, ruban */
const figIn = (up, m) => { const a = up > 0, b = up == 1; return `${m ? '<clipPath id="mc"><ellipse cx="100" cy="95" rx="94" ry="90"/></clipPath><ellipse cx="100" cy="95" rx="94" ry="90" fill="var(--card)"/><g clip-path="url(#mc)">' : '<g>'}<g transform="translate(0 12)"><g stroke="var(--plum)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path fill="var(--soft)" d="M93 56Q62 58 58 84L54 190H146L142 84Q138 58 107 56z"/><path fill="none" d="${a ? 'M58 84L34 36' : 'M58 84Q42 124 38 190'}M${b ? '142 84L166 36' : '142 84Q158 124 162 190'}"/><circle cx="100" cy="28" r="18" fill="var(--soft)"/><path fill="var(--plum)" d="M82 26q2-22 18-22t18 22q-9-11-18-9t-18 9z"/><path fill="none" d="M94 44v12M106 44v12"/><circle cx="82" cy="118" r="17" fill="var(--card)"/><circle cx="118" cy="118" r="17" fill="var(--card)"/></g><circle cx="82" cy="118" r="3" fill="var(--pink)"/><circle cx="118" cy="118" r="3" fill="var(--pink)"/></g></g>${m ? '<ellipse cx="100" cy="95" rx="94" ry="90" fill="none" stroke="var(--plum)" stroke-width="5"/><path d="M34 40q8-14 24-22" stroke="var(--pink)" stroke-width="4" stroke-linecap="round" fill="none"/>' : ''}` };
const bust = (up, m) => `<svg viewBox="0 0 200 190" role="img" aria-label="Illustration d'un buste féminin${up ? ', bras levé' : ''}${m ? ', dans un miroir' : ''}">${figIn(up, m)}</svg>`;
const flw = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(r => `<ellipse rx="6" ry="12" cy="-11" fill="${c}" transform="rotate(${r})"/>`).join('')}<circle r="5" fill="var(--plum)"/></g>`;
const star = (x, y, s, d) => `<path class="tw" style="animation-delay:${d}s" fill="var(--pink)" transform="translate(${x} ${y}) scale(${s})" d="M0-8Q1-1 8 0Q1 1 0 8Q-1 1-8 0Q-1-1 0-8z"/>`;
const lf = (x, y, r) => `<path fill="var(--ok)" opacity=".45" transform="translate(${x} ${y}) rotate(${r})" d="M0 0q14-18 28 0q-14 18-28 0z"/>`;
const rib = '<path d="M0 0C-12-16-24-22-22-10c2 12 14 12 22 10zm0 0C12-16 24-22 22-10c-2 12-14 12-22 10zM0 0-12 26l8-6 4 8 4-8 8 6z"/>';
/* Logo SeinsPlon : miroir + deux cercles (seins / yeux qui observent) + ruban ; « Plon » rappelle Simplon */
const logo = l => { const a = l ? '#fff' : 'var(--plum)', b = l ? '#FFC2D8' : 'var(--pink)', f = l ? 'rgba(255,255,255,.14)' : 'var(--soft)', c = l ? 'rgba(255,255,255,.92)' : 'var(--card)'; return `<svg viewBox="0 0 270 64" role="img" aria-label="SeinsPlon"><ellipse cx="30" cy="35" rx="25" ry="26" fill="${f}" stroke="${a}" stroke-width="4"/><circle cx="21" cy="40" r="9" fill="${c}" stroke="${b}" stroke-width="3"/><circle cx="39" cy="40" r="9" fill="${c}" stroke="${b}" stroke-width="3"/><circle cx="21" cy="40" r="2.4" fill="${b}"/><circle cx="39" cy="40" r="2.4" fill="${b}"/><g transform="translate(30 9) scale(.5)" fill="${b}" stroke="${l ? '#5B1A3A' : 'var(--bg)'}" stroke-width="3" paint-order="stroke">${rib}</g><text x="72" y="44" font-family="Fredoka,Nunito,system-ui,sans-serif" font-size="36" font-weight="600" letter-spacing="-.5" fill="${a}">Seins<tspan fill="${b}">Plon</tspan></text></svg>` };
const hero = () => `<svg class="scene" viewBox="0 0 320 230" role="img" aria-label="Une femme se regarde dans un miroir, entourée de fleurs et d'un ruban rose"><circle cx="160" cy="118" r="104" fill="var(--soft)"/><circle cx="268" cy="48" r="24" fill="var(--pink)" opacity=".2"/><circle cx="46" cy="170" r="18" fill="var(--plum)" opacity=".14"/>${lf(36, 104, -30)}${lf(256, 112, 40)}${lf(30, 62, -60)}<svg x="92" y="12" width="136" height="130" viewBox="0 0 200 190">${figIn(0, 1)}</svg>${flw(66, 190, 1.1, 'var(--pink)')}${flw(108, 212, .8, 'var(--plum)')}${flw(240, 198, 1, 'var(--pink)')}${flw(276, 170, .7, 'var(--plum)')}<g transform="translate(160 188) scale(1.5)"><g class="float" fill="var(--pink)">${rib}</g></g>${star(52, 40, 1.4, 0)}${star(284, 104, 1, .8)}${star(196, 14, 1.1, 1.5)}${star(118, 8, .8, 2)}</svg>`;
const party = () => { const C = ['var(--pink)', 'var(--plum)', 'var(--ok)', 'var(--soft)']; return `<svg class="scene" viewBox="0 0 320 190" role="img" aria-label="Un ruban rose entouré de confettis"><circle cx="160" cy="105" r="78" fill="var(--soft)"/>${lf(40, 112, -30)}${lf(250, 122, 40)}${flw(70, 152, 1.1, 'var(--pink)')}${flw(256, 150, 1.1, 'var(--plum)')}<g transform="translate(160 98) scale(2.3)"><g class="float" fill="var(--pink)">${rib}</g></g>${star(112, 40, 1.6, 0)}${star(214, 50, 1.3, .7)}${Array.from({ length: 18 }, (_, i) => { const y = 60 + (i * 37) % 100; return `<rect class="cf" x="${12 + i * 17}" y="${y}" width="8" height="12" rx="2" fill="${C[i % 4]}" stroke="var(--pink)" stroke-width=".5" style="--d:${y + 10}px;animation:fall 2.2s ${(i % 6) * .15}s ease-out both"/>` }).join('')}</svg>` };
const FING = '<svg viewBox="0 0 200 150" role="img" aria-label="Trois doigts joints, la pulpe vers le sein"><g fill="var(--soft)" stroke="var(--plum)" stroke-width="3"><rect x="40" y="34" width="32" height="100" rx="16"/><rect x="84" y="20" width="32" height="114" rx="16"/><rect x="128" y="34" width="32" height="100" rx="16"/></g><g fill="var(--pink)"><ellipse cx="56" cy="56" rx="11" ry="14"/><ellipse cx="100" cy="42" rx="11" ry="14"/><ellipse cx="144" cy="56" rx="11" ry="14"/></g></svg>';
const CIRC = '<svg viewBox="0 0 200 150" role="img" aria-label="Petits mouvements circulaires"><circle cx="100" cy="75" r="52" fill="var(--soft)" stroke="var(--plum)" stroke-width="3"/><g class="spin" fill="none" stroke="var(--pink)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M140 75a40 40 0 1 1-40-40"/><path d="M92 25l12 10-12 10"/></g><circle cx="100" cy="75" r="6" fill="var(--plum)"/></svg>';
const wedge = i => { const a = (i * 45 - 112.5) * Math.PI / 180, b = a + Math.PI / 4, p = (t, r) => (100 + r * Math.cos(t)).toFixed(1) + ' ' + (100 + r * Math.sin(t)).toFixed(1); return `M${p(a, 18)}L${p(a, 82)}A82 82 0 0 1 ${p(b, 82)}L${p(b, 18)}A18 18 0 0 0 ${p(a, 18)}Z` };
const zoneSvg = cur => `<svg viewBox="0 0 240 200" role="group" aria-label="Schéma du sein en 8 zones et de l'aisselle">${D.zones.map((z, i) => { const c = `z${S.pz.includes(i) ? ' v' : ''}${i == cur ? ' cur' : ''}`, at = `class="${c}" data-a="zone" data-v="${i}" role="button" tabindex="0" aria-label="Zone ${i + 1}, ${z}${S.pz.includes(i) ? ', explorée' : ''}"`; return i < 8 ? `<path ${at} d="${wedge(i)}"/>` : `<ellipse ${at} cx="214" cy="52" rx="22" ry="30"/>` }).join('')}<circle cx="100" cy="100" r="9" fill="var(--plum)"/></svg>`;

const OK = ["Boom !", "Easy !", "Tu gères !", "Gros cerveau !", "Yes !"], KO = ["Pas grave, on apprend ensemble", "Presque ! Voilà le truc", "Aucun stress, check ça"], TG = ["Teste tes connaissances", "Direction le miroir", "À toi de jouer !", "Retiens les signaux", "Ton check perso", "Passe à l'action"];
const mas = t => `<div class="mas"><svg viewBox="-30 -30 60 60" aria-hidden="true"><g fill="var(--pink)">${rib}</g><circle cy="-4" r="9" fill="var(--card)" stroke="var(--plum)" stroke-width="2"/><circle class="blink" cx="-3.5" cy="-5" r="1.5" fill="var(--plum)"/><circle class="blink" cx="3.5" cy="-5" r="1.5" fill="var(--plum)"/><path d="M-3.5-1q3.5 3.5 7 0" fill="none" stroke="var(--plum)" stroke-width="1.3" stroke-linecap="round"/></svg><div class="say" role="status">${t}</div></div>`;
const still = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
function burst(n) { if (still()) return; const E = ['var(--pink)', 'var(--plum)', 'var(--ok)', 'var(--soft)', 'var(--pink)']; for (let i = 0; i < n; i++) { const d = document.createElement('span'); d.className = 'sp'; d.style.background = E[i % 5]; d.setAttribute('aria-hidden', 'true'); d.style.left = '50%'; d.style.top = '45%'; const a = i / n * 6.28, k = 90 + Math.random() * 110; d.style.setProperty('--x', Math.cos(a) * k + 'px'); d.style.setProperty('--y', Math.sin(a) * k + 'px'); document.body.append(d); setTimeout(() => d.remove(), 1100) } }
function splash(n) { if (still()) return; const d = document.createElement('div'); d.className = 'spl'; d.setAttribute('role', 'status'); d.innerHTML = `<div>${ic(MI[n], 96)}<h2>Mission ${n + 1}</h2><p>${ST[n]} · ${TG[n]}</p></div>`; d.onclick = () => d.remove(); document.body.append(d); setTimeout(() => d.remove(), 1600) }
/* ===== ÉCRANS ===== */
const SC = {
    home() {
        const r = S.started && S.last ? `<button class="cta s" data-a="resume">REPRENDRE OÙ J'EN ÉTAIS</button>` : '';
        return `<div class="hero"><div class="brand">${logo()}<p class="tag">Observe mieux tes seins</p></div>${hero()}<h1 tabindex="-1">Et si tu prenais 5 minutes pour mieux connaître tes seins ?</h1><p>Apprends les bons réflexes, fais ton auto-observation et découvre quand demander un avis médical. Zéro prise de tête, promis !</p><p>${['Apprendre', 'Observer', 'Vérifier', 'Agir'].map((w, i) => `<span class="bd" style="animation-delay:${.3 + i * .2}s">${w}</span>`).join('')}</p>${mas("Salut ! Moi c'est Rosie, je te guide")}</div><button class="cta" data-a="start">C'EST PARTI !</button>${r}<div class="note">Ici on informe et on sensibilise : ce parcours ne permet pas de diagnostiquer une maladie. Un changement inhabituel ? Direction un professionnel de santé.</div>`
    },
    consent() { return `<div class="top">${ib('shield')}</div><h1 tabindex="-1">Petit brief avant de jouer</h1><p>5 missions, quelques minutes, et on le fait ensemble. Easy.</p><div class="note"><b>Ce que c'est :</b> de l'information, de la sensibilisation, de l'auto-observation guidée et de l'orientation.<br><b>Ce que ce n'est pas :</b> un outil de diagnostic. Aucun résultat, aucun « risque » ne te sera donné.</div><p><b>Ta vie privée :</b> pas de compte. Tes réponses au parcours restent sur ton appareil et ne partent nulle part. On ne te demande des infos qu'à la toute fin, si tu choisis de créer ton badge (facultatif).</p><label style="display:flex;gap:10px;align-items:center;min-height:48px"><input type="checkbox" id="mn" style="width:24px;height:24px" ${S.minor ? 'checked' : ''}> Facultatif : j'ai moins de 18 ans</label><button class="cta" data-a="ok">COMPRIS, ON Y VA !</button>` },
    quiz() {
        const q = D.q[S.qi], p = T.p;
        return `<div class="top">${ib(QI[S.qi])}<p class="k">Question ${S.qi + 1}/${D.q.length}</p></div><h1 tabindex="-1">${q.q}</h1><div role="group" aria-label="Réponses">${q.o.map((o, i) => `<button class="opt${p != null && i == q.a ? ' right bounce' : p == i ? ' pick wob' : ''}" data-a="pick" data-v="${i}" ${p != null ? 'disabled' : ''}>${o}${p != null && i == q.a ? ' ✓' : ''}</button>`).join('')}</div>${p != null ? `${mas(T.r)}<div class="exp" id="ex" tabindex="-1">${q.e}</div><button class="cta" data-a="nextq">${S.qi + 1 < D.q.length ? 'SUIVANT' : 'TERMINER LA MISSION'}</button>` : ''}`
    },
    observe() {
        const s = S.os, m = S.minor ? `<div class="note">Si un truc t'inquiète, parles-en à un adulte de confiance ou à un professionnel de santé.</div>` : '';
        if (s == 0) return `<h1 tabindex="-1">Direction le miroir !</h1><div class="fig">${bust(0, 1)}</div><p>Mets-toi au calme, avec une bonne lumière. Prends ton temps.</p><button class="cta" data-a="osn">JE SUIS PRÊTE</button>${m}`;
        if (s == 1) return `<h1 tabindex="-1">Bras le long du corps.</h1><div class="fig">${bust(0, 1)}</div><p>Regarde l'allure générale de tes seins. Touche chaque point une fois checké :</p><div class="chips">${['Forme', 'Symétrie', 'Peau', 'Mamelon'].map(c => `<button class="chip" aria-pressed="${T.ch.includes(c)}" data-a="chip" data-v="${c}">${T.ch.includes(c) ? '✓ ' : ''}${c}</button>`).join('')}</div><p class="k">Une petite différence entre tes deux seins, c'est courant. Ce qui compte, c'est ce qui change.</p><button class="cta" data-a="osn">CONTINUER</button>`;
        return `<h1 tabindex="-1">Lève les bras au-dessus de ta tête</h1><div class="fig">${bust(1, 1)}</div><p>Re-check : forme, peau, mamelon.</p><h2>Tu as remarqué un truc inhabituel ?</h2>${opts(['Non', 'Oui', 'Je ne suis pas sûre'], 'obs')}`
    },
    palpate() {
        const s = S.ps;
        const I = [["Lève un bras.", "Pose la main sur ta tête. L'autre main part en exploration"], ["Utilise la pulpe de 3 doigts.", "Le plat des doigts, pas le bout."], ["Fais de petits cercles.", "Pression douce, puis un peu plus appuyée. Pas de speed, prends ton temps."]];
        if (s < 3) return `<p class="k">Geste ${s + 1}/3</p><h1 tabindex="-1">${I[s][0]}</h1><p>${I[s][1]}</p><div class="fig">${[bust(2), FING, CIRC][s]}</div><button class="cta" data-a="psn">${s < 2 ? 'SUIVANT' : "ON Y VA !"}</button>`;
        const cur = D.zones.findIndex((z, i) => !S.pz.includes(i)), n = S.pz.length;
        return `<p class="k">Zone ${Math.min(n + 1, 9)}/9</p><h1 tabindex="-1">${cur < 0 ? 'Toutes les zones sont débloquées !' : D.zones[cur]}</h1><div class="bar" aria-hidden="true"><i style="width:${n / 9 * 100}%"></i></div><div class="fig">${zoneSvg(cur)}</div>${cur < 0 ? `<p>GG ! Refais le même geste de l'autre côté.</p><button class="cta" data-a="pdone">CONTINUER</button>` : `<p>Touche la zone qui clignote, ou valide ici.</p><button class="cta" data-a="zone" data-v="${cur}">ZONE CHECKÉE ✓</button>`}`
    },
    cards() { const o = T.open; return `<h1 tabindex="-1">Les signaux à connaître</h1><p class="k">${S.ci.length}/8 cartes ouvertes</p>${D.cards.map((c, i) => `<button class="card" aria-expanded="${o == i}" data-a="card" data-v="${i}"><span style="display:flex;align-items:center;gap:12px">${ic(CK[i], 28)}${c[0]}</span><span aria-hidden="true">${o == i ? '−' : '+'}</span></button>${o == i ? `<div class="more"><b>À retenir</b><p>${c[1]} Un pro de santé pourra y voir clair</p></div>` : ''}`).join('')}<button class="cta" data-a="cdone">CONTINUER</button>` },
    identify() { const i = S.ii; return `<div class="top">${ib(CK[[0, 4, 5, 6, 7][i]])}<p class="k">Question ${i + 1}/5</p></div><h1 tabindex="-1">Tu as remarqué ${D.id[i]} ?</h1>${opts(['Non', 'Oui', 'Je ne sais pas'], 'idn')}` },
    nochange() { return `<div class="top">${ib('heart')}</div><h1 tabindex="-1">Observation terminée, bravo !</h1><div class="note">Tu as terminé ton auto-observation. Continue à connaître l'aspect et les sensations habituels de tes seins, et reste attentive à tout nouveau changement.</div><button class="cta" data-a="to" data-v="done">CONTINUER</button>${T.w ? `<div class="exp"><p>C'est tout à fait légitime. Tu peux en parler à un professionnel de santé même sans signe particulier : c'est aussi son rôle.</p></div><button class="cta s" data-a="to" data-v="directory">TROUVER UN PROFESSIONNEL DE SANTÉ</button>` : `<button class="cta s" data-a="worry">Je suis quand même inquiète</button>`}` },
    change() { const f = flag(); return `<div class="top">${ib('chat')}</div><h1 tabindex="-1">${f == 2 ? 'Tu as remarqué un changement' : 'Dans le doute, un avis est possible'}</h1><p>Un changement inhabituel mérite d'être évalué par un professionnel de santé. Ça ne veut pas forcément dire qu'il s'agit d'un cancer.</p><p>Pas besoin de chercher plus loin toute seule : un professionnel pourra t'examiner et t'expliquer.</p>${S.minor ? `<p>Tu peux en parler à un adulte de confiance, qui pourra t'accompagner.</p>` : ''}<button class="cta" data-a="to" data-v="directory">TROUVER UN PROFESSIONNEL DE SANTÉ</button><button class="cta s" data-a="to" data-v="faq">EN SAVOIR PLUS</button>` },
    directory() { return `<div class="top">${ib('pin')}<h1 tabindex="-1" style="margin:0">Trouver un professionnel</h1></div><div class="exp"><p><b>Notre conseil :</b> prends rendez-vous avec un professionnel de santé près de chez toi (médecin, gynécologue ou centre de santé). Explique-lui simplement ce que tu as remarqué, où et depuis quand : il ou elle pourra t'examiner et t'expliquer.</p></div><p class="k">Tu peux venir accompagnée d'une personne de confiance.</p><button class="cta" data-a="to" data-v="done">TERMINER MA MISSION</button>` },
    done() { const u = location.href, tx = "J'ai terminé ma mission santé mammaire. Et toi ? #OctobreRose #SeinsPlon"; return `${party()}<h1 tabindex="-1">MISSION ACCOMPLIE</h1><p><b>Tu viens d'apprendre à mieux observer ta santé mammaire. Respect !</b></p>${mas("GG ! T'es officiellement ambassadrice")}<h2>Ton butin</h2><p>✓ J'ai appris<br>✓ J'ai observé<br>✓ J'ai vérifié<br>✓ Je sais quand demander un avis</p>${flag() ? '<div class="note">Pense à prendre rendez-vous avec un professionnel de santé pour le changement signalé.</div>' : ''}<p>${S.bd.map(b => `<span class="bd">${b}</span>`).join('')}</p><p class="bd big">AMBASSADRICE DE MA SANTÉ</p><button class="cta" data-a="to" data-v="badge">CRÉER MON BADGE D'AMBASSADRICE</button><div class="share"><div style="max-width:250px;margin-bottom:8px">${logo(1)}</div><h2>J'ai terminé ma mission santé mammaire.</h2><p>Et toi ?</p><p>Octobre Rose · SeinsPlon</p></div><div class="row" style="flex-wrap:wrap"><a class="cta s" style="flex:1" target="_blank" rel="noopener" href="https://wa.me/?text=${ENC(tx + ' ' + u)}">WhatsApp</a><a class="cta s" style="flex:1" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${ENC(u)}">Facebook</a><a class="cta s" style="flex:1" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${ENC(tx)}&url=${ENC(u)}">X</a></div><button class="cta" data-a="copy">PARTAGER MON PARCOURS (Instagram, lien)</button><p id="cp" tabindex="-1" role="status">${T.c}</p><h2>Un rappel pour refaire le parcours ?</h2><div class="row"><button class="cta s" data-a="rem" data-v="1">Oui</button><button class="cta s" data-a="rem" data-v="0">Non</button></div>${T.rem == 1 ? '<p class="k">Noté. Version démo : aucun rappel n\'est envoyé.</p>' : ''}<button class="cta" data-a="to" data-v="directory">TROUVER UN CENTRE DE SANTÉ</button><button class="cta s" data-a="reset">RECOMMENCER</button>` },
    badge() {
        const b = T.b, E = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
        return `<div class="top">${ib('ribbon')}</div><h1 tabindex="-1">Crée ton badge d'ambassadrice</h1><div class="note"><b>Ta vie privée :</b> ton nom et ta photo servent uniquement à fabriquer ton badge et restent sur ton appareil. Sont envoyés : ton pays (comptage par pays, sans lien avec ton nom) et, si tu le souhaites, ton e-mail pour la newsletter. Tes réponses au parcours ne sont jamais envoyées.</div>
<label class="fld" for="fn">Prénom *</label><input class="inp" id="fn" data-f="fn" autocomplete="given-name" maxlength="30" value="${E(b.fn)}">
<label class="fld" for="ln">Nom *</label><input class="inp" id="ln" data-f="ln" autocomplete="family-name" maxlength="30" value="${E(b.ln)}">
<label class="fld" for="cc">Pays *</label><select class="sel" id="cc" data-f="cc">${CO(b.cc)}</select>
<label class="fld" for="ph">Photo (facultatif)</label><input class="inp" type="file" id="ph" accept="image/*"><p class="k" id="phs" role="status">${b.img ? 'Photo ajoutée ✓' : 'Elle ne quitte pas ton appareil.'}</p>
${S.minor ? `<div class="note">Comme tu as moins de 18 ans, on ne te demande pas d'e-mail.</div>` : `<label class="fld" for="em">E-mail (pour la newsletter)</label><input class="inp" type="email" id="em" data-f="em" autocomplete="email" maxlength="120" value="${E(b.em)}"><label class="chk"><input type="checkbox" data-f="nl" ${b.nl ? 'checked' : ''}><span>Oui, je veux recevoir la newsletter SeinsPlon. Je peux me désinscrire à tout moment.</span></label>`}
<p class="err" id="bm" role="alert">${b.err}</p><button class="cta" data-a="bgen">${b.ready ? 'METTRE À JOUR MON BADGE' : 'CRÉER MON BADGE'}</button>
${b.ready ? `<canvas id="bc" width="1080" height="1350" role="img" aria-label="Aperçu de ton badge d'ambassadrice"></canvas><button class="cta" data-a="bdl">TÉLÉCHARGER MON BADGE</button>` : ''}
<button class="cta s" data-a="to" data-v="done">RETOUR</button>`},
    sources() { return `<h1 tabindex="-1">Sources médicales</h1><ul><li>Organisation mondiale de la Santé (OMS) : aide-mémoire « Cancer du sein ».</li><li>Institut national du cancer (INCa), France : informations grand public sur le cancer du sein.</li><li>Ligue contre le cancer : brochures de sensibilisation.</li></ul><div class="note">Contenus à faire valider par un comité médical local avant diffusion, et à aligner sur les recommandations nationales de dépistage.</div>${back()}` },
    faq() { const F = [["Ce parcours peut-il dire si j'ai un cancer ?", "Non. Il informe et guide l'observation. Seul un professionnel de santé peut examiner et poser un diagnostic."], ["Une grosseur, est-ce forcément grave ?", "Non, beaucoup sont bénignes. Mais tout changement nouveau mérite un avis."], ["Mes données sont-elles envoyées ?", "Vos réponses au parcours restent sur votre appareil, sans compte. Seule la page du badge d'ambassadrice demande des infos : le pays est compté sans lien avec le nom, l'e-mail n'est envoyé que si vous cochez la newsletter, et le nom et la photo ne quittent pas votre appareil."], ["À quelle fréquence refaire l'observation ?", "Demande conseil à un professionnel de santé, qui adaptera à ta situation."]]; return `<h1 tabindex="-1">Questions fréquentes</h1>${F.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}${back()}` }
};
const back = () => `<button class="cta s" data-a="back">RETOUR</button>`;

/* ===== ACTIONS ===== */
const A = {
    start() { S.started = true; track('journey_started'); go('consent') },
    resume() { go(S.last) },
    ok() { S.minor = $('#mn').checked; track('mission_started', { m: 1 }); go('quiz') },
    to(v) { go(v) }, back() { go(S.back || 'home') },
    reset() { S = null; try { localStorage.removeItem(KEY) } catch (e) { } S = { screen: 'home', xp: 0, bd: [], qi: 0, os: 0, ps: 0, pz: [], ci: [], ii: 0, ans: { id: [] }, minor: false, started: false }; T.ch = []; T.open = null; T.w = false; T.b = nb(); go('home') },
    pick(v) { const q = D.q[S.qi], ok = +v == q.a, P = a => a[Math.floor(Math.random() * a.length)]; T.p = +v; track('question_answered'); if (ok) { T.s++; xp(10); burst(10) } else T.s = 0; T.r = ok ? P(OK) + (T.s > 1 ? ` Série de ${T.s} !` : '') : P(KO); render('#ex') },
    nextq() { T.p = null; if (S.qi + 1 < D.q.length) { S.qi++; save(); render() } else done(1, 'JE SAIS', 'observe') },
    osn() { S.os++; save(); render() },
    chip(v) { T.ch = T.ch.includes(v) ? T.ch.filter(x => x != v) : [...T.ch, v]; render('[aria-pressed]') },
    obs(v) { S.ans.obs = v; done(2, "J'OBSERVE", S.minor ? 'cards' : 'palpate') },
    psn() { S.ps++; save(); render() },
    zone(v) { v = +v; if (!S.pz.includes(v)) { S.pz.push(v); save(); if (S.pz.length == 9) { xp(20); badge('JE VÉRIFIE'); track('mission_completed', { m: 3 }) } } render() },
    pdone() { go('cards') },
    card(v) { v = +v; T.open = T.open == v ? null : v; if (!S.ci.includes(v)) S.ci.push(v); save(); render('[aria-expanded=true]') },
    cdone() { done(4, null, 'identify') },
    idn(v) { S.ans.id[S.ii] = v; if (S.ii < 4) { S.ii++; save(); render() } else { xp(10); track('mission_completed', { m: 5 }); const f = flag(); if (f) track('health_change_reported'); badge("J'AGIS"); go(f ? 'change' : 'nochange') } },
    worry() { T.w = true; render() },
    copy() { const t = "J'ai terminé ma mission santé mammaire. Et toi ? #OctobreRose #SeinsPlon " + location.href; track('share_clicked'); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => T.c = 'Copié ! Collez-le dans Instagram ou ailleurs.').catch(() => T.c = 'Copie impossible ici : utilisez les boutons de partage.').then(() => render('#cp')) },
    async bgen() {
        const b = T.b; b.err = '';
        if (!b.fn.trim() || !b.ln.trim()) b.err = 'Indique ton prénom et ton nom.'; else if (!b.cc) b.err = 'Choisis ton pays.'; else if (!S.minor && b.nl && !EM.test(b.em.trim())) b.err = 'Vérifie ton e-mail : il semble incomplet.';
        if (b.err) { render('#bm'); return } b.ready = true; try { await document.fonts.load('600 80px Fredoka') } catch (e) { }
        render('#bc'); drawBadge($('#bc'), b); track('badge_generated')
    },
    bdl() {
        const b = T.b, c = $('#bc'); if (!c) return; c.toBlob(bl => { const a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'badge-ambassadrice-seinsplon.png'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000) }, 'image/png');
        if (!b.sent) { b.sent = 1; send({ t: 'dl', c: b.cc }); if (!S.minor && b.nl && EM.test(b.em.trim())) send({ t: 'nl', e: b.em.trim() }); track('badge_downloaded') }
    },
    rem(v) { T.rem = +v; render('#cp') }
};

/* ===== RENDU & ÉVÈNEMENTS ===== */
function render(f) {
    const s = SC[S.screen] ? S.screen : 'home'; if (s == 'done' && !S.fin) { S.fin = 1; save(); track('journey_completed') }
    app.innerHTML = hd() + `<section class="sc${s == 'change' ? ' sober' : ''}">${SC[s]()}</section>${s == 'change' ? '' : ft()}`;
    const e = $(f || 'h1') || app; e.focus && e.focus({ preventScroll: true })
}
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && A[b.dataset.a]) A[b.dataset.a](b.dataset.v) });
document.addEventListener('keydown', e => { if ((e.key == 'Enter' || e.key == ' ') && e.target.matches('[role=button][data-a]')) { e.preventDefault(); e.target.dispatchEvent(new Event('click', { bubbles: true })) } });
function drawBadge(c, b) {
    const x = c.getContext('2d'), W = 1080, H = 1350, P = '#5B1A3A', R = '#FFC2D8', F = s => `600 ${s}px Fredoka,Nunito,system-ui,sans-serif`;
    const fit = (t, s, w) => { do { x.font = F(s); s -= 4 } while (x.measureText(t).width > w && s > 24) };
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, P); g.addColorStop(1, '#8E2A5A'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.textAlign = 'center'; x.fillStyle = R; fit('OCTOBRE ROSE · SEINSPLON', 40, 900); x.fillText('OCTOBRE ROSE · SEINSPLON', W / 2, 110);
    x.save(); x.translate(W / 2, 250); x.scale(4, 4); x.fill(new Path2D((rib.match(/d="([^"]+)"/) || [])[1] || '')); x.restore();
    x.save(); x.beginPath(); x.arc(W / 2, 650, 220, 0, 7); x.clip();
    if (b.img) x.drawImage(b.img, W / 2 - 220, 430, 440, 440); else { const i = ((b.fn[0] || '') + (b.ln[0] || '')).toUpperCase(); x.fillStyle = '#FCE4EC'; x.fillRect(0, 0, W, H); x.fillStyle = P; fit(i, 200, 300); x.fillText(i, W / 2, 720) }
    x.restore(); x.lineWidth = 14; x.strokeStyle = '#fff'; x.beginPath(); x.arc(W / 2, 650, 220, 0, 7); x.stroke();
    const n1 = b.fn.trim(), n2 = b.ln.trim().toUpperCase(); x.fillStyle = '#fff'; fit(n1, 96, 900); x.fillText(n1, W / 2, 985); x.fillStyle = R; fit(n2, 64, 900); x.fillText(n2, W / 2, 1060);
    x.fillStyle = '#fff'; x.beginPath(); (x.roundRect || x.rect).call(x, 110, 1110, 860, 92, 46); x.fill();
    x.fillStyle = P; const t = 'AMBASSADRICE DE MA SANTÉ'; fit(t, 46, 780); x.fillText(t, W / 2, 1172);
    x.fillStyle = R; const p = cname(b.cc); fit(p, 40, 900); x.fillText(p, W / 2, 1255); fit('Simplon Bénin', 30, 600); x.fillText('Simplon Bénin', W / 2, 1312)
}
['input', 'change'].forEach(v => document.addEventListener(v, e => { const t = e.target, f = t.dataset && t.dataset.f; if (f && T.b) T.b[f] = t.type == 'checkbox' ? t.checked : t.value }));
document.addEventListener('change', async e => { const t = e.target; if (t.id != 'ph' || !t.files[0]) return; const s = $('#phs'); try { const im = await createImageBitmap(t.files[0], { imageOrientation: 'from-image' }), c = document.createElement('canvas'); c.width = c.height = 440; const k = Math.max(440 / im.width, 440 / im.height), w = im.width * k, h = im.height * k; c.getContext('2d').drawImage(im, (440 - w) / 2, (440 - h) / 2, w, h); T.b.img = c; s.textContent = 'Photo ajoutée ✓' } catch (_) { T.b.img = null; s.textContent = "Cette photo n'a pas pu être lue. Essaie une autre image." } });
render();