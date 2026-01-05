-- =========================================
-- BASE DE DONNÉES : IABM RÉCLAMATIONS
-- =========================================

CREATE DATABASE ibam_reclamations
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE iabm_reclamations;

-- =========================================
-- TABLE UTILISATEURS (AUTHENTIFICATION)
-- =========================================
CREATE TABLE utilisateurs (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM(
        'ETUDIANT',
        'SCOLARITE',
        'ENSEIGNANT',
        'DIRECTEUR_ACADEMIQUE',
        'DIRECTEUR_ADJOINT'
    ) NOT NULL,
    statut ENUM('ACTIF', 'INACTIF') DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABLE ÉTUDIANTS (LOGIN PAR INE)
-- =========================================
CREATE TABLE etudiants (
    id_etudiant INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    ine VARCHAR(20) UNIQUE NOT NULL,
    filiere VARCHAR(100),
    niveau VARCHAR(20),
    FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
);

-- =========================================
-- TABLE ENSEIGNANTS
-- =========================================
CREATE TABLE enseignants (
    id_enseignant INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    specialite VARCHAR(100),
    FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
);

-- =========================================
-- TABLE MATIÈRES
-- =========================================
CREATE TABLE matieres (
    id_matiere INT AUTO_INCREMENT PRIMARY KEY,
    code_matiere VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(150) NOT NULL
);

-- =========================================
-- ASSOCIATION ENSEIGNANTS ↔ MATIÈRES
-- =========================================
CREATE TABLE enseignant_matieres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_enseignant INT NOT NULL,
    id_matiere INT NOT NULL,
    FOREIGN KEY (id_enseignant)
        REFERENCES enseignants(id_enseignant),
    FOREIGN KEY (id_matiere)
        REFERENCES matieres(id_matiere),
    UNIQUE (id_enseignant, id_matiere)
);

-- =========================================
-- TABLE RÉCLAMATIONS (CŒUR DU SYSTÈME)
-- =========================================
CREATE TABLE reclamations (
    id_reclamation INT AUTO_INCREMENT PRIMARY KEY,
    id_etudiant INT NOT NULL,
    id_matiere INT NOT NULL,
    motif TEXT NOT NULL,
    note_initiale DECIMAL(5,2),
    note_corrigee DECIMAL(5,2),

    statut ENUM(
        'SOUMISE',
        'REJETEE_SCOLARITE',
        'EN_COURS_ENSEIGNANT',
        'REJETEE_ENSEIGNANT',
        'VALIDEE',
        'TERMINEE'
    ) DEFAULT 'SOUMISE',

    etape_actuelle ENUM(
        'SCOLARITE',
        'DIRECTEUR_ACADEMIQUE',
        'ENSEIGNANT',
        'DIRECTEUR_ADJOINT'
    ),

    decision TEXT,
    date_depot TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_traitement TIMESTAMP NULL,

    FOREIGN KEY (id_etudiant)
        REFERENCES etudiants(id_etudiant),
    FOREIGN KEY (id_matiere)
        REFERENCES matieres(id_matiere)
);

-- =========================================
-- TABLE PIÈCES JOINTES (DOCUMENTS)
-- =========================================
CREATE TABLE pieces_jointes (
    id_piece INT AUTO_INCREMENT PRIMARY KEY,
    id_reclamation INT NOT NULL,
    nom_fichier VARCHAR(255),
    type_fichier VARCHAR(50),
    chemin_fichier VARCHAR(255),
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reclamation)
        REFERENCES reclamations(id_reclamation)
        ON DELETE CASCADE
);

-- =========================================
-- TABLE HISTORIQUE DES ACTIONS (TRAÇABILITÉ)
-- =========================================
CREATE TABLE historique_actions (
    id_action INT AUTO_INCREMENT PRIMARY KEY,
    id_reclamation INT NOT NULL,
    id_utilisateur INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    commentaire TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reclamation)
        REFERENCES reclamations(id_reclamation),
    FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
);

-- =========================================
-- TABLE NOTIFICATIONS
-- =========================================
CREATE TABLE notifications (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_notification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
);
