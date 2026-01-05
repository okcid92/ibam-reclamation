<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Claim;
use App\Models\Attachment;
use App\Models\ClaimHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ClaimController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'ETUDIANT') {
            return Claim::whereHas('student', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with('subject', 'attachments')->get();
        } else {
            // Logic for staff/admin to see claims based on stage/role
            // Simplified for now: show all or filter by stage
            return Claim::with('student.user', 'subject', 'attachments')->get();
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'reason' => 'required|string',
            'documents.*' => 'file|mimes:pdf,jpg,png|max:2048'
        ]);

        $student = Auth::user()->student; // Assuming relationship user->student exists

        if (!$student) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $claim = Claim::create([
            'student_id' => $student->id,
            'subject_id' => $request->subject_id,
            'reason' => $request->reason,
            'status' => 'soumise',
            'current_stage' => 'SCOLARITE'
        ]);

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('attachments');
                Attachment::create([
                    'claim_id' => $claim->id,
                    'filename' => $file->getClientOriginalName(),
                    'filepath' => $path,
                    'filetype' => $file->getClientMimeType()
                ]);
            }
        }

        // Log history
        ClaimHistory::create([
            'claim_id' => $claim->id,
            'user_id' => Auth::id(),
            'action' => 'CREATION',
            'comment' => 'Réclamation créée'
        ]);

        return response()->json($claim, 201);
    }

    public function update(Request $request, $id)
    {
        $claim = Claim::findOrFail($id);
        $user = Auth::user();
        
        $request->validate([
            'action' => 'required|in:approve,reject,validate,close',
            'comment' => 'nullable|string',
            'corrected_grade' => 'nullable|numeric|min:0|max:20'
        ]);

        $action = $request->action;
        $comment = $request->comment;
        
        // Vérification des permissions selon le rôle et l'étape
        if (!$this->canProcessClaim($user, $claim, $action)) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        // Traitement selon l'action
        switch ($action) {
            case 'approve':
                if ($user->role === 'SCOLARITE') {
                    $claim->status = 'en_cours';
                    $claim->current_stage = 'ENSEIGNANT';
                } elseif ($user->role === 'ENSEIGNANT') {
                    $claim->status = 'validee';
                    $claim->current_stage = 'DIRECTEUR_ACADEMIQUE';
                    if ($request->corrected_grade) {
                        $claim->corrected_grade = $request->corrected_grade;
                    }
                }
                break;
                
            case 'reject':
                $claim->status = 'rejetee';
                $claim->decision = $comment;
                $claim->processed_at = now();
                break;
                
            case 'validate':
                if ($user->role === 'DIRECTEUR_ACADEMIQUE') {
                    $claim->status = 'validee';
                    $claim->decision = $comment;
                    $claim->processed_at = now();
                }
                break;
                
            case 'close':
                $claim->status = 'cloturee';
                $claim->processed_at = now();
                break;
        }
        
        $claim->save();
        
        // Enregistrer l'historique
        ClaimHistory::create([
            'claim_id' => $claim->id,
            'user_id' => $user->id,
            'action' => strtoupper($action),
            'comment' => $comment
        ]);
        
        return response()->json($claim->load('student.user', 'subject', 'attachments'));
    }
    
    private function canProcessClaim($user, $claim, $action)
    {
        switch ($user->role) {
            case 'SCOLARITE':
                return $claim->current_stage === 'SCOLARITE' && in_array($action, ['approve', 'reject']);
            case 'ENSEIGNANT':
                return $claim->current_stage === 'ENSEIGNANT' && in_array($action, ['approve', 'reject']);
            case 'DIRECTEUR_ACADEMIQUE':
                return $claim->current_stage === 'DIRECTEUR_ACADEMIQUE' && in_array($action, ['validate', 'reject', 'close']);
            default:
                return false;
        }
    }
    }
    
    public function show($id)
    {
        $claim = Claim::with(['student.user', 'subject', 'attachments', 'history.user'])->findOrFail($id);
        
        // Vérifier les permissions
        $user = Auth::user();
        if ($user->role === 'ETUDIANT') {
            if ($claim->student->user_id !== $user->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }
        
        return response()->json($claim);
    }
}
