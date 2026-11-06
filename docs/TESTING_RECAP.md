# Récapitulatif des tests

Date de l'exécution : 6 novembre 2026  
Environnement : stack locale Docker, API Node.js sur localhost, MySQL `fuelstation_erp`, navigateur Chromium Playwright  
Scope : contrôles unitaires, schéma/migration, intégration HTTP, E2E navigateur, smoke performance et audit de dépendances.

## Résumé

| Catégorie | Résultat | Détail |
|---|---|---|
| Unitaires backend | PASS | 11 tests réussis |
| Migration | PASS | 5 tests réussis |
| Intégration | PASS | API et MySQL connectés; une route protégée renvoie 401 sans authentification |
| E2E | PARTIEL / BLOQUÉ | 2 tests isolés réussis antérieurement; dernière tentative complète bloquée avant exécution par l'absence de `libnspr4` pour Chromium |
| Performance | PASS (smoke seulement) | 40 requêtes vers `/health`, concurrence 4; p50 13,1 ms, p95 62,6 ms, max 193,7 ms, environ 112,5 requêtes/s |
| Sécurité HTTP | PASS (smoke seulement) | L'API rejette une authentification absente ou un bearer token invalide (401) |
| Audit des dépendances | PASS après corrections | Les deux audits npm signalent maintenant 0 vulnérabilité |
| Builds | PASS | Build TypeScript serveur et build/type-check client réussis |
| Lint client | BLOQUÉ | `eslint` n'est pas installé dans les dépendances client |

Les mesures de performance sont une vérification légère de disponibilité, pas un test de charge, un SLO ou une garantie de capacité. Elles dépendent de la machine, du réseau Docker et de la charge au moment de l'exécution.

## Commandes ajoutées

À exécuter depuis la racine du dépôt :

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:security
npm run test:all
```

- `test:unit` lance les tests unitaires backend et les tests de migration.
- `test:integration` vérifie l'endpoint de santé, la connexion MySQL et le refus d'une route protégée sans authentification. Il n'écrit pas de données métier.
- `test:e2e` exécute les 44 cas Playwright définis dans `server/e2e/`.
- `test:performance` envoie par défaut 40 requêtes vers l'endpoint local de santé avec une concurrence de 4. Les bornes sont 200 requêtes et 10 workers.
- `test:security` vérifie les refus d'accès sans token et avec un token invalide, puis exécute les audits npm server et client.
- `test:all` enchaîne toutes les suites. Il s'arrête sur le premier échec.

Pour une URL API locale non standard, utiliser `TEST_API_URL`. Pour les mesures de performance, utiliser `PERF_API_URL`, `PERF_REQUESTS` et `PERF_CONCURRENCY`. Les scripts HTTP rejettent les hôtes non locaux afin d'éviter de viser accidentellement un service distant ou la production.

## Détails des vérifications effectuées

### Unitaires et migration

Commande : `npm run test:unit`

- 11 tests unitaires backend réussis, notamment permissions, tokens, mots de passe, logique de shift/clôture et mapping des champs SQL camelCase.
- 5 tests de migration réussis.

### Intégration API/MySQL

Commande : `npm run test:integration`

- API locale disponible.
- MySQL répond connecté pour `fuelstation_erp`.
- `GET /stations` sans authentification renvoie HTTP 401.

### E2E Playwright

Commandes essayées :

```bash
npm run test:e2e
cd server
npx playwright test --config playwright.config.ts e2e/workflows.spec.ts --grep "invalid credentials stay on login and show an error"
cd server
npx playwright test --config playwright.config.ts e2e/workflows.spec.ts --grep "ADMIN workflow can open and cancel the shift-opening form"
```

- Les deux cas ciblés (mauvais identifiants et ouverture/annulation du formulaire shift par Admin) ont réussi (2/2).
- Le lancement initial ne pouvait pas démarrer Chromium : les bibliothèques système `libnspr4`, `libnss3` et ALSA manquaient. Une copie temporaire locale des bibliothèques a permis de démarrer Chromium; aucun paquet système n'a été installé.
- Le run complet a échoué dès les premiers scénarios Operator avec `Invalid email or password`; le scénario Manager essayé ensuite a échoué de la même façon, puis le run a été arrêté. La suite utilise `demo_st002_manager@example.test`, `demo_st002_supervisor@example.test` et `demo_st002_operator@example.test`; les comptes doivent exister dans une base de test pour terminer la matrice des rôles. Le compte Supervisor n'a pas été vérifié dans ce run.
- Nouvelle tentative complète : `npm run test:e2e --prefix server` a détecté les 44 cas, mais Chromium n'a pas pu démarrer car `libnspr4.so` manque sur l'hôte. Cette tentative n'a donc pas testé les identifiants ni les workflows. Les bibliothèques nécessaires doivent être installées ou Playwright doit être exécuté dans un environnement contenant ses dépendances.
- Le run complet n'a donc pas été validé. Préparer les comptes et les données de démonstration uniquement dans une base de test dédiée, puis relancer les 44 tests. Ne pas injecter les fixtures dans une base de production ou supprimer un volume pour les créer.

### Performance

Commande : `PERF_API_URL=http://localhost/api/v1/health npm run test:performance`

Résultat standalone après les mises à jour : 40 requêtes, concurrence 4, environ 112,5 req/s, p50 13,1 ms, p95 62,6 ms, max 193,7 ms. Un run concurrent avec les audits npm a été beaucoup plus lent; ces chiffres sont sensibles à la charge de la machine. Il s'agit d'un smoke test, pas d'une comparaison de performance contrôlée.

### Sécurité et dépendances

Commande : `npm run test:security`

- Les contrôles HTTP locaux ont réussi : les demandes sans token et avec un token bearer invalide sont refusées (401).
- Le smoke test navigateur a détecté que la page de connexion affichait les identifiants du compte démo Admin. L'affichage est maintenant limité aux builds de développement (`import.meta.env.DEV`). Le build de production a été vérifié sans cette chaîne, puis le conteneur frontend a été reconstruit; le navigateur intégré confirme que les identifiants ne sont plus affichés.
- Les audits initiaux avaient relevé 6 packages vulnérables côté serveur (1 moderate, 3 high, 2 critical) et 10 côté client (4 moderate, 6 high). Ces avis reflétaient les versions alors verrouillées et ne prouvaient pas à eux seuls une exploitabilité dans l'application.
- Corrections appliquées :
  - Serveur : Express est passé à 4.22.3; les versions transitives de `body-parser`, `proxy-addr`, `brace-expansion` et `qs` ont été corrigées. Les paquets `bcrypt` / `@types/bcrypt`, inutilisés puisque le code emploie `bcryptjs`, ont été supprimés; cela a aussi retiré `@mapbox/node-pre-gyp` et `tar` de l'arbre installé.
  - Client : les versions d'Axios, `follow-redirects`, `nanoid`, `source-map-js`, `postcss-selector-parser` et `esbuild` ont été corrigées; `react-router-dom` est passé à 7.18.5 et Vite à 7.3.7. Zod a été retiré car aucune utilisation n'existe dans le code client.
- Validation finale : `npm run test:security`, `npm audit --prefix server --audit-level=high` et `npm audit --prefix client --audit-level=high` réussissent avec 0 vulnérabilité.
- React Router 7 et Vite 7 sont des changements de version majeure. Le build client et les deux tests E2E ciblés ont réussi avec ces versions.

### Builds et lint

- `cd server && npm run build` : réussi.
- `cd client && npm run build` : réussi (avertissement existant de chunk JavaScript supérieur à 500 kB).
- `cd client && npm run lint` : non exécuté, car `eslint` est absent (`eslint: not found`).
- Images Docker backend et frontend reconstruites puis conteneurs redémarrés sans redémarrer les dépendances (`up --no-deps`). MySQL et ses volumes sont restés intacts; après redémarrage, l'API `/api/v1/health` et la route frontend `/login` ont répondu HTTP 200.

## Actions recommandées

1. Installer les dépendances système Chromium (dont `libnspr4`), utiliser une base de test isolée, amorcer les comptes demo requis pour les quatre rôles, puis exécuter les 44 cas Playwright.
2. Installer/configurer ESLint dans le client si le lint doit être une porte de validation obligatoire.
3. Pour une analyse de performance sérieuse, définir des objectifs et un environnement de test dédié avant d'ajouter un benchmark ou un test de charge.
4. Étendre les tests de sécurité d'authentification/RBAC aux contrôles de tokens expirés ou altérés, aux validations d'entrées et à l'isolation inter-station.
