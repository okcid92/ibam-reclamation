<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_login_with_ine()
    {
        // Créer un utilisateur étudiant
        $user = User::factory()->create([
            'role' => 'ETUDIANT',
            'status' => 'ACTIF'
        ]);
        
        $student = Student::create([
            'user_id' => $user->id,
            'ine' => 'N01331820231',
            'sector' => 'Informatique',
            'level' => 'L3'
        ]);

        // Tenter la connexion avec l'INE
        $response = $this->postJson('/api/login', [
            'login' => 'N01331820231',
            'password' => 'password'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'token',
                    'user',
                    'role'
                ]);
    }

    public function test_staff_can_login_with_email()
    {
        $user = User::factory()->create([
            'email' => 'scolarite@ibam.edu',
            'role' => 'SCOLARITE',
            'status' => 'ACTIF'
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'scolarite@ibam.edu',
            'password' => 'password'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'token',
                    'user',
                    'role'
                ]);
    }

    public function test_inactive_user_cannot_login()
    {
        $user = User::factory()->create([
            'status' => 'INACTIF'
        ]);

        $response = $this->postJson('/api/login', [
            'login' => $user->email,
            'password' => 'password'
        ]);

        $response->assertStatus(403)
                ->assertJson([
                    'message' => 'Compte inactif'
                ]);
    }
}