# Operator — actions métier et checklist de test manuel

Cette checklist extrait les actions d’équipe/opérateur décrites dans le cahier métier arabe, puis les compare aux écrans et permissions actuellement présents dans l’application. Cochez chaque étape après l’avoir testée et notez les écarts.

> **Important :** utilisez une base de démonstration ou de test. L’enregistrement d’une vente POS, d’une vente de service, d’une vente sur shift ou d’un relevé modifie les données et ne doit pas être testé sur des données de production.

Compte de démonstration défini dans les tests E2E :

- E-mail : `demo_st002_operator@example.test`
- Mot de passe : `Demo@123`

Si ce compte n’existe pas dans votre base, utilisez un compte Operator actif.

## Tests automatisés liés à cette checklist

Depuis la racine du dépôt :

```bash
npm --prefix server run test:e2e -- e2e/operator-actions.spec.ts
cd server
npx tsx --test src/services/shift.service.test.ts
```

Les tests E2E couvrent la lecture des données et permissions API, la portée des shifts assignés, l’interdiction d’ouverture pour un membre, la sélection d’équipe par un leader, le calcul et la sauvegarde simulée des relevés, les ventes de shift/POS/services avec API de vente simulée et les refus d’accès du rôle Operator. Les tests de calcul couvrent les index identiques (zéro litre), les montants calculés et l’agrégation par produit.

Les écritures de vente et de relevé dans les E2E sont interceptées et simulées; elles ne modifient pas la base de démonstration. Les actions interdites sont vérifiées par réponses d’autorisation de l’API. Les tests ne peuvent pas rendre disponibles les opérations que le rôle Operator n’a pas actuellement le droit d’effectuer.

Vérifications effectuées : les 7 scénarios Playwright sont découverts, les builds client et serveur passent, le contrôle TypeScript ciblé passe et les 3 tests unitaires passent. L’exécution Playwright reste à faire sur un hôte où Chromium peut démarrer; sur l’hôte actuel, elle est bloquée par la bibliothèque système manquante `libnspr4.so`.

## Actions Operator extraites du cahier métier

Le texte décrit l’équipe de quart comme responsable des opérations de sa période. Les tâches ci-dessous sont donc les **actions métier attendues**, pas une garantie qu’elles sont toutes déjà disponibles avec le rôle Operator dans l’application.

### A. Prendre le quart et contrôler les index

- [ ] Choisir la station, l’équipe et la période de travail (matin, après-midi ou nuit), puis ouvrir le quart.
- [ ] Vérifier, pour chaque pompe et pistolet, l’index d’ouverture hérité de l’index de fermeture de l’équipe précédente.
- [ ] Ne pas modifier un index d’ouverture sauf correction exceptionnelle autorisée.
- [ ] En fin de période, saisir l’index de fermeture pour chaque pistolet.
- [ ] Vérifier que le système calcule `index de fermeture - index d’ouverture` pour obtenir les litres vendus.
- [ ] Vérifier qu’un pistolet sans vente conserve le même index d’ouverture et de fermeture, donc un volume vendu nul.

### B. Enregistrer et vérifier les opérations du quart

- [ ] Enregistrer les ventes de carburant rattachées au quart, à la pompe et au pistolet.
- [ ] Vérifier par produit les quantités, prix de vente, prix d’achat, marge, TVA et total TTC calculés.
- [ ] Enregistrer les ventes de produits de kiosque.
- [ ] Enregistrer les ventes de services.
- [ ] Enregistrer les dépenses quotidiennes du quart.
- [ ] Enregistrer les montants réellement encaissés par moyen de paiement : espèces, carte carburant, carte bancaire et virement.
- [ ] Enregistrer une vente à crédit et l’associer au client ou à l’organisme concerné.
- [ ] Enregistrer un règlement partiel ou total d’une dette client, séparément des ventes du jour.
- [ ] Enregistrer les retours/quantités prélevées lors d’un contrôle Kif afin qu’elles soient distinguées des ventes réelles.
- [ ] Effectuer le jaugeage prévu pour la période et saisir la quantité réellement mesurée en cuve.
- [ ] Si le processus de la station le demande, saisir les réceptions d’achat de carburant et les quantités retournées au fournisseur; vérifier la quantité nette reçue.

### C. Rapprocher et clôturer la période

- [ ] Comparer les ventes TTC du quart aux encaissements saisis.
- [ ] Vérifier que les règlements de dettes antérieures ne sont pas comptés comme de nouvelles ventes.
- [ ] Identifier le solde nul, l’excédent ou le manque; faire corriger/justifier tout écart selon la procédure de la station.
- [ ] Vérifier les relevés, ventes, services, dépenses, crédits, règlements et jaugeages avant de clôturer.
- [ ] Clôturer le quart; vérifier que les index de fermeture deviennent les index d’ouverture par défaut de la période suivante.
- [ ] Ne commencer le quart suivant qu’après la clôture du précédent.

### Confrontation avec l’application actuelle

| Action métier attendue | État observé dans l’application pour Operator |
|---|---|
| Voir les stations, pompes, cuves, produits et shifts | Écrans de consultation accessibles. |
| Saisir les index de fermeture d’un shift ouvert | Le formulaire et l’API permettent la mise à jour des relevés. |
| Ouvrir un shift avec une équipe affectée | Seul le leader Operator voit ses équipes actives et peut ouvrir un shift pour l’une d’elles. |
| Consulter les shifts | L’Operator ne reçoit que les shifts où son compte est explicitement affecté comme employé. |
| Enregistrer une vente POS ou une vente de service | Disponible; ces opérations écrivent une vente dans la base. |
| Enregistrer une vente carburant depuis le détail du shift | Bouton disponible si le shift a un volume; le choix du client pour le mode crédit peut échouer car l’Operator ne peut pas charger les clients. |
| Saisir puis enregistrer les paiements du shift | Autorisé uniquement pour un Operator affecté au shift ouvert. |
| Clôturer un shift | Réservé à Admin, Manager et Supervisor; le contrôle n’est pas affiché à l’Operator. |
| Créer/modifier les dépenses ou enregistrer un achat | L’Operator peut consulter les dépenses et achats, mais ne peut pas les créer/modifier. |
| Gérer un règlement de crédit | Aucun parcours Operator de règlement de crédit identifié dans l’interface actuelle. |
| Saisir les retours Kif ou un jaugeage | Routes/pages non accessibles à l’Operator actuellement. |
| Enregistrer un achat carburant/retour fournisseur | Parcours d’achat non disponible à l’Operator actuellement. |
| Clôturer la journée et verrouiller toutes les opérations | Page de clôture journalière non accessible à l’Operator; réservée aux rôles de supervision/gestion. |

## 1. Connexion et navigation

- [ ] Se connecter avec le compte Operator.
  - Attendu : arrivée sur **Dashboard** et rôle `OPERATOR` visible dans l’en-tête.
- [ ] Vérifier les liens visibles : Dashboard, Station, Pumps, Tanks, Products, Purchases, Expenses, Shifts, POS, Services et Reports.
- [ ] Ouvrir directement `/dashboard` après connexion.
  - Attendu : le tableau de bord s’affiche.
- [ ] Se déconnecter.
  - Attendu : retour vers `/login`.
- [ ] Après déconnexion, essayer d’ouvrir `/dashboard`.
  - Attendu : redirection vers `/login`.

## 2. Dashboard et consultation des données

- [ ] Sur le Dashboard, vérifier les métriques visibles (stations, pompes, produits, shifts actifs et tanks).
- [ ] Vérifier que la métrique **Users** n’est pas affichée.
- [ ] Ouvrir **Station** et consulter les stations.
- [ ] Ouvrir **Pumps** et consulter les pompes/pistols.
- [ ] Ouvrir **Tanks** et consulter les tanks.
- [ ] Ouvrir **Products** et consulter le catalogue.
- [ ] Pour ces écrans, vérifier qu’aucune action de création, modification ou suppression n’est proposée à l’Operator.

## 3. Purchases et Expenses — consultation seule

- [ ] Ouvrir **Purchases** et consulter le registre des achats.
- [ ] Vérifier que **New Purchase** n’est pas proposé.
- [ ] Ouvrir **Expenses** et consulter les dépenses.
- [ ] Vérifier que **New Expense** et les actions de changement de statut payé/en attente ne sont pas proposées.
- [ ] Actualiser la page et vérifier que les listes se chargent sans erreur d’accès.

## 4. Shifts

### Consultation et relevés

- [ ] Ouvrir **Shifts** et consulter la liste des shifts.
- [ ] Tester le filtre par date.
- [ ] Tester le filtre par station et le bouton **Refresh**.
- [ ] Ouvrir un shift existant avec **View details**.
- [ ] Consulter les index d’ouverture/de fermeture et les totaux de vente, TVA, profit et rapprochement.
- [ ] Sur un shift ouvert de test, modifier un index de fermeture puis cliquer **Save & Recalculate**.
  - Attendu : les chiffres sont recalculés et le message de confirmation s’affiche.
  - Cette action sauvegarde un relevé.
- [ ] Sur un shift ouvert avec un volume vendu, ouvrir **Record Sale**, sélectionner un moyen de paiement, puis annuler.
- [ ] Sur un shift ouvert de test, enregistrer une vente via **Record Sale** et vérifier son résultat. Cette action crée une vente réelle dans la base.
  - Le moyen de paiement **Credit** dépend d’une liste de clients que l’Operator n’est pas autorisé à charger; privilégiez les autres moyens de paiement pour ce test.

### Ouverture, paiements et clôture

- [ ] Avec un Operator membre (non leader), vérifier que **Open New Shift** n’est pas affiché.
- [ ] Avec un Operator leader, vérifier que **Open New Shift** permet de choisir une de ses équipes actives puis d’ouvrir un shift.
- [ ] Avec un Operator, vérifier que seuls les shifts où il est listé parmi les employés apparaissent, même s’il a ouvert ou dirige une équipe d’un autre shift.
- [ ] Tenter d’ouvrir directement le détail d’un shift non assigné et vérifier que l’API refuse l’accès.
- [ ] Dans un shift ouvert auquel l’Operator est affecté, enregistrer les relevés et les paiements; vérifier que le solde est recalculé.
- [ ] Vérifier que **Close Shift & Lock** et **Close** ne sont pas affichés à l’Operator.

## 5. POS — vente de produits/carburant

- [ ] Ouvrir **POS**.
- [ ] Sélectionner une station, un moyen de paiement, un produit et une quantité.
- [ ] Cliquer **Add to cart** et vérifier que le reçu et les totaux se mettent à jour.
- [ ] Ajouter à nouveau le même produit avec le même moyen de paiement et vérifier l’augmentation de la quantité.
- [ ] Cliquer **Clear cart** et vérifier que le panier est vide.
- [ ] Sur la base de test uniquement, ajouter un produit et cliquer **Complete sale**.
  - Attendu : confirmation de vente et panier vidé.
- [ ] Vérifier le message affiché en cas de panier vide ou d’échec de vente.

## 6. Services — vente d’un service

- [ ] Ouvrir **Services**.
- [ ] Choisir une station et un service actif.
- [ ] Modifier la quantité et vérifier le prix/total dans l’aperçu.
- [ ] Cliquer **Record service sale** sur la base de test.
  - Attendu : confirmation que la vente de service a été enregistrée.
  - Le moyen de paiement est actuellement fixé à **Cash** dans cet écran.

## 7. Pages auxquelles l’Operator ne doit pas accéder

Pour chaque URL ci-dessous, essayer l’accès direct après connexion.

- [ ] `/reports` et `/reports/sales`
- [ ] `/reports/analytics`
- [ ] `/reports/audit`
- [ ] `/reports/credits`
- [ ] `/daily-close`
- [ ] `/kif-returns`
- [ ] `/suppliers`
- [ ] `/purchase-orders`
- [ ] `/tank-gauging`
- [ ] `/employees`
- [ ] `/users`
- [ ] `/customers`
- [ ] `/teams`
- [ ] `/settings`
- [ ] `/audit-logs`

Attendu : l’écran **Access Forbidden** apparaît. Le lien **Reports** est actuellement visible dans la navigation Operator, mais la route est interdite; notez cet écart si vous le rencontrez.

## Résultats

| Date | Étape testée | Résultat (OK/Échec/Blocage) | Détail ou message observé |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## Notes sur le périmètre actuel

- Les permissions de lecture permettent à l’Operator de consulter les stations, équipements, produits, achats, dépenses et shifts.
- Les ventes sont disponibles via POS et Services; l’Operator possède aussi l’autorisation serveur `sales.manage`.
- La saisie de relevés de pistols est autorisée au serveur pour l’Operator.
- L’ouverture de shift est limitée au leader de l’équipe pour le rôle Operator; l’API ne retourne à l’Operator que ses équipes actives dirigées.
- Un Operator ne peut lire et modifier que les shifts où il est explicitement listé dans les employés affectés; l’ouverture ou la direction d’une équipe ne donne pas accès aux autres shifts.
- La clôture de shift reste réservée à Admin, Manager et Supervisor.
- Les routes de rapports, gestion, Kif returns, daily close, fournisseurs, équipes, utilisateurs et settings sont restreintes.

Pour le diagramme général des parcours par rôle, voir [user-workflows.md](./user-workflows.md).
