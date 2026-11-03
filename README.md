# Kiosk Tunisia — Station de Carburant ERP

Système de gestion d'entreprise (ERP) pour stations-service en Tunisie, construit avec Express, React, Node.js et TypeScript. MongoDB est conservé comme source pendant la migration progressive vers MySQL 8.4.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur)
- **MongoDB Community Server** (source existante, à conserver pendant la migration)
- **Docker Compose** (pour MySQL 8.4 et le déploiement conteneurisé)
- **npm** ou **yarn**

## 🚀 Installation et Configuration

### 1. Cloner le projet

```bash
git clone https://github.com/ibrahimjlidi/kiosk_tunisia.git
cd kiosk_tunisia
```

### 2. Configuration du Backend (Server)

```bash
# Aller dans le dossier server
cd server

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp -n .env.exemple .env
```

Configurez ensuite le fichier `.env` avec vos propres valeurs :

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fuelstation_erp
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=station_app
DB_PASSWORD=
DB_NAME=fuelstation_erp
JWT_SECRET=
JWT_REFRESH_SECRET=
```

Renseignez `DB_PASSWORD` et les secrets JWT avec des valeurs uniques avant le démarrage. Le modèle laisse volontairement ces secrets vides. Compose remplace les adresses hôte par les noms de services (`mongo`, `mysql`) à l'intérieur des conteneurs.

### Base MySQL et migration progressive

Les fichiers Compose démarrent MySQL 8.4 avec un volume persistant distinct en développement et en production. MongoDB et son volume existant restent présents pour permettre une migration par étapes. Compose ne migre pas automatiquement les données. Ne supprimez pas le volume MongoDB et n'utilisez pas `docker compose down -v`.

Depuis la racine du dépôt, après avoir complété `server/.env`, définissez un mot de passe root MySQL fort dans le shell puis démarrez le profil souhaité :

```bash
read -rsp 'Mot de passe root MySQL: ' MYSQL_ROOT_PASSWORD; printf '\n'; export MYSQL_ROOT_PASSWORD
docker compose --env-file server/.env -f docker-compose.yml up -d --build
# En production, utiliser plutôt :
docker compose --env-file server/.env -f docker-compose.prod.yml up -d --build
```

Le backend reçoit `DB_HOST=mysql`, `DB_PORT=3306` et les mêmes identifiants `DB_USER`, `DB_PASSWORD`, `DB_NAME` que MySQL. Avant toute bascule, sauvegardez MongoDB, vérifiez le plan sans écriture, puis appliquez explicitement la migration. Pour le Compose de développement (ports hôte MongoDB 27017 et MySQL 3306), exécutez depuis `server/` :

```bash
cd server
MONGO_URI=mongodb://127.0.0.1:27017/fuelstation_erp DB_HOST=127.0.0.1 DB_PORT=3306 npm run migrate:mongodb:mysql -- --dry-run
MONGO_URI=mongodb://127.0.0.1:27017/fuelstation_erp DB_HOST=127.0.0.1 DB_PORT=3306 npm run migrate:mongodb:mysql -- --apply
```

En production, exécutez la même paire de commandes avec `MONGO_URI=mongodb://127.0.0.1:27018/fuelstation_erp`, `DB_HOST=127.0.0.1` et `DB_PORT=3307`. Vérifiez les comptes et les données migrées avant la bascule applicative. Conservez MongoDB et sa sauvegarde jusqu'à validation complète et fin de la période de retour arrière. Les étapes de déploiement et de sauvegarde sont détaillées dans [les notes de préparation à la production](./docs/PRODUCTION_READINESS.md).

### Démarrage local du backend

Pour lancer le serveur en mode développement :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000`.

### 3. Configuration du Frontend (Client)

Ouvrez un nouveau terminal :

```bash
# Aller dans le dossier client
cd client

# Installer les dépendances
npm install

# Lancer le client en mode développement
npm run dev
```

Le client démarre sur `http://localhost:5173`.

### 4. Base de Données (MongoDB source)

Assurez-vous que MongoDB Community Server est en cours d'exécution sur :
```
mongodb://127.0.0.1:27017/fuelstation_erp
```

### 5. Initialisation des Données de Démonstration (Seed)

Le seed de démonstration est additif et peut être relancé sans supprimer les données existantes :

```bash
cd server
npm run seed
```

Il ajoute des stations de démonstration à Sousse, Sfax et Hammamet, des équipes, utilisateurs de test, pompes, pistolets, cuves, ventes, quarts, fournisseurs, clients, achats, dépenses et données de rapports.

Comptes de démonstration (mot de passe commun : `Demo@123`) :
- Manager : `demo_st002_manager`, `demo_st003_manager`, `demo_st004_manager`
- Supervisor : remplacer `manager` par `supervisor`
- Operator : remplacer `manager` par `operator`

Le seed historique qui efface et recrée les collections est séparé et nécessite une confirmation explicite :

```bash
npm run seed:reset
```

Ne l'utilisez que sur une base de test que vous pouvez réinitialiser.

## 🌐 Accès à l'Application

| Composant | URL |
|-----------|-----|
| Frontend (Client React) | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| MongoDB (source) | mongodb://127.0.0.1:27017/fuelstation_erp |

### Identifiants de Connexion

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Administrateur | admin@fuelstation.com | Admin@123 |

## Workflows par rôle

Consultez les [diagrammes des workflows utilisateurs](./docs/user-workflows.md) pour les parcours Admin, Manager, Supervisor et Operator, ainsi que la [checklist de test manuel Operator](./docs/operator-manual-test-checklist.md).

## 📁 Structure du Projet

```
kiosk_tunisia/
├── client/                     # Frontend React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── context/            # Contextes React (Auth, etc.)
│   │   ├── features/           # Pages par fonctionnalité
│   │   ├── services/           # Appels API (axios)
│   │   └── types/              # Types TypeScript
│   └── ...
├── server/                     # Backend Express + TypeScript
│   ├── src/
│   │   ├── config/             # Configuration (DB, env)
│   │   ├── controllers/        # Logique métier des routes
│   │   ├── middlewares/        # Middlewares (auth, error)
│   │   ├── models/             # Modèles Mongoose
│   │   ├── routes/             # Définition des routes
│   │   ├── seeds/              # Scripts d'initialisation
│   │   ├── services/           # Services métier
│   │   └── validators/         # Validation des requêtes
│   └── ...
├── README.md
└── TODO.md
```

## 🛠️ Scripts Disponibles

### Backend (server/)

| Script | Commande | Description |
|--------|----------|-------------|
| Développement | `npm run dev` | Lance le serveur avec hot-reload |
| Build | `npm run build` | Compile TypeScript vers JavaScript |
| Production | `npm start` | Lance le serveur compilé |
| Seed | `npm run seed` | Initialise la base de données |

### Frontend (client/)

| Script | Commande | Description |
|--------|----------|-------------|
| Développement | `npm run dev` | Lance le client avec Vite |
| Build | `npm run build` | Compile pour la production |
| Preview | `npm run preview` | Prévisualise le build de production |

### Tests des workflows utilisateur

Avec l'application démarrée et les comptes de démonstration disponibles :

```bash
cd server
npx playwright install --with-deps chromium
npm run test:e2e
```

Les tests vérifient les accès Admin, Manager, Supervisor et Operator, ainsi que des interactions qui n'écrivent pas dans la base. Pour cibler un autre environnement, définissez `E2E_BASE_URL` et les variables `E2E_ADMIN_*`, `E2E_MANAGER_*`, `E2E_SUPERVISOR_*`, `E2E_OPERATOR_*`.

## 🔧 Technologies Utilisées

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Langage** : TypeScript
- **Base de données historique** : MongoDB avec Mongoose ODM; migration vers MySQL 8.4 progressive et explicite
- **Authentification** : JWT + bcrypt
- **Validation** : express-validator

### Frontend
- **Framework** : React 18
- **Build Tool** : Vite
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **State Management** : Redux Toolkit + React Query
- **Routing** : React Router v6
- **Formulaires** : React Hook Form + Zod

---

## 📝 Feuille de Route (Development Roadmap)

- [x] **Phase 1** : Mise en place du projet et infrastructure
- [x] **Phase 2** : Authentification et rôles utilisateurs (RBAC)
- [ ] **Phase 3** : Gestion de la station (pompes, pistolets, produits)
- [ ] **Phase 4** : Équipes et quarts de travail
- [ ] **Phase 5** : Opérations de vente de carburant
- [ ] **Phase 6** : Caisse et réconciliation financière
- [ ] **Phase 7** : Gestion des clients et crédits
- [ ] **Phase 8** : Produits Kiosque et point de vente
- [ ] **Phase 9** : Catalogue de services payants
- [ ] **Phase 10** : Dépenses opérationnelles
- [ ] **Phase 11** : Fournisseurs et achats de carburant
- [ ] **Phase 12** : Inventaire des cuves et jaugeage
- [ ] **Phase 13** : Clôture de quart et verrouillage
- [ ] **Phase 14** : Clôture journalière et audit
- [ ] **Phase 15** : Tableau de bord et rapports analytiques
