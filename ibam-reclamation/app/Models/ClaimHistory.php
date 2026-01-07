<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClaimHistory extends Model
{
    use HasFactory;

    protected $table = 'historique_actions';
    protected $primaryKey = 'id_action';

    protected $fillable = ['id_reclamation', 'id_utilisateur', 'action', 'commentaire'];

    public function claim()
    {
        return $this->belongsTo(Claim::class, 'id_reclamation');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }
}
