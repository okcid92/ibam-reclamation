<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'etudiants';
    protected $primaryKey = 'id_etudiant';

    protected $fillable = ['id_utilisateur', 'ine', 'filiere', 'niveau'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }

    public function claims()
    {
        return $this->hasMany(Claim::class, 'id_etudiant');
    }
}
