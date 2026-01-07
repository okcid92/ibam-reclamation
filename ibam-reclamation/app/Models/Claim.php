<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    use HasFactory;

    protected $table = 'reclamations';
    protected $primaryKey = 'id_reclamation';

    protected $fillable = [
        'id_etudiant',
        'id_matiere',
        'motif',
        'note_actuelle',
        'note_souhaitee',
        'note_corrigee',
        'statut',
        'etape_actuelle',
        'decision',
        'date_traitement'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'id_etudiant');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'id_matiere');
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class, 'id_reclamation');
    }

    public function history()
    {
        return $this->hasMany(ClaimHistory::class, 'id_reclamation');
    }
}
