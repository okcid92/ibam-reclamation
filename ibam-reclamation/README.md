# 📚 Système de Gestion des Réclamations Académiques – IABM

## 🧾 Présentation générale

Ce projet consiste à concevoir et développer une **plateforme web de gestion des demandes de réclamations académiques** au sein de l’IABM.  
La plateforme permet de **dématérialiser**, **sécuriser** et **tracer** l’ensemble du processus de réclamation des notes, depuis le dépôt par l’étudiant jusqu’à la décision finale de l’administration académique.

Le système vise à remplacer les procédures manuelles (papier, déplacements physiques, lenteurs administratives) par un **workflow numérique structuré**, fiable et transparent.

---

## 🎯 Objectifs du projet

- Dématérialiser le processus de demande de réclamation
- Réduire les délais de traitement
- Améliorer la traçabilité des décisions académiques
- Garantir la transparence pour les étudiants
- Sécuriser l’accès aux données selon les rôles
- Centraliser les échanges entre les acteurs académiques

---

## 🧠 Méthodologie

Le projet est conduit en suivant la **méthode 2TUP (Two-Track Unified Process)** :
- **Track Fonctionnel** : analyse des besoins, cas d’utilisation, acteurs, processus métier
- **Track Technique** : architecture logicielle, base de données, sécurité, implémentation

---

## 👥 Acteurs du système

### 🎓 Étudiant
- Dépose une demande de réclamation
- Ajoute des pièces justificatives (copies, relevés, preuves)
- Suit l’état d’avancement de sa demande
- Consulte la décision finale

### 👨‍🏫 Enseignant
- Accède uniquement aux matières qu’il enseigne
- Analyse les demandes reçues
- Valide ou rejette une réclamation
- Propose une correction de note si nécessaire

### 🏫 Scolarité
- Réceptionne les demandes
- Vérifie leur recevabilité
- Corrige les notes après validation finale
- Informe l’étudiant du résultat

### 🎓 Directeur Académique
- Supervise le processus
- Transmet les demandes aux enseignants concernés
- Dispose d’un accès global au système

### 🎓 Directeur Académique Adjoint
- Centralise les retours des enseignants
- Valide la décision intermédiaire
- Transmet la décision à la scolarité

---

## 🔄 Workflow de traitement d’une réclamation

1. L’étudiant rédige une demande de réclamation
2. La demande est envoyée à la scolarité
3. La scolarité vérifie la recevabilité
   - si non recevable → rejet
   - si recevable → transmission au Directeur Académique
4. Le Directeur Académique transmet à l’enseignant concerné
5. L’enseignant traite la demande :
   - motif valide → correction proposée
   - motif non valide → rejet
6. L’enseignant transmet au Directeur Académique Adjoint
7. Le DA Adjoint renvoie la décision à la scolarité
8. La scolarité corrige (ou non) la note
9. L’étudiant est informé de la décision finale

---

## 🔐 Authentification & Sécurité

### Connexion des étudiants
- Identifiant : **INE**
- Mot de passe sécurisé (hashé)
- Accès autorisé uniquement si le statut est **ACTIF**

### Connexion du personnel
- Identifiant interne (ou email)
- Mot de passe sécurisé
- Accès basé sur le rôle

### Statut des comptes
- **ACTIF** : accès autorisé
- **INACTIF** : accès bloqué (sans suppression des données)

### Sécurité
- Mots de passe hashés (bcrypt)
- Authentification par token (Laravel Sanctum)
- Middleware de contrôle des rôles
- Séparation stricte des accès

---

## 🏗️ Architecture technique

### Backend
- **Laravel** (API REST)
- Gestion des rôles et permissions
- Authentification par token
- Validation métier

### Frontend
- **React**
- Interface utilisateur moderne
- Tableaux de bord par rôle
- Consommation de l’API via Axios / Fetch

### Base de données
- **MySQL**
- Modélisation relationnelle
- Contraintes d’intégrité
- Historisation des actions

---

## 🗃️ Principales entités

- Utilisateurs
- Étudiants
- Enseignants
- Matières
- Réclamations
- Pièces jointes
- Historique des actions
- Notifications

---

## 📦 Livrables du projet

### 📘 Dossier d’analyse
- Présentation du contexte
- Objectifs
- Acteurs
- Cas d’utilisation
- Contraintes fonctionnelles

### 📐 Dossier de conception
- Modèle conceptuel de données
- Diagrammes UML
- Architecture logicielle
- Déploiement

### 🛠️ Dossier de réalisation
- Technologies utilisées
- Politique de sécurité
- Maquettes de l’interface
- Scripts SQL
- Seeders Laravel

---

## 🚀 Installation du projet (local)

```bash
git clone https://github.com/nom-du-repo/projet-reclamation-iabm.git
cd projet-reclamation-iabm
