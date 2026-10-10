# SeinsPlon sur Vercel

Contenu du projet :
- `index.html` : la plateforme (page unique).
- `api/e.js` : reçoit les évènements anonymes (parcours commencé, terminé, badge téléchargé).
- `api/stats.js` et `api/admin.js` : donnent les chiffres (JSON et page lisible), protégés par une clé.
- `lib/` : connexion à la base et calculs. `schema.sql` : tables (créées automatiquement au premier appel).

## Déployer, pas à pas

1. **Mettre le dossier sur GitHub** (nouveau dépôt, privé ou public, contenant ces fichiers).
2. **Importer le dépôt dans Vercel** : « Add New… > Project », choisir le dépôt, ne rien changer aux réglages, puis « Deploy ».
3. **Ajouter la base Postgres** : dans le projet Vercel, onglet « Storage » (ou « Integrations »), ajouter une base Postgres via Neon. Vercel renseigne alors la variable `DATABASE_URL` (ou `POSTGRES_URL`) automatiquement. Les noms et le parcours exacts peuvent évoluer : vérifie dans ton tableau de bord.
4. **Créer la clé d'accès aux chiffres** : « Settings > Environment Variables », ajouter `ADMIN_KEY` avec une longue phrase secrète (12 caractères minimum, 30 ou plus recommandé).
5. **Redéployer** (« Deployments > Redeploy ») pour que les variables soient prises en compte.

## Vérifier que ça marche

- Ouvre `https://TON-SITE.vercel.app/admin?key=TA_CLE` : tu dois voir quatre compteurs à 0.
- Fais un parcours complet sur le site, télécharge le badge, puis recharge `/admin` : 1 parcours commencé, 1 terminé, 1 badge. Retélécharge le badge ou recharge la page : les chiffres ne bougent pas.
- Données brutes : `https://TON-SITE.vercel.app/api/stats?key=TA_CLE`, ou avec l'en-tête `Authorization: Bearer TA_CLE`.

## Comment le double comptage est évité

- Chaque parcours reçoit un identifiant aléatoire. La base impose qu'un même évènement n'existe qu'une fois par parcours : recharger la page, cliquer plusieurs fois ou retélécharger le badge ne change rien.
- Le badge n'est compté que lorsque le téléchargement est réellement accepté.
- « Recommencer » ouvre un nouveau parcours, qui compte à nouveau. Les « appareils différents » restent stables.
- Limite : une personne qui change de téléphone ou vide son navigateur est comptée comme un nouvel appareil.

## Limites à connaître

- Les identifiants sont créés par le navigateur : quelqu'un qui le veut vraiment peut en fabriquer pour gonfler les chiffres. Pour limiter les abus, active une règle de limitation de débit sur `/api/e` dans le pare-feu de Vercel (« Firewall »).
- Les jours sont comptés en UTC.
- Ne partage jamais l'adresse `/admin?key=…` : la clé apparaît dans l'adresse. Préfère l'en-tête `Authorization` pour un usage automatisé.

## Confidentialité

La base ne contient que deux identifiants aléatoires, le type d'évènement et l'heure. Ni le prénom du badge, ni les réponses, ni les signalements de changement ne sont envoyés.

## Tester en local (sans Vercel ni base)

```
npm test
```
Ce test utilise SQLite en mémoire pour vérifier la logique (doublons, données invalides, clé d'accès).
