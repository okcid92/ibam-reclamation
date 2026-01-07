<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'utilisateurs';
    protected $primaryKey = 'id_utilisateur';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'identifiant_interne',
        'mot_de_passe',
        'role',
        'statut',
    ];

    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'mot_de_passe' => 'hashed',
        ];
    }

    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'id_utilisateur');
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'id_utilisateur');
    }

    // Méthode pour trouver un utilisateur par INE ou email ou identifiant
    public static function findByLoginCredential($login)
    {
        // On cherche d'abord dans les colonnes standard
        $user = static::where('email', $login)
            ->orWhere('identifiant_interne', $login)
            ->first();
            
        if ($user) {
            return $user;
        }

        // Si non trouvé, on regarde si c'est un étudiant via son INE
        $student = Student::where('ine', $login)->first();
        if ($student) {
            return $student->user;
        }

        return null;
    }
}