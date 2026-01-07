<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnseignantsTableSeeder extends Seeder
{
    public function run()
    {
        // Créer l'enseignant
        DB::table('enseignants')->insert([
            [
                'id_utilisateur' => 4, // Yaya Traore (ENSEIGNANT)
                'specialite' => 'Informatique',
            ],
        ]);

        // Lier l'enseignant aux matières
        // L'enseignant (id_enseignant = 1) enseigne toutes les matières INF
        DB::table('enseignant_matieres')->insert([
            ['id_enseignant' => 1, 'id_matiere' => 1], // INF301 - ACOO
            ['id_enseignant' => 1, 'id_matiere' => 2], // INF302 - BDA
            ['id_enseignant' => 1, 'id_matiere' => 3], // INF303 - Dev Web
            ['id_enseignant' => 1, 'id_matiere' => 4], // INF304 - Réseaux
        ]);
    }
}
