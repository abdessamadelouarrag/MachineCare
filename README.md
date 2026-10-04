# MachineCare

API REST pour gérer les machines et suivre les pannes d’une entreprise industrielle située à Safi. Le projet centralise les équipements, les signalements et leur résolution. Aucune interface frontend n’est incluse.

## Technologies

- Node.js avec modules ES et Express
- MongoDB et Mongoose
- JWT pour l’authentification
- bcryptjs pour le hachage des mots de passe
- dotenv pour la configuration
- nodemon pour le redémarrage automatique en développement

## Installation

Prérequis : Node.js compatible avec les dépendances du projet, npm et une instance MongoDB accessible.

```bash
git clone https://github.com/abdessamadelouarrag/MachineCare.git
cd MachineCare
npm ci
```

Créer un fichier `.env` à la racine, en utilisant `.env.example` comme point de départ. Ajouter également `JWT_SECRET`, nécessaire pour signer et vérifier les tokens :

```dotenv
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/machinecare
JWT_SECRET=remplacer_par_une_cle_longue_aleatoire_et_privee
```

Remplacer la valeur d’exemple de `JWT_SECRET` avant de démarrer. Le fichier `.env` est ignoré par Git ; ne pas y publier de secrets.

Démarrer MongoDB, puis lancer l’API :

```bash
npm run dev
```

Le serveur démarre après la connexion à MongoDB. URL locale par défaut : `http://localhost:3000`. Nodemon redémarre le serveur lors des modifications du code.

## Premier compte et connexion

Dans l’implémentation actuelle, créer le compte initial avec cette requête, sans body :

```http
POST http://localhost:3000/api/auth/default
```

La réponse contient les identifiants du compte initial. Si le compte existe déjà, cette route retourne `400`.

Cette route est actuellement publique et utilise des identifiants fixes définis dans le code. Elle doit être remplacée par une initialisation à l’installation avant une mise en production.

Dans Postman, se connecter avec les identifiants retournés. La route actuelle utilise **GET avec un body JSON** :

```http
GET http://localhost:3000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "EMAIL_DU_COMPTE",
  "password": "MOT_DE_PASSE_DU_COMPTE"
}
```

La réponse contient un `token` JWT valable une heure. Les clients qui ne prennent pas en charge les bodies GET ne peuvent pas utiliser cette route telle quelle ; une migration vers `POST /api/auth/login` reste à faire.

Pour les routes protégées, choisir **Authorization → Bearer Token** dans Postman, ou envoyer :

```http
Authorization: Bearer TON_JWT
```

Les utilisateurs authentifiés ont les mêmes droits. La modification du profil concerne uniquement le compte connecté.

## Routes

Les routes machines, signalements, profil et dashboard exigent toutes un JWT valide.

### Comptes

| Méthode | Route | Fonction | JWT |
|---|---|---|---|
| POST | `/api/auth/default` | Créer le compte initial | Non |
| GET | `/api/auth/login` | Se connecter avec un body JSON | Non |
| POST | `/api/auth/register` | Créer un utilisateur | Oui |
| POST | `/api/auth/logout` | Se déconnecter | Oui |
| GET | `/api/profile/infos` | Consulter son profil | Oui |
| PATCH | `/api/profile` | Modifier son nom ou son e-mail | Oui |
| GET | `/api/dashboard` | Consulter le dashboard JSON | Oui |

Créer un utilisateur avec `POST /api/auth/register` :

```json
{
  "name": "Technicien",
  "email": "technicien@example.com",
  "password": "remplacer_par_un_mot_de_passe_prive"
}
```

Modifier son profil avec `PATCH /api/profile` :

```json
{
  "name": "Nouveau nom",
  "email": "nouveau@example.com"
}
```

Le logout augmente la version des tokens du compte : **tous ses anciens JWT sont refusés**, sur toutes ses sessions. Une nouvelle connexion délivre un token valide. Supprimer également l’ancien token du client.

### Machines

| Méthode | Route | Fonction |
|---|---|---|
| POST | `/api/machines` | Créer une machine |
| GET | `/api/machines` | Lister et filtrer |
| GET | `/api/machines/:reference` | Consulter le détail |
| PATCH | `/api/machines/:reference` | Modifier les champs fournis |
| DELETE | `/api/machines/:reference` | Supprimer une machine sans signalements |
| GET | `/api/machines/:reference/reports` | Consulter l’historique des signalements |

Créer une machine :

```json
{
  "reference": "M443",
  "name": "Presse industrielle",
  "workshop": "Atelier A",
  "status": "available"
}
```

La référence est unique et non vide. États acceptés : `available`, `maintenance`, `out_of_service`. L’état par défaut est `available`.

Filtrer :

```http
GET /api/machines?workshop=Atelier%20A&status=maintenance
```

Modifier :

```http
PATCH /api/machines/M443
```

```json
{
  "status": "maintenance"
}
```

Une machine ayant au moins un signalement, même résolu, ne peut pas être supprimée : l’API retourne `409` pour préserver l’historique.

### Signalements

| Méthode | Route | Fonction |
|---|---|---|
| POST | `/api/reports` | Déclarer une panne avec la référence machine |
| GET | `/api/reports` | Lister et filtrer |
| GET | `/api/reports/:id` | Consulter un signalement |
| PATCH | `/api/reports/:id` | Modifier la description, le statut ou la note |

Déclarer une panne sur une machine existante :

```json
{
  "reference": "M443",
  "description": "Le moteur ne démarre plus.",
  "status": "open"
}
```

Utiliser **la référence de la machine**, pas son `_id`. Le serveur conserve le compte connecté comme déclarant et stocke la relation MongoDB par ObjectId : changer la référence machine ne coupe pas son historique.

Filtrer les pannes :

```http
GET /api/reports?reference=M443&status=open
```

Pour consulter ou modifier un signalement, utiliser **son propre `_id`**, retourné dans la réponse de création. Une machine peut avoir plusieurs signalements.

Passer une panne en cours :

```http
PATCH /api/reports/ID_DU_SIGNALEMENT
```

```json
{
  "status": "in_progress"
}
```

Résoudre une panne :

```json
{
  "status": "resolved",
  "resolutionNote": "Moteur remplacé et fonctionnement vérifié."
}
```

Règles du suivi :

- Statuts : `open`, `in_progress`, `resolved`. Une nouvelle panne est toujours ouverte.
- Le retour vers un statut précédent est refusé. La résolution directe depuis `open` est autorisée.
- Une note non vide est obligatoire pour résoudre une panne.
- `resolvedAt` est renseigné par le serveur à la résolution et conservé lors des corrections suivantes.
- La machine et le déclarant d’un signalement ne sont pas modifiables via PATCH.
- L’état machine est géré séparément du statut des signalements.
- Aucune suppression de signalement n’est exposée.
- Les modèles conservent `createdAt` et `updatedAt`.

### Anciennes routes conservées

| Route | Équivalent |
|---|---|
| `POST /api/machines/newMachine` | `POST /api/machines` |
| `GET /api/machines/allMachines` | `GET /api/machines` |
| `DELETE /api/machines/deleteMachine/:reference` | `DELETE /api/machines/:reference` |
| `POST /api/profile/updateUser` | `PATCH /api/profile` |

## Erreurs

Les erreurs de validation des machines, des signalements et du profil utilisent `message_error`. Certaines réponses d’authentification utilisent `message`.

| Code | Signification |
|---|---|
| 400 | Champs manquants, données invalides ou statut inconnu |
| 401 | Identifiants incorrects, JWT manquant, expiré ou invalidé |
| 404 | Machine ou signalement introuvable |
| 409 | Doublon, suppression interdite, retour de statut ou modification concurrente |
| 500 | Erreur interne |

La route register retourne actuellement `400` pour un e-mail déjà présent lors de son contrôle préalable ; le middleware retourne `409` pour les erreurs d’index unique MongoDB.

## Structure

```text
src/
  config/         Connexion MongoDB
  controllers/    Traitement des requêtes et règles métier
  middlewares/    Vérification JWT et gestion des erreurs
  models/         Schémas Mongoose
  routes/         Routes Express
  server.js       Configuration et démarrage du serveur
```

## Vérification

```bash
npm test
```

Cette commande lance le test runner intégré de Node.js et découvre les tests présents dans le dépôt. Pour vérifier avec MongoDB, effectuer dans Postman le parcours : connexion → création machine → déclaration panne → passage en cours → résolution avec note → consultation de l’historique → logout.

## Travail restant du cahier des charges

- Ajouter Docker et Docker Compose avec synchronisation du code et nodemon.
- Séparer les règles métier dans une couche services.
- Remplacer la route publique du compte initial par une initialisation à l’installation.
- Passer la connexion en POST et harmoniser les réponses HTTP d’authentification.
- Compléter la validation de création des comptes et les vérifications avec une base MongoDB réelle.
