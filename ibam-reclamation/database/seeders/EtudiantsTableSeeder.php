<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;

class EtudiantsTableSeeder extends Seeder
{
    public function run()
    {
        // Récupérer les utilisateurs étudiants créés
        $alou = User::where('email', 'alou.dicko@etudiant.ibam.edu')->first();
        $albert = User::where('email', 'albert.naba@etudiant.ibam.edu')->first();

        // Créer les profils étudiants
        Student::create([
            'user_id' => $alou->id,
            'ine' => 'N01331820231',
            'sector' => 'MIAGE',
            'level' => 'L3',
        ]);

        Student::create([
            'user_id' => $albert->id,
            'ine' => 'N01331820232',
            'sector' => 'MIAGE',
            'level' => 'L3',
        ]);
    }
}
