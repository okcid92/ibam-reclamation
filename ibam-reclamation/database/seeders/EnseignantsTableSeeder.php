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
                'id_utilisateur' => 3, // Prof Dr Traore
                'specialite' => 'Analyse et Conception Orientée Objet',
            ],
        ]);
    }
}
