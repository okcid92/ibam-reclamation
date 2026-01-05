<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnseignantsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('enseignants')->insert([
            [
                'id_utilisateur' => 4, // Yaya Traore (ENSEIGNANT)
                'specialite' => 'Analyse et Conception Orientée Objet',
            ],
        ]);
    }
}