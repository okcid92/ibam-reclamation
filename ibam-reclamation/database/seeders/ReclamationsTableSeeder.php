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
    }
}
