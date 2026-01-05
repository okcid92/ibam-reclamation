<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Étudiants
        User::create([
            'lastname' => 'Dicko',
            'firstname' => 'Alou',
            'email' => 'alou.dicko@etudiant.ibam.edu',
            'password' => Hash::make('password'),
            'role' => 'ETUDIANT',
            'status' => 'ACTIF'
        ]);

        User::create([
            'lastname' => 'Naba',
            'firstname' => 'Albert',
            'email' => 'albert.naba@etudiant.ibam.edu',
            'password' => Hash::make('password'),
            'role' => 'ETUDIANT',
            'status' => 'ACTIF'
        ]);

        // Personnel
        User::create([
            'lastname' => 'Agent',
            'firstname' => 'Scolarite',
            'email' => 'scolarite@ibam.edu',
            'password' => Hash::make('password'),
            'role' => 'SCOLARITE',
            'status' => 'ACTIF'
        ]);

        User::create([
            'lastname' => 'Traore',
            'firstname' => 'Yaya',
            'email' => 'enseignant@ibam.edu',
            'password' => Hash::make('password'),
            'role' => 'ENSEIGNANT',
            'status' => 'ACTIF'
        ]);

        User::create([
            'lastname' => 'Bayili',
            'firstname' => 'Gilbert',
            'email' => 'directeur@ibam.edu',
            'password' => Hash::make('password'),
            'role' => 'DIRECTEUR_ACADEMIQUE',
            'status' => 'ACTIF'
        ]);
    }
}
