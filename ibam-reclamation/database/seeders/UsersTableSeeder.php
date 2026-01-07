<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('utilisateurs')->insert([
            [
                'nom' => 'Dicko',
                'prenom' => 'Alou',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'ETUDIANT',
                'statut' => 'ACTIF',
                'email' => null,
                'identifiant_interne' => null
            ],
            [
                'nom' => 'Naba',
                'prenom' => 'Albert',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'ETUDIANT',
                'statut' => 'ACTIF',
                'email' => null,
                'identifiant_interne' => null
            ],
            [
                'nom' => 'Agent',
                'prenom' => 'Scolarite',
                'email' => 'scolarite@ibam.edu',
                'identifiant_interne' => 'SCOL001',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'SCOLARITE',
                'statut' => 'ACTIF'
            ],
            [
                'nom' => 'Traore',
                'prenom' => 'Yaya',
                'email' => 'yaya.traore@ibam.edu',
                'identifiant_interne' => 'ENS001',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'ENSEIGNANT',
                'statut' => 'ACTIF'
            ],
            [
                'nom' => 'Directeur',
                'prenom' => 'Adjoint',
                'email' => 'adjoint.directeur@ibam.edu',
                'identifiant_interne' => 'DA001',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'DIRECTEUR_ADJOINT',
                'statut' => 'ACTIF'
            ]
        ]);
    }
}
