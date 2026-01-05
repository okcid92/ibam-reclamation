<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClaimHistory extends Model
{
    use HasFactory;

    protected $table = 'claim_history';
    protected $fillable = ['claim_id', 'user_id', 'action', 'comment'];

    public function claim()
    {
        return $this->belongsTo(Claim::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
