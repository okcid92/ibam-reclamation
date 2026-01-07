# Documentation Technique - IBAM Réclamations

## Architecture du Système

### Backend (Laravel)

#### Modèles de Données

**Utilisateur** (table `utilisateurs`)
- Gère l'authentification et les rôles (`ETUDIANT`, `SCOLARITE`, `ENSEIGNANT`, `DIRECTEUR_ADJOINT`)
- Champs: id, nom, prenom, email, identifiant_interne, role, statut

**Étudiant** (table `etudiants`)
- Lié à Utilisateur par `id_utilisateur`
- Champ `id_etudiant` (PK), `ine`, `filiere`, `niveau`

**Enseignant** (table `enseignants`)
- Lié à Utilisateur par `id_utilisateur`
- Champ `id_enseignant` (PK), `specialite`

**Matière** (table `matieres`)
- Champ `id_matiere` (PK), `code_matiere`, `libelle`
- Relation Many-to-Many avec Enseignant via `enseignant_matieres`

**Réclamation** (table `reclamations`)
- Cœur du workflow académique
- Statuts: `SOUMISE`, `VALIDEE`, `NON_VALIDEE`, `REJETEE`, `TERMINEE`
- Étapes: `SCOLARITE`, `DIRECTEUR_ADJOINT`, `ENSEIGNANT`
- Relations: Étudiant, Matière, Pièces Jointes, Historique

**Pièce Jointe** (table `pieces_jointes`)
- Stockage multiple pour une réclamation
- Chemin: `storage/app/public/attachments/`

**Historique des Actions** (table `historique_actions`)
- Traçabilité complète des changements d'état et décisions

#### Contrôleurs

**AuthController**
- `login()`: Authentification par INE (étudiants) ou email (personnel)
- `logout()`: Déconnexion
- `user()`: Renvoie l'utilisateur connecté avec son profil complet

**ClaimWorkflowController**
- `index()`: Liste les réclamations selon le rôle (Scolarité voit tout, DA voit ses étapes, Enseignant voit ses matières)
- `store()`: Création par l'étudiant avec multi-upload de fichiers
- `show()`: Détails d'une réclamation avec toutes ses pièces jointes et son historique
- `update()`: Dispatcher unique qui traite les actions selon le rôle et l'étape actuelle
- `getSubjects()`: Liste les matières disponibles pour la création d'une réclamation

#### Flux de Workflow (Corrigé)

1. **Étudiant** : Soumet la réclamation (`SOUMISE`, étape `SCOLARITE`).
2. **Scolarité** : Vérifie la recevabilité (fichiers, délais).
   - Rejette (`REJETEE`) OU Transmet au DA (étape `DIRECTEUR_ADJOINT`).
3. **Directeur Adjoint (DA)** : Reçoit le dossier vérifié.
   - Transmet à l'Enseignant concerné (étape `ENSEIGNANT`).
4. **Enseignant** : Analyse et donne son avis.
   - Avis Favorable (`VALIDEE`) + Note corrigée (optionnel) → Renvoie au DA.
   - Avis Défavorable (`NON_VALIDEE`) → Renvoie au DA.
5. **Directeur Adjoint (DA)** : Valide l'avis et transmet à la Scolarité.
6. **Scolarité** : Notifie l'étudiant et clôture le dossier (`TERMINEE`, étape `null`).

### Frontend (React)

#### Structure des Pages

- `Login.jsx`: Point d'entrée multi-profils.
- `DashboardStudent.jsx`: Suivi des demandes personnelles.
- `DashboardScolarite.jsx`: Centre de tri et de finalisation.
- `DashboardAssistantDirector.jsx`: Validation académique.
- `DashboardTeacher.jsx`: Évaluation pédagogique.
- `CreateClaim.jsx`: Formulaire avec accumulation de fichiers (multi-upload).

### API REST

```http
POST /api/login              # Authentification
POST /api/logout             # Déconnexion
GET  /api/user               # Profil complet

GET  /api/claims             # Liste filtrée par rôle
GET  /api/claims/{id}        # Détails + Historique + Fichiers
POST /api/claims             # Créer (Multipart FormData)
PUT  /api/claims/{id}        # Traiter (action: approve/reject)

GET  /api/subjects           # Matières pour le formulaire
```

## Sécurité et Configuration

- **Stockage** : Utilise le disque `public`. Lien symbolique requis (`php artisan storage:link`).
- **Validation** : Fichiers limités à PDF, JPG, PNG (max 5MB).
- **Accès** : Middleware d'authentification sur toutes les routes API sauf Login/Logout.