# Règles métier de base pour ERP Station

Ce document formalise les règles métier indispensables à respecter dans la phase actuelle du projet.

## Authentification et utilisateurs

- Les utilisateurs ont un rôle parmi : `ADMIN`, `MANAGER`, `SUPERVISOR`, `OPERATOR`.
- Un utilisateur `actif` peut se connecter ; un utilisateur désactivé est bloqué.
- Seuls `ADMIN` et `MANAGER` peuvent créer, modifier ou supprimer des fournisseurs et des stations.

## Stations et équipements

- Une station peut avoir plusieurs pompes.
- Une pompe doit référencer 1 ou plusieurs pistolets.
- Un pistolet est associé à un produit carburant.
- Un tank stocke un produit précis et maintient un `currentStock`.
- Le stock d’un tank ne doit jamais devenir négatif.

## Vente et caisse

- Une vente de carburant décrémente le stock du tank associé.
- Si la vente est en crédit, un client valide doit être présent.
- Les paiements doivent rester cohérents : une vente en crédit doit générer un montant dû.

## Achats et approvisionnements

- Une commande d’achat peut être créée, livrée, annulée.
- Une commande livrée met à jour le stock des tanks associés.
- Une commande annulée ne doit pas pouvoir être livrée.
- Un ordre ne peut être livré que s’il est en statut `PENDING`.

## Quarts de travail et clôture

- Un shift doit être ouvert avant d’être fermé.
- Un shift fermé ne doit plus être modifié pour les lectures et les paiements.
- La fermeture quotidienne (`daily closure`) verrouille les actions du jour.
- Le shift suivant doit démarrer à partir des valeurs d’index du shift précédent.
- Les ventes carburant d’un shift sont générées à partir des index de pompe enregistrés lors de sa clôture; les ventes manuelles liées au shift sont interdites pour éviter les doublons. Les paiements encaissés sont saisis dans le rapprochement du shift.
- La clôture quotidienne ne peut être finalisée que si tous les shifts sont fermés, si les paiements correspondent aux ventes et si le total des ventes du shift correspond au ledger.

## Inventaire et jaugeage

- Le jaugeage de tank enregistre une lecture `dipReading` et un `calculatedVolume`.
- Le volume calculé doit être cohérent avec le produit stocké.

## Rapports et audit

- Les rapports doivent utiliser des données immuables à date fixe.
- La clôture quotidienne doit produire un sommaire consolidé des ventes, dépenses, achats et retours.
- Les erreurs métier doivent être signalées avec un code HTTP approprié.
