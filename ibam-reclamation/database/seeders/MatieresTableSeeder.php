<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MatieresTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('matieres')->insert([
            [
                'code_matiere' => 'INF301',
                'libelle' => 'Analyse et Conception Orientée Objet'
            ],
            [
                'code_matiere' => 'INF302', 
                'libelle' => 'Base de Données Avancées'
            ],
            [
                'code_matiere' => 'INF303',
                'libelle' => 'Développement Web'
            ],
            [
                'code_matiere' => 'INF304',
                'libelle' => 'Réseaux et Sécurité'
            ],
            [
                'code_matiere' => 'MAT301',
                'libelle' => 'Mathématiques Appliquées'
            ]
        ]);
    }
}