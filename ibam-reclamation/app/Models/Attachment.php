<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $table = 'pieces_jointes';
    protected $primaryKey = 'id_piece';

    protected $fillable = ['id_reclamation', 'nom_fichier', 'chemin_fichier', 'type_fichier'];

    public function claim()
    {
        return $this->belongsTo(Claim::class, 'id_reclamation');
    }
}
