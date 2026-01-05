<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'reason',
        'initial_grade',
        'corrected_grade',
        'status',
        'current_stage',
        'decision',
        'processed_at'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    public function history()
    {
        return $this->hasMany(ClaimHistory::class);
    }
}
