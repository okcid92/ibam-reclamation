<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReclamationsTableSeeder extends Seeder
{
    public function run()
    {
        // Réclamation 1: En attente à la scolarité (étape initiale)
        DB::table('reclamations')->insert([
            'id_etudiant' => 1,
            'id_matiere' => 1, // INF301
            'motif' => 'Erreur de correction sur la question 3. Je pense mériter plus de points car ma réponse était correcte.',
            'note_actuelle' => 12.5,
            'note_souhaitee' => 15.0,
            'note_corrigee' => null,
            'statut' => 'SOUMISE',
            'etape_actuelle' => 'SCOLARITE',
            'decision' => null,
            'date_depot' => now()->subDays(2),
            'date_traitement' => null,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2)
        ]);

        // Réclamation 2: Chez le DA (transmise par scolarité)
        DB::table('reclamations')->insert([
            'id_etudiant' => 2,
            'id_matiere' => 2, // INF302
            'motif' => 'Note trop basse par rapport à mes réponses correctes sur la partie pratique.',
            'note_actuelle' => 8.0,
            'note_souhaitee' => 12.0,
            'note_corrigee' => null,
            'statut' => 'SOUMISE',
            'etape_actuelle' => 'DIRECTEUR_ADJOINT',
            'decision' => null,
            'date_depot' => now()->subDays(5),
            'date_traitement' => null,
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(3)
        ]);

        // Réclamation 3: Chez l'enseignant
        DB::table('reclamations')->insert([
            'id_etudiant' => 1,
            'id_matiere' => 3, // INF303
            'motif' => 'Problème de barème appliqué incorrectement sur le projet web.',
            'note_actuelle' => 10.0,
            'note_souhaitee' => 14.0,
            'note_corrigee' => null,
            'statut' => 'SOUMISE',
            'etape_actuelle' => 'ENSEIGNANT',
            'decision' => null,
            'date_depot' => now()->subDays(7),
            'date_traitement' => null,
            'created_at' => now()->subDays(7),
            'updated_at' => now()->subDays(2)
        ]);

        // Réclamation 4: Avis favorable reçu, retour au DA
        DB::table('reclamations')->insert([
            'id_etudiant' => 2,
            'id_matiere' => 1, // INF301
            'motif' => 'Erreur dans le total des points.',
            'note_actuelle' => 11.0,
            'note_souhaitee' => 13.0,
            'note_corrigee' => 12.5,
            'statut' => 'VALIDEE',
            'etape_actuelle' => 'DIRECTEUR_ADJOINT',
            'decision' => 'Avis favorable: erreur de calcul confirmée',
            'date_depot' => now()->subDays(10),
            'date_traitement' => null,
            'created_at' => now()->subDays(10),
            'updated_at' => now()->subDays(1)
        ]);

        // Réclamation 5: Terminée (favorable)
        DB::table('reclamations')->insert([
            'id_etudiant' => 1,
            'id_matiere' => 4, // INF304
            'motif' => 'Question annulée non prise en compte.',
            'note_actuelle' => 9.0,
            'note_souhaitee' => 12.0,
            'note_corrigee' => 11.5,
            'statut' => 'TERMINEE',
            'etape_actuelle' => null,
            'decision' => 'Réclamation validée. Note ajustée.',
            'date_depot' => now()->subDays(15),
            'date_traitement' => now()->subDays(5),
            'created_at' => now()->subDays(15),
            'updated_at' => now()->subDays(5)
        ]);

        // Réclamation 6: Rejetée par la scolarité
        DB::table('reclamations')->insert([
            'id_etudiant' => 2,
            'id_matiere' => 3, // INF303
            'motif' => 'Je conteste ma note de TP.',
            'note_actuelle' => 14.0,
            'note_souhaitee' => 16.0,
            'note_corrigee' => null,
            'statut' => 'REJETEE',
            'etape_actuelle' => null,
            'decision' => 'Réclamation non recevable - délai dépassé',
            'date_depot' => now()->subDays(20),
            'date_traitement' => now()->subDays(18),
            'created_at' => now()->subDays(20),
            'updated_at' => now()->subDays(18)
        ]);

        // Ajouter l'historique pour quelques réclamations
        DB::table('historique_actions')->insert([
            ['id_reclamation' => 1, 'id_utilisateur' => 1, 'action' => 'SOUMISSION', 'commentaire' => 'Réclamation soumise', 'date_action' => now()->subDays(2), 'created_at' => now(), 'updated_at' => now()],
            ['id_reclamation' => 2, 'id_utilisateur' => 2, 'action' => 'SOUMISSION', 'commentaire' => 'Réclamation soumise', 'date_action' => now()->subDays(5), 'created_at' => now(), 'updated_at' => now()],
            ['id_reclamation' => 2, 'id_utilisateur' => 3, 'action' => 'TRANSMISSION_DA', 'commentaire' => 'Dossier vérifié, transmis au DA', 'date_action' => now()->subDays(3), 'created_at' => now(), 'updated_at' => now()],
            ['id_reclamation' => 3, 'id_utilisateur' => 1, 'action' => 'SOUMISSION', 'commentaire' => 'Réclamation soumise', 'date_action' => now()->subDays(7), 'created_at' => now(), 'updated_at' => now()],
            ['id_reclamation' => 3, 'id_utilisateur' => 3, 'action' => 'TRANSMISSION_DA', 'commentaire' => 'Dossier recevable', 'date_action' => now()->subDays(5), 'created_at' => now(), 'updated_at' => now()],
            ['id_reclamation' => 3, 'id_utilisateur' => 5, 'action' => 'TRANSMISSION_ENSEIGNANT', 'commentaire' => 'Transmis à l\'enseignant', 'date_action' => now()->subDays(2), 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
