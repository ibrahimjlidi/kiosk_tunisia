# Kiosk Tunisia — Station de Carburant ERP

Système de gestion d'entreprise (ERP) pour stations-service en Tunisie, construit avec le **MERN Stack** (MongoDB, Express, React, Node.js) et TypeScript.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur)
- **MongoDB Community Server** (en cours d'exécution localement)
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
cp .env.exemple .env
```

Configurez ensuite le fichier `.env` avec vos propres valeurs :

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fuelstation_erp
JWT_SECRET=votre_secret_jwt_super_securise
```

Lancer le serveur en mode développement :

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

### 4. Base de Données (MongoDB)

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
| MongoDB | mongodb://127.0.0.1:27017/fuelstation_erp |

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
- **Base de données** : MongoDB avec Mongoose ODM
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
