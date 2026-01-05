# IBAM - Système de Gestion des Réclamations Académiques

## 📋 Description

Application web complète de gestion des demandes de réclamations académiques pour l'Institut Africain de Business et de Management (IBAM). Le système permet aux étudiants de déposer des réclamations concernant leurs notes, inscriptions ou décisions académiques, et aux personnels administratifs de les traiter selon un workflow structuré.

## 🛠️ Stack Technique

- **Backend**: Laravel 12 + MySQL
- **Frontend**: React 19 + Tailwind CSS 4
- **Authentification**: Laravel Sanctum
- **Build**: Vite

## 👥 Rôles et Permissions

### Étudiant
- Connexion par INE ou email
- Dépôt de réclamations avec pièces jointes
- Suivi de l'état d'avancement
- Consultation des réponses

### Personnel Administratif
- **Scolarité**: Validation administrative des dossiers
- **Enseignant**: Avis pédagogique et correction de notes
- **Directeur Académique**: Décision finale

## 🔄 Workflow des Réclamations

1. **Soumise** → Étudiant dépose la réclamation
2. **En cours** → Scolarité valide administrativement
3. **En cours** → Enseignant donne son avis
4. **Validée/Rejetée** → Directeur académique statue
5. **Clôturée** → Processus terminé

## 🚀 Installation

### Prérequis
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### Étapes d'installation

1. **Cloner et configurer le projet**
```bash
cd "IBAM reclamation/ibam-reclamation"
composer install
npm install
```

2. **Configuration de la base de données**
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ibam_reclamations
DB_USERNAME=root
DB_PASSWORD=
```

3. **Créer la base de données et exécuter les migrations**
```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE ibam_reclamations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Exécuter les migrations
php artisan migrate

# Exécuter les seeders pour les données de test
php artisan db:seed
```

4. **Lancer l'application**
```bash
# Terminal 1 - Serveur Laravel
php artisan serve

# Terminal 2 - Build frontend
npm run dev
```

L'application sera accessible sur `http://localhost:8000`

## 👤 Comptes de Test

Après avoir exécuté les seeders, vous pouvez utiliser ces comptes :

### Étudiants
- **INE**: `N01331820231` / **Mot de passe**: `password`
- **INE**: `N01331820232` / **Mot de passe**: `password`

### Personnel
- **Email**: `scolarite@ibam.edu` / **Mot de passe**: `password` (Scolarité)
- **Email**: `enseignant@ibam.edu` / **Mot de passe**: `password` (Enseignant)
- **Email**: `directeur@ibam.edu` / **Mot de passe**: `password` (Directeur)

## 📁 Structure du Projet

```
ibam-reclamation/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php      # Authentification
│   │   └── ClaimController.php     # Gestion des réclamations
│   └── Models/                     # Modèles Eloquent
├── database/
│   ├── migrations/                 # Migrations de base de données
│   └── seeders/                   # Données de test
├── resources/
│   ├── js/
│   │   ├── components/            # Composants React
│   │   ├── pages/                 # Pages de l'application
│   │   └── context/               # Contextes React
│   └── css/                       # Styles CSS
└── routes/
    ├── api.php                    # Routes API
    └── web.php                    # Routes web
```

## 🔧 Fonctionnalités Principales

### Pour les Étudiants
- ✅ Connexion sécurisée par INE
- ✅ Création de réclamations avec upload de documents
- ✅ Suivi en temps réel du statut
- ✅ Historique des actions

### Pour le Personnel
- ✅ Dashboard de gestion par rôle
- ✅ Filtrage des réclamations
- ✅ Actions contextuelles selon l'étape
- ✅ Traçabilité complète

### Système
- ✅ Authentification multi-rôles
- ✅ Upload et stockage sécurisé des fichiers
- ✅ API REST complète
- ✅ Interface responsive

## 🔒 Sécurité

- Authentification par tokens Sanctum
- Validation des permissions par rôle
- Protection CSRF
- Validation des uploads de fichiers
- Hashage sécurisé des mots de passe

## 📊 API Endpoints

### Authentification
- `POST /api/login` - Connexion
- `POST /api/logout` - Déconnexion
- `GET /api/user` - Utilisateur connecté

### Réclamations
- `GET /api/claims` - Liste des réclamations
- `POST /api/claims` - Créer une réclamation
- `PUT /api/claims/{id}` - Traiter une réclamation
- `GET /api/claims/{id}` - Détails d'une réclamation

### Données
- `GET /api/subjects` - Liste des matières
- `GET /api/dashboard/stats` - Statistiques

## 🎯 Utilisation

1. **Connexion Étudiant**: Utilisez votre INE et mot de passe
2. **Créer une réclamation**: Sélectionnez la matière, décrivez le problème, joignez des documents
3. **Suivi**: Consultez l'état d'avancement sur votre dashboard
4. **Personnel**: Traitez les réclamations selon votre rôle et l'étape du workflow

## 🚀 Déploiement

Pour un déploiement en production :

1. Configurer l'environnement de production
2. Optimiser les assets : `npm run build`
3. Configurer le serveur web (Apache/Nginx)
4. Sécuriser la base de données
5. Configurer les sauvegardes

## 📝 Licence

Ce projet est développé pour l'IBAM dans un cadre académique.

## 🤝 Support

Pour toute question ou problème, contactez l'équipe de développement.