<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $table = 'enseignants';
    protected $primaryKey = 'id_enseignant';

    protected $fillable = ['id_utilisateur', 'specialite'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'enseignant_matieres', 'id_enseignant', 'id_matiere');
    }
}
