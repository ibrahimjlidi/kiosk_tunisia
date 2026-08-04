# API Response Standard

Ce document définit le format standard des réponses API pour le backend `server`.

## Réponse réussie

- `success`: boolean, toujours `true` pour les réponses valides.
- `message`: string optionnel, texte d’information sur l’opération.
- autres champs métiers (ex. `data`, `count`, `user`, `orders`) selon le contexte.

### Exemple

```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "...",
  "user": {
    "id": "...",
    "username": "admin"
  }
}
```

## Réponse d’erreur

- `success`: boolean, toujours `false`.
- `message`: string, message lisible décrivant l’erreur.
- `errors`: tableau optionnel de détails structurés pour les validations.

### Structure d’erreur recommandée

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "email", "message": "Valid email address is required" }
  ]
}
```

## Codes HTTP

- `200` : requête réussie
- `201` : création réussie
- `400` : erreur de validation ou requête invalide
- `401` : non authentifié
- `403` : accès refusé
- `404` : ressource non trouvée
- `409` : conflit métier
- `500` : erreur serveur

## Règles de standardisation

- Toujours renvoyer `success` en racine.
- Ne jamais exposer de stack trace en production.
- Utiliser `errors` uniquement pour les tableaux de validation ou les erreurs de champ.
- Prévoir des messages clairs et uniformes pour les contrôleurs métier.
