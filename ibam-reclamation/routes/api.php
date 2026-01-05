<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClaimController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::put('/claims/{id}', [ClaimController::class, 'update']);
    Route::get('/claims/{id}', [ClaimController::class, 'show']);
    
    Route::get('/subjects', function() {
        return \App\Models\Subject::all();
    });
    
    Route::get('/dashboard/stats', function() {
        $user = auth()->user();
        if ($user->role === 'ETUDIANT') {
            $studentId = $user->student->id;
            return [
                'total' => \App\Models\Claim::where('student_id', $studentId)->count(),
                'pending' => \App\Models\Claim::where('student_id', $studentId)->whereIn('status', ['soumise', 'en_cours'])->count(),
                'approved' => \App\Models\Claim::where('student_id', $studentId)->where('status', 'validee')->count(),
                'rejected' => \App\Models\Claim::where('student_id', $studentId)->where('status', 'rejetee')->count()
            ];
        } else {
            return [
                'total' => \App\Models\Claim::count(),
                'pending' => \App\Models\Claim::whereIn('status', ['soumise', 'en_cours'])->count(),
                'approved' => \App\Models\Claim::where('status', 'validee')->count(),
                'rejected' => \App\Models\Claim::where('status', 'rejetee')->count()
            ];
        }
    });
});
