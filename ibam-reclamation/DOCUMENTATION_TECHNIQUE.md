# Documentation Technique - IBAM Réclamations

## Architecture du Système

### Backend (Laravel)

#### Modèles de Données

**User** - Utilisateur principal
- Gère l'authentification et les rôles
- Relations: Student, Teacher

**Student** - Profil étudiant
- Lié à User avec INE unique
- Relations: Claims

**Teacher** - Profil enseignant
- Lié à User avec spécialité
- Relations: Subjects (many-to-many)

**Subject** - Matières académiques
- Code et libellé
- Relations: Teachers, Claims

**Claim** - Réclamations
- Cœur du système avec workflow
- Relations: Student, Subject, Attachments, History

**Attachment** - Pièces jointes
- Stockage des documents
- Relations: Claim

**ClaimHistory** - Historique des actions
- Traçabilité complète
- Relations: Claim, User

#### Contrôleurs

**AuthController**
- `login()` - Authentification par email ou INE
- `logout()` - Déconnexion sécurisée
- `user()` - Profil utilisateur connecté

**ClaimController**
- `index()` - Liste filtrée par rôle
- `store()` - Création avec upload
- `update()` - Traitement selon workflow
- `show()` - Détails avec permissions

#### Workflow des Statuts

```
SOUMISE → EN_COURS → VALIDEE/REJETEE → CLOTUREE
```

**Étapes de traitement:**
1. SCOLARITE - Validation administrative
2. ENSEIGNANT - Avis pédagogique + correction note
3. DIRECTEUR_ACADEMIQUE - Décision finale

#### Sécurité

- **Authentification**: Laravel Sanctum (tokens)
- **Autorisation**: Middleware + vérifications par rôle
- **Validation**: Form Requests + règles métier
- **Upload**: Validation type/taille fichiers
- **CSRF**: Protection automatique Laravel

### Frontend (React)

#### Structure des Composants

```
src/
├── context/
│   └── AuthContext.jsx     # Gestion état authentification
├── layouts/
│   └── Layout.jsx          # Layout principal avec navigation
├── pages/
│   ├── Login.jsx           # Connexion multi-rôles
│   ├── DashboardStudent.jsx # Dashboard étudiant
│   ├── DashboardStaff.jsx  # Dashboard personnel
│   └── CreateClaim.jsx     # Création réclamation
└── app.jsx                 # Router principal
```

#### Gestion d'État

**AuthContext**
- État utilisateur global
- Fonctions login/logout
- Persistance token localStorage
- Vérification automatique au démarrage

#### Routing

- Routes protégées par rôle
- Redirection automatique selon profil
- Navigation contextuelle

#### Styles

- **Tailwind CSS 4** - Framework CSS utility-first
- **Composants réutilisables** - Boutons, formulaires
- **Responsive design** - Mobile-first
- **Animations** - Transitions fluides

## Base de Données

### Schéma Relationnel

```sql
users (id, firstname, lastname, email, password, role, status)
├── students (id, user_id, ine, sector, level)
│   └── claims (id, student_id, subject_id, reason, status, ...)
│       ├── attachments (id, claim_id, filename, filepath)
│       └── claim_history (id, claim_id, user_id, action)
├── teachers (id, user_id, specialty)
│   └── teacher_subjects (teacher_id, subject_id)
└── subjects (id, code, label)
```

### Index et Performances

- Index sur `users.email` et `students.ine`
- Index composé sur `claims.status` + `current_stage`
- Clés étrangères avec contraintes CASCADE
- Pagination automatique des listes

## API REST

### Endpoints Principaux

```http
POST   /api/login              # Authentification
POST   /api/logout             # Déconnexion
GET    /api/user               # Profil utilisateur

GET    /api/claims             # Liste réclamations
POST   /api/claims             # Créer réclamation
PUT    /api/claims/{id}        # Traiter réclamation
GET    /api/claims/{id}        # Détails réclamation

GET    /api/subjects           # Liste matières
GET    /api/dashboard/stats    # Statistiques
```

### Format des Réponses

**Succès:**
```json
{
  "data": {...},
  "message": "Success"
}
```

**Erreur:**
```json
{
  "message": "Error description",
  "errors": {...}
}
```

## Déploiement

### Environnement de Production

**Serveur Web**
- Apache/Nginx avec PHP 8.2+
- Configuration SSL/TLS
- Compression gzip
- Cache headers

**Base de Données**
- MySQL 8.0+ optimisé
- Sauvegardes automatiques
- Réplication si nécessaire

**Sécurité**
- Firewall configuré
- Logs de sécurité
- Monitoring des accès
- Mise à jour régulière

### Optimisations

**Laravel**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

**Frontend**
```bash
npm run build
# Assets optimisés dans public/build/
```

### Monitoring

**Logs Laravel**
- `storage/logs/laravel.log`
- Rotation automatique
- Alertes sur erreurs critiques

**Métriques**
- Temps de réponse API
- Utilisation base de données
- Espace disque (uploads)

## Tests

### Tests Unitaires

```bash
php artisan test
```

**Couverture:**
- Authentification multi-rôles
- Workflow des réclamations
- Permissions par rôle
- Upload de fichiers

### Tests d'Intégration

- Parcours utilisateur complet
- API endpoints
- Validation des données

## Maintenance

### Tâches Régulières

**Quotidien**
- Vérification logs erreurs
- Monitoring performances
- Sauvegarde base de données

**Hebdomadaire**
- Nettoyage fichiers temporaires
- Vérification espace disque
- Mise à jour sécurité

**Mensuel**
- Analyse des statistiques d'usage
- Optimisation base de données
- Revue des permissions

### Évolutions Futures

**Fonctionnalités**
- Notifications email/SMS
- Tableau de bord analytique
- Export des données
- API mobile

**Technique**
- Cache Redis
- Queue system
- Microservices
- Docker containerization

## Support

### Logs et Debug

**Activation debug mode:**
```env
APP_DEBUG=true
APP_LOG_LEVEL=debug
```

**Logs personnalisés:**
```php
Log::info('Réclamation créée', ['claim_id' => $claim->id]);
Log::error('Erreur upload', ['error' => $e->getMessage()]);
```

### Problèmes Courants

**Erreur 500**
- Vérifier logs Laravel
- Permissions fichiers
- Configuration base de données

**Erreur authentification**
- Vérifier tokens Sanctum
- Configuration CORS
- Headers Authorization

**Upload échoue**
- Taille max PHP/Nginx
- Permissions storage/
- Types MIME autorisés