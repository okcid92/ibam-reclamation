<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClaimWorkflowController;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Routes authentifiées
Route::get('/user', [AuthController::class, 'user']);

// Routes de données de référence
Route::get('/subjects', [ClaimWorkflowController::class, 'getSubjects']);

// Routes de gestion des réclamations
Route::get('/claims', [ClaimWorkflowController::class, 'index']);
Route::get('/claims/{id}', [ClaimWorkflowController::class, 'show']); // Voir une réclamation avec pièces jointes
Route::post('/claims', [ClaimWorkflowController::class, 'store']); // Submission (Etudiant)
Route::put('/claims/{id}', [ClaimWorkflowController::class, 'update']); // Dispatcher unique pour le workflow
