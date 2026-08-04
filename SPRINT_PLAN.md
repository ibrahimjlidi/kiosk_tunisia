# Plan de développement par sprint

## Vision globale
Objectif : transformer le projet actuel en ERP opérationnel, fiable et conforme aux règles métier de station-service.

### Priorités absolues
1. Sécuriser l’authentification et les permissions
2. Corriger les règles métier critiques (shift, clôture, stock, crédit)
3. Finaliser les modules cœur du fonctionnement journalier
4. Ajouter les modules manquants (teams, employees, settings)
5. Rendre les rapports et le dashboard exploitables

---

## Sprint 1 — Stabilisation technique et fondations métier
Durée : 2 semaines

### Objectif
- Stabiliser l’architecture actuelle
- Clarifier les règles métier de base
- Préparer l’environnement de développement et les tests

### Périmètre
- Audit technique final du backend/frontend
- Définition du modèle de données métier commun
- Standardisation des erreurs API
- Mise en place d’un plan de tests fonctionnels
- Définition des règles d’acceptation par module

### Livrables
- Backlog priorisé
- Règles métier validées
- Standard de réponse API
- Checklist QA par module

### Critères de sortie
- Toutes les fonctionnalités prioritaires sont explicites
- Les règles métier critiques sont documentées
- Le backlog est prêt pour l’implémentation

---

## Sprint 2 — Authentification, RBAC et sécurité de base
Durée : 2 semaines

### Objectif
- Renforcer la sécurité et la gestion des accès

### Périmètre
- Refresh token
- Session management robuste
- Règles de permissions plus granulaires
- Protection stricte des routes sensibles
- Journalisation des actions sensibles

### Livrables
- Auth renforcée
- Permissions dynamiques par rôle
- Interface d’erreur sécurisée
- Tests d’authentification

### Critères de sortie
- Un utilisateur ne peut accéder qu’aux modules autorisés
- Les routes sensibles sont protégées de bout en bout
- Les cas d’échec sont cohérents

---

## Sprint 3 — Données maîtres : stations, utilisateurs, produits, tanks
Durée : 2 semaines

### Objectif
- Finaliser les modules de base du fonctionnement station

### Périmètre
- Stations : CRUD, validation, règles métier
- Utilisateurs : gestion complète, activation/désactivation
- Produits : prix, TVA, catégories, stock de base
- Tanks : création, mise à jour, seuils d’alerte

### Livrables
- Pages CRUD fonctionnelles
- Validation des formulaires
- Règles de cohérence de base
- Seed data complet

### Critères de sortie
- Une station peut être administrée sans incohérence
- Un produit peut être géré avec ses paramètres métier
- Un tank peut être suivi correctement

---

## Sprint 4 — Pompes, pistolets, stock et achats carburant
Durée : 2 semaines

### Objectif
- Modéliser la chaîne opérationnelle carburant de la station

### Périmètre
- Pompes et pistolets
- Association pistolet → produit
- Validation métier sur la structure
- Purchase orders
- Livraison et mise à jour du stock
- Intégration avec les tanks

### Livrables
- Gestion des pompes et pistolets
- Workflow d’achat carburant
- Mise à jour des stocks
- Contrôles de validation

### Critères de sortie
- Une pompe possède une structure cohérente
- Un bon de livraison met bien à jour le stock
- Les données ne peuvent plus être incohérentes

---

## Sprint 5 — Shift, ouverture/fermeture et clôture opérationnelle
Durée : 2 semaines

### Objectif
- Rendre le cycle de quart opérationnel et sécurisé

### Périmètre
- Ouverture de shift
- Lecture des indexes
- Fermeture de shift
- Validation contre les règles métier
- Recalculation des montants
- Préparation à la clôture journalière

### Livrables
- Workflow complet de shift
- Contrôles d’intégrité métier
- Écrans de suivi et validation
- Logs de fermeture

### Critères de sortie
- Un shift ne peut être fermé qu’avec les conditions métier remplies
- L’ouverture et la fermeture sont strictement contrôlées
- Les montants sont recalculés automatiquement

---

## Sprint 6 — Ventes, POS, services et dépenses
Durée : 2 semaines

### Objectif
- Couvrir les opérations commerciales quotidiennes

### Périmètre
- POS
- Ventes carburant
- Ventes services
- Dépenses
- Intégration avec les rapports de base

### Livrables
- Terminal de vente fonctionnel
- Enregistrement des ventes
- Gestion des dépenses
- Calculs TTC/HT/TVA/marge

### Critères de sortie
- Une vente est enregistrée correctement
- Une dépense est liée à une station/fournisseur si nécessaire
- Les montants sont cohérents dans les rapports

---

## Sprint 7 — Clients, crédit et paiements
Durée : 2 semaines

### Objectif
- Finaliser la partie crédit et suivi client

### Périmètre
- Clients
- Transactions de crédit
- Paiements
- Règles comptables liées aux crédits
- Historique des soldes

### Livrables
- Gestion du crédit client
- Écran de suivi de solde
- Enregistrement des paiements
- Règles de cohérence

### Critères de sortie
- Les soldes clients sont mis à jour correctement
- Les paiements et les facturations sont suivis
- Les cas d’erreur sont gérés proprement

---

## Sprint 8 — Rapports, dashboard, jaugeage et clôture journalière
Durée : 2 semaines

### Objectif
- Rendre l’ERP exploitables en pilotage

### Périmètre
- Dashboard
- Rapports de ventes
- Rapports financiers
- Daily closure
- Jaugeage
- Analyses de performance

### Livrables
- Dashboard fonctionnel
- Rapports exploitables
- Clôture journalière automatisée
- Interface de jaugeage

### Critères de sortie
- Les indicateurs clés sont visibles
- Les rapports reflètent les opérations réelles
- La clôture journalière est cohérente

---

## Sprint 9 — Modules manquants, qualité et déploiement
Durée : 2 semaines

### Objectif
- Finaliser les modules manquants et préparer la mise en production

### Périmètre
- Teams
- Employees
- Settings
- Audit trail
- Nettoyage global du code
- Tests d’intégration
- Documentation utilisateur
- Mise en production progressive

### Livrables
- Modules manquants intégrés
- Gestion des configurations système
- Documentation de déploiement
- Plan de montée en charge

### Critères de sortie
- Le système est testable en conditions réelles
- Les modules essentiels sont prêts
- Le produit est prêt pour une première mise en production

---

## Recommandation de livraison
Plan réaliste :
- 9 sprints
- Environ 18 semaines
- Résultat attendu : un ERP fonctionnel, exploitable, avec une base robuste et des règles métier cohérentes

---

## Definition of Done par sprint
Chaque sprint doit livrer :
- Fonctionnalités développées
- Tests fonctionnels passés
- Validation métier réalisée
- Documentation interne mise à jour
- Aucune régression majeure sur les modules déjà livrés




# Prompts Copilot par sprint

## Prompt Sprint 1 — Stabilisation technique et fondations métier
Tu es un architecte logiciel senior travaillant sur le projet ERP Station. Pour ce sprint, analyse le projet actuel, identifie les incohérences techniques et métier, puis propose et implémente les actions suivantes :
- nettoyer la structure backend/frontend si nécessaire,
- standardiser les réponses API et les erreurs,
- définir ou documenter les règles métier de base,
- préparer un backlog technique et fonctionnel détaillé,
- garantir que le code reste stable et testable.

Exécute ce travail sans casser les modules existants. Fournis un résumé clair des changements et des risques.

---

## Prompt Sprint 2 — Authentification, RBAC et sécurité de base
Tu es un expert en sécurité backend/frontend. Pour ce sprint, améliore l’authentification du projet ERP Station en réalisant :
- ajout/renforcement du mécanisme de refresh token,
- protection des routes sensibles,
- permissions plus fines selon les rôles,
- contrôle des accès côté frontend,
- journalisation des actions sensibles,
- tests de sécurité de base.

Respecte l’architecture existante et évite les régressions.

---

## Prompt Sprint 3 — Données maîtres : stations, utilisateurs, produits et tanks
Tu es un lead développeur fullstack. Pour ce sprint, finalise les modules cœur du système :
- stations : CRUD, validation, règles métier,
- utilisateurs : gestion complète, activation/désactivation, rôles,
- produits : prix, TVA, catégories, stock de base,
- tanks : gestion du stock, capacité, seuils d’alerte.

Implémente les fonctionnalités avec une bonne UX et des validations backend/frontend cohérentes.

---

## Prompt Sprint 4 — Pompes, pistolets, stock et achats carburant
Tu es un ingénieur backend/frontend spécialisé énergie et opérations. Pour ce sprint, implémente :
- la gestion des pompes et pistolets,
- l’association pistolet → produit,
- la validation des règles métier liées à la structure de la station,
- le workflow de purchase orders,
- la mise à jour du stock des tanks après livraison.

Assure la cohérence entre backend, base de données et interface utilisateur.

---

## Prompt Sprint 5 — Shift, ouverture/fermeture et clôture opérationnelle
Tu es un développeur spécialisé en logique métier de station-service. Pour ce sprint, développe le cycle complet de shift :
- ouverture du shift,
- lecture et enregistrement des indexes,
- fermeture du shift,
- validation des règles métier,
- recalcul des montants,
- préparation de la clôture journalière.

Assure que les règles critiques sont respectées et que les erreurs métier sont bien remontées.

---

## Prompt Sprint 6 — Ventes, POS, services et dépenses
Tu es un développeur fullstack orienté opérations commerciales. Pour ce sprint, implémente :
- le POS et le processus de vente,
- les ventes carburant et services,
- les dépenses opérationnelles,
- le calcul TTC/HT/TVA/marge,
- la synchronisation avec les rapports de base.

Fournis une expérience simple, rapide et robuste pour l’utilisateur de caisse.

---

## Prompt Sprint 7 — Clients, crédit et paiements
Tu es un expert en gestion client et flux financiers. Pour ce sprint, développe :
- la gestion des clients,
- les transactions de crédit,
- le suivi des paiements,
- la mise à jour du solde client,
- les validations liées aux montants et au flux financier.

Assure que les règles comptables et business sont respectées.

---

## Prompt Sprint 8 — Rapports, dashboard, jaugeage et clôture journalière
Tu es un développeur fullstack spécialisé reporting et pilotage. Pour ce sprint, implémente :
- le dashboard principal,
- les rapports de ventes et finances,
- la saisie et consultation du jaugeage,
- la clôture journalière avec résumé des ventes, dépenses et écarts.

Privilégie des vues claires, des agrégations correctes et une bonne expérience utilisateur.

---

## Prompt Sprint 9 — Modules manquants, qualité et déploiement
Tu es un lead technique chargé de finaliser l’ERP. Pour ce sprint, ajoute et finalise :
- les modules Teams, Employees et Settings,
- l’audit trail / journal d’événements,
- la qualité globale du code et des tests,
- la préparation de la première version de production.

Fais une dernière passe sur sécurité, performance, cohérence métier et documentation.
