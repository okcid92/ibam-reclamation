<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReclamationsTableSeeder extends Seeder
{
    public function run()
    {
        // On ne garde qu'une seule réclamation (celle de l'étudiant DICKO) pour le test
        // id_etudiant 1 = Alou Dicko
        // id_matiere 1 = INF301

        $id = DB::table('reclamations')->insertGetId([
            'id_etudiant' => 1,
            'id_matiere' => 1,
            'motif' => 'Erreur de saisie constatée sur ma note de l\'examen final.',
            'note_actuelle' => 12.5,
            'note_souhaitee' => 15.0,
            'statut' => 'SOUMISE',
            'etape_actuelle' => 'DIRECTEUR_ADJOINT',
            'date_depot' => now()->subHours(2),
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(1)
        ]);

        DB::table('historique_actions')->insert([
            [
                'id_reclamation' => $id,
                'id_utilisateur' => 1, // DICKO
                'action' => 'SOUMISSION',
                'commentaire' => 'Soumission initiale',
                'date_action' => now()->subHours(2)
            ],
            [
                'id_reclamation' => $id,
                'id_utilisateur' => 3, // Scolarité
                'action' => 'APPROBATION_SCOLARITE',
                'commentaire' => 'Dossier vérifié et recevable',
                'date_action' => now()->subHours(1)
            ]
        ]);

        DB::table('pieces_jointes')->insert([
            'id_reclamation' => $id,
            'nom_fichier' => 'releve_notes.pdf',
            'type_fichier' => 'application/pdf',
            'chemin_fichier' => 'attachments/test_file.pdf',
            'date_upload' => now()
        ]);

        // Réclamation ayant passé toutes les étapes (Scolarité + Directeur Adjoint)
        // et actuellement à l'étape ENSEIGNANT
        // id_etudiant 2 = Naba Albert, id_matiere 2 = INF302
        $id2 = DB::table('reclamations')->insertGetId([
            'id_etudiant' => 2,
            'id_matiere' => 2,
            'motif' => 'Note de contrôle continu non prise en compte dans le calcul final.',
            'note_actuelle' => 8.0,
            'note_souhaitee' => 11.0,
            'statut' => 'SOUMISE',
            'etape_actuelle' => 'ENSEIGNANT',
            'date_depot' => now()->subHours(6),
            'created_at' => now()->subHours(6),
            'updated_at' => now()->subHour()
        ]);

        DB::table('historique_actions')->insert([
            [
                'id_reclamation' => $id2,
                'id_utilisateur' => 2, // Naba Albert
                'action' => 'SOUMISSION',
                'commentaire' => 'Soumission initiale de la réclamation',
                'date_action' => now()->subHours(6)
            ],
            [
                'id_reclamation' => $id2,
                'id_utilisateur' => 3, // Scolarité
                'action' => 'APPROBATION_SCOLARITE',
                'commentaire' => 'Dossier vérifié, pièces complètes et recevable',
                'date_action' => now()->subHours(4)
            ],
            [
                'id_reclamation' => $id2,
                'id_utilisateur' => 5, // Directeur Adjoint
                'action' => 'TRANSMISSION_ENSEIGNANT',
                'commentaire' => 'Transmis à l\'enseignant concerné pour avis',
                'date_action' => now()->subHour()
            ]
        ]);

        DB::table('pieces_jointes')->insert([
            'id_reclamation' => $id2,
            'nom_fichier' => 'feuille_cc.pdf',
            'type_fichier' => 'application/pdf',
            'chemin_fichier' => 'attachments/test_file.pdf',
            'date_upload' => now()->subHours(6)
        ]);
    }
}
