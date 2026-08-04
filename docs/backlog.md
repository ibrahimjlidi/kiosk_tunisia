# Backlog technique et fonctionnel

## Objectif du sprint
Renforcer la stabilité du backend, standardiser les réponses API, documenter les règles métier et préparer les livrables fonctionnels.

## Backlog fonctionnel

1. Normaliser les réponses API pour les erreurs et les succès.
2. Documenter les règles métier de base (auth, station, vente, achat, shift, inventaire).
3. Formaliser le backlog produit pour les modules inachevés : équipes, employés, paramètres.
4. Vérifier et corriger les doublons de route backend.
5. Clarifier les flux de crédit client, journal des paiements, clôture quotidienne.

## Backlog technique

### Priorité haute
- Corriger la duplication de route `suppliers` dans `server/src/app.ts`.
- Déployer un middleware d’erreur centralisé avec réponse standardisée.
- Ajouter des helpers API pour envoyer des réponses cohérentes.
- Documenter les conventions de réponse et les règles métier.
- Ajouter un test unitaire minimal pour la nouvelle classe d’erreur.

### Priorité moyenne
- Centraliser la validation des requêtes et des erreurs métiers.
- Ajouter un wrapper de réponse côté frontend si nécessaire.
- Ajouter des sanity checks de stock négatif sur les endpoints achats/ventes.
- Ajouter un logger structurel pour les erreurs critiques.

### Priorité basse
- Paginer et filtrer les listes dans les endpoints CRUD.
- Ajouter `teams`, `employees`, `settings` dans le backlog produit.
- Mettre en place un audit trail détaillé pour les actions sensibles.
- Définir un plan de tests e2e ou API.

## Dépendances et risques
- Risque faible sur la livraison tant que les modifications restent localisées.
- Risque moyen si les validations métier ne sont pas centralisées correctement.
- Risque élevé si une normalisation API modifie les formats attendus par le frontend.

## Proposition de livrables immédiats
- `docs/api-responses.md`
- `docs/business-rules.md`
- `docs/backlog.md`
- `server/src/helpers/apiResponse.ts`
- `server/src/helpers/apiResponse.test.ts`
- une route `app.ts` nettoyée
- un middleware `errorHandler.ts` standardisé
