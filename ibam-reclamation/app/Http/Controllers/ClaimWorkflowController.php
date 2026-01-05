<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClaimWorkflowController extends Controller
{
    /**
     * ÉTAPE 2: Traitement par la scolarité
     * Transition: SOUMISE → REJETEE ou SCOLARITE → DIRECTEUR_ACADEMIQUE
     */
    public function processScolarite(Request $request, $claimId)
    {
        $claim = DB::table('reclamations')->where('id_reclamation', $claimId)->first();
        
        // Vérification du workflow
        if (!$claim || $claim->statut !== 'SOUMISE' || $claim->etape_actuelle !== 'SCOLARITE') {
            return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
        }
        
        $request->validate([
            'decision' => 'required|in:RECEVABLE,NON_RECEVABLE',
            'commentaire' => 'nullable|string'
        ]);
        
        if ($request->decision === 'NON_RECEVABLE') {
            // Rejet par la scolarité
            DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                'statut' => 'REJETEE',
                'etape_actuelle' => null,
                'decision' => $request->commentaire,
                'date_traitement' => now(),
                'updated_at' => now()
            ]);
            
            $action = 'REJET_SCOLARITE';
            $message = 'Réclamation rejetée par la scolarité';
        } else {
            // Transmission au directeur académique
            DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                'etape_actuelle' => 'DIRECTEUR_ACADEMIQUE',
                'updated_at' => now()
            ]);
            
            $action = 'TRANSMISSION_DIRECTEUR';
            $message = 'Réclamation transmise au directeur académique';
        }
        
        // Historique
        DB::table('historique_actions')->insert([
            'id_reclamation' => $claimId,
            'id_utilisateur' => $this->getUserId($request),
            'action' => $action,
            'commentaire' => $request->commentaire,
            'date_action' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        return response()->json(['message' => $message]);
    }
    
    /**
     * ÉTAPE 3: Transmission par le directeur académique
     * Transition: DIRECTEUR_ACADEMIQUE → ENSEIGNANT
     */
    public function processDirecteur(Request $request, $claimId)
    {
        $claim = DB::table('reclamations')->where('id_reclamation', $claimId)->first();
        
        if (!$claim || $claim->etape_actuelle !== 'DIRECTEUR_ACADEMIQUE') {
            return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
        }
        
        // Transmission à l'enseignant
        DB::table('reclamations')->where('id_reclamation', $claimId)->update([
            'etape_actuelle' => 'ENSEIGNANT',
            'updated_at' => now()
        ]);
        
        DB::table('historique_actions')->insert([
            'id_reclamation' => $claimId,
            'id_utilisateur' => $this->getUserId($request),
            'action' => 'TRANSMISSION_ENSEIGNANT',
            'commentaire' => 'Réclamation transmise à l\'enseignant',
            'date_action' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        return response()->json(['message' => 'Réclamation transmise à l\'enseignant']);
    }
    
    /**
     * ÉTAPE 4: Traitement par l'enseignant
     * Transition: ENSEIGNANT → DIRECTEUR_ADJOINT avec VALIDEE ou NON_VALIDEE
     */
    public function processEnseignant(Request $request, $claimId)
    {
        $claim = DB::table('reclamations')->where('id_reclamation', $claimId)->first();
        
        if (!$claim || $claim->etape_actuelle !== 'ENSEIGNANT') {
            return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
        }
        
        $request->validate([
            'decision' => 'required|in:VALIDEE,NON_VALIDEE',
            'note_corrigee' => 'nullable|numeric|min:0|max:20',
            'commentaire' => 'nullable|string'
        ]);
        
        DB::table('reclamations')->where('id_reclamation', $claimId)->update([
            'statut' => $request->decision,
            'etape_actuelle' => 'DIRECTEUR_ADJOINT',
            'note_corrigee' => $request->note_corrigee,
            'decision' => $request->commentaire,
            'updated_at' => now()
        ]);
        
        DB::table('historique_actions')->insert([
            'id_reclamation' => $claimId,
            'id_utilisateur' => $this->getUserId($request),
            'action' => 'DECISION_ENSEIGNANT',
            'commentaire' => $request->commentaire,
            'date_action' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        return response()->json(['message' => 'Décision de l\'enseignant enregistrée']);
    }
    
    /**
     * ÉTAPE 5: Validation par le directeur adjoint
     * Transition: DIRECTEUR_ADJOINT → SCOLARITE
     */
    public function processDirecteurAdjoint(Request $request, $claimId)
    {
        $claim = DB::table('reclamations')->where('id_reclamation', $claimId)->first();
        
        if (!$claim || $claim->etape_actuelle !== 'DIRECTEUR_ADJOINT') {
            return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
        }
        
        DB::table('reclamations')->where('id_reclamation', $claimId)->update([
            'etape_actuelle' => 'SCOLARITE',
            'updated_at' => now()
        ]);
        
        DB::table('historique_actions')->insert([
            'id_reclamation' => $claimId,
            'id_utilisateur' => $this->getUserId($request),
            'action' => 'VALIDATION_DIRECTEUR_ADJOINT',
            'commentaire' => 'Validation par le directeur adjoint',
            'date_action' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        return response()->json(['message' => 'Réclamation renvoyée à la scolarité pour finalisation']);
    }
    
    /**
     * ÉTAPE 6: Finalisation par la scolarité
     * Transition: SCOLARITE → TERMINEE
     */
    public function finalizeScolarite(Request $request, $claimId)
    {
        $claim = DB::table('reclamations')->where('id_reclamation', $claimId)->first();
        
        if (!$claim || $claim->etape_actuelle !== 'SCOLARITE' || !in_array($claim->statut, ['VALIDEE', 'NON_VALIDEE'])) {
            return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
        }
        
        DB::table('reclamations')->where('id_reclamation', $claimId)->update([
            'statut' => 'TERMINEE',
            'etape_actuelle' => null,
            'date_traitement' => now(),
            'updated_at' => now()
        ]);
        
        DB::table('historique_actions')->insert([
            'id_reclamation' => $claimId,
            'id_utilisateur' => $this->getUserId($request),
            'action' => 'FINALISATION',
            'commentaire' => 'Réclamation finalisée',
            'date_action' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        return response()->json(['message' => 'Réclamation finalisée']);
    }
    
    private function getUserId(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) return null;
        
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        return $parts[0] ?? null;
    }
}