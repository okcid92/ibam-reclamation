<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClaimController;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Routes authentifiées
Route::get('/user', [AuthController::class, 'user']);

// Routes par rôle (temporairement désactivées)
/*
Route::middleware(['role:ETUDIANT'])->group(function () {
    Route::get('/student/claims', [ClaimController::class, 'studentClaims']);
    Route::post('/claims', function() {
        return response()->json(['message' => 'Réclamation créée avec succès', 'id' => 1]);
    });
    Route::get('/student/dashboard', [ClaimController::class, 'studentDashboard']);
});
*/

/*
Route::middleware(['role:ENSEIGNANT'])->group(function () {
    Route::get('/teacher/claims', [ClaimController::class, 'teacherClaims']);
    Route::put('/teacher/claims/{id}/process', [ClaimController::class, 'processClaim']);
});

Route::middleware(['role:SCOLARITE'])->group(function () {
    Route::get('/scolarite/claims', [ClaimController::class, 'scolariteClaims']);
    Route::put('/scolarite/claims/{id}/verify', [ClaimController::class, 'verifyClaim']);
});

Route::middleware(['role:DIRECTEUR_ACADEMIQUE'])->group(function () {
    Route::get('/director/claims', [ClaimController::class, 'directorClaims']);
    Route::put('/director/claims/{id}/supervise', [ClaimController::class, 'superviseClaim']);
});

Route::middleware(['role:DIRECTEUR_ACADEMIQUE_ADJOINT'])->group(function () {
    Route::get('/assistant-director/claims', [ClaimController::class, 'assistantDirectorClaims']);
    Route::put('/assistant-director/claims/{id}/validate', [ClaimController::class, 'validateClaim']);
});
*/

// Routes communes (tous les rôles authentifiés)
Route::get('/subjects', function() {
    return response()->json([
        ['id' => 1, 'label' => 'Mathématiques', 'code' => 'MATH101'],
        ['id' => 2, 'label' => 'Informatique', 'code' => 'INFO101'],
        ['id' => 3, 'label' => 'Physique', 'code' => 'PHYS101']
    ]);
});

// Route temporaire pour les réclamations
Route::get('/claims', function() {
    return response()->json([]);
});

Route::post('/claims', function(Request $request) {
    // Validation des données selon le workflow
    $request->validate([
        'subject_id' => 'required|integer',
        'reason' => 'required|string|min:10',
        'current_grade' => 'nullable|numeric|min:0|max:20',
        'expected_grade' => 'nullable|numeric|min:0|max:20'
    ]);
    
    // Authentification obligatoire
    $token = $request->bearerToken();
    if (!$token) {
        return response()->json(['message' => 'Token manquant'], 401);
    }
    
    $decoded = base64_decode($token);
    $parts = explode(':', $decoded);
    $userId = $parts[0] ?? null;
    
    if (!$userId) {
        return response()->json(['message' => 'Token invalide'], 401);
    }
    
    // ÉTAPE 1 : SOUMISSION PAR L'ÉTUDIANT
    // Statut initial : SOUMISE
    // Étape initiale : SCOLARITE
    $claimId = DB::table('reclamations')->insertGetId([
        'id_etudiant' => $userId,
        'id_matiere' => $request->subject_id,
        'motif' => $request->reason,
        'note_actuelle' => $request->current_grade,
        'note_souhaitee' => $request->expected_grade,
        'statut' => 'SOUMISE',
        'etape_actuelle' => 'SCOLARITE',
        'date_depot' => now(),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    // Enregistrement de l'action dans l'historique
    DB::table('historique_actions')->insert([
        'id_reclamation' => $claimId,
        'id_utilisateur' => $userId,
        'action' => 'SOUMISSION',
        'commentaire' => 'Réclamation soumise par l\'\u00e9tudiant',
        'date_action' => now(),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    return response()->json([
        'message' => 'Réclamation soumise avec succès. Elle sera traitée par la scolarité.',
        'id' => $claimId,
        'statut' => 'SOUMISE',
        'etape_suivante' => 'SCOLARITE'
    ]);
});
