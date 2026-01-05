<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = ['claim_id', 'filename', 'filepath', 'filetype'];

    public function claim()
    {
        return $this->belongsTo(Claim::class);
    }
}
