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
        // Logic for updating status/decision by different roles
        // To be implemented
    }
}
