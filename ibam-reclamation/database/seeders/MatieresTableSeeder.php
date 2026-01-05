<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MatieresTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('matieres')->insert([
            ['code_matiere' => '2INF1503', 'libelle' => 'Analyse et Conception Orientée Objet'],
        ]);
    }
}
