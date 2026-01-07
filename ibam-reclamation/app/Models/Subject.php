<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'matieres';
    protected $primaryKey = 'id_matiere';

    protected $fillable = ['code_matiere', 'libelle'];

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'enseignant_matieres', 'id_matiere', 'id_enseignant');
    }
}
