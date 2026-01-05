<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EtudiantsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('etudiants')->insert([
            [
                'id_utilisateur' => 1, // Alou Dicko
                'ine' => 'N01331820231',
                'filiere' => 'Informatique',
                'niveau' => 'L3'
            ],
            [
                'id_utilisateur' => 2, // Albert Naba
                'ine' => 'N01331820232', 
                'filiere' => 'Informatique',
                'niveau' => 'L3'
            ]
        ]);
    }
}