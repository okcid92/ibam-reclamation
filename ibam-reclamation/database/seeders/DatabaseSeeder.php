<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Créer des matières
        $math = Subject::create(['code' => 'MATH101', 'label' => 'Mathématiques Générales']);
        $algo = Subject::create(['code' => 'INFO102', 'label' => 'Algorithmique']);
        $php = Subject::create(['code' => 'INFO201', 'label' => 'Développement Web (PHP)']);

        // 2. Créer un étudiant (User + Student)
        $studentUser = User::create([
            'lastname' => 'OUEDRAOGO',
            'firstname' => 'Moussa',
            'email' => 'moussa@ibam.bf',
            'password' => Hash::make('password'),
            'role' => 'ETUDIANT',
            'status' => 'ACTIF'
        ]);
        
        // INE form: N + Year + Counter (Example)
        Student::create([
            'user_id' => $studentUser->id,
            'ine' => 'N000120241',
            'sector' => 'Informatique',
            'level' => 'L2'
        ]);

        // 3. Créer un membre de la scolarité
        User::create([
            'lastname' => 'KONATE',
            'firstname' => 'Aminata',
            'email' => 'scolarite@ibam.bf',
            'password' => Hash::make('password'),
            'role' => 'SCOLARITE',
            'status' => 'ACTIF'
        ]);

        // 4. Créer un enseignant
        $teacherUser = User::create([
            'lastname' => 'ZONGO',
            'firstname' => 'Pierre',
            'email' => 'zongo@ibam.bf',
            'password' => Hash::make('password'),
            'role' => 'ENSEIGNANT',
            'status' => 'ACTIF'
        ]);

        Teacher::create([
            'user_id' => $teacherUser->id,
            'specialty' => 'Informatique'
        ]);
        
        // Attacher matière
        $teacherUser->teacher->subjects()->attach($php->id);
    }
}
