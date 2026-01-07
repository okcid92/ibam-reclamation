<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ClaimWorkflowController extends Controller
{
    // Récupérer les matières
    public function getSubjects()
    {
        return DB::table('matieres')
            ->select('id_matiere as id', 'libelle as label', 'code_matiere as code')
            ->get();
    }

    // Récupérer une réclamation avec ses pièces jointes
    public function show(Request $request, $id)
    {
        $userId = $this->getUserId($request);
        if (!$userId) return response()->json(['message' => 'Token invalide'], 401);

        $claim = DB::table('reclamations as r')
            ->join('etudiants as e', 'r.id_etudiant', '=', 'e.id_etudiant')
            ->join('utilisateurs as u', 'e.id_utilisateur', '=', 'u.id_utilisateur')
            ->join('matieres as m', 'r.id_matiere', '=', 'm.id_matiere')
            ->where('r.id_reclamation', $id)
            ->select(
                'r.id_reclamation as id',
                'r.motif as reason',
                'r.note_actuelle as current_grade',
                'r.note_souhaitee as expected_grade',
                'r.note_corrigee as corrected_grade',
                'r.statut as status',
                'r.etape_actuelle as current_step',
                'r.decision',
                'r.date_depot as created_at',
                'r.date_traitement as processed_at',
                'u.prenom as student_firstname',
                'u.nom as student_lastname',
                'e.ine as student_ine',
                'm.libelle as subject_name',
                'm.code_matiere as subject_code'
            )
            ->first();

        if (!$claim) {
            return response()->json(['message' => 'Réclamation non trouvée'], 404);
        }

        // Récupérer les pièces jointes
        $attachments = DB::table('pieces_jointes')
            ->where('id_reclamation', $id)
            ->select(
                'id_piece as id',
                'nom_fichier as filename',
                'type_fichier as filetype',
                'chemin_fichier as filepath',
                'date_upload as uploaded_at'
            )
            ->get()
            ->map(function ($attachment) {
                $attachment->url = asset('storage/' . $attachment->filepath);
                return $attachment;
            });

        // Récupérer l'historique
        $history = DB::table('historique_actions as h')
            ->join('utilisateurs as u', 'h.id_utilisateur', '=', 'u.id_utilisateur')
            ->where('h.id_reclamation', $id)
            ->select(
                'h.id_action as id',
                'h.action',
                'h.commentaire as comment',
                'h.date_action as created_at',
                'u.prenom as user_firstname',
                'u.nom as user_lastname',
                'u.role as user_role'
            )
            ->orderBy('h.date_action', 'asc')
            ->get();

        $claim->attachments = $attachments;
        $claim->history = $history;

        return response()->json($claim);
    }

    // Lister les réclamations
    public function index(Request $request)
    {
        $userId = $this->getUserId($request);
        if (!$userId) return response()->json(['message' => 'Token invalide'], 401);

        $user = DB::table('utilisateurs')->where('id_utilisateur', $userId)->first();
        if (!$user) return response()->json(['message' => 'Utilisateur non trouvé'], 404);

        $query = DB::table('reclamations as r')
            ->join('etudiants as e', 'r.id_etudiant', '=', 'e.id_etudiant')
            ->join('utilisateurs as u', 'e.id_utilisateur', '=', 'u.id_utilisateur')
            ->join('matieres as m', 'r.id_matiere', '=', 'm.id_matiere')
            ->select(
                'r.id_reclamation as id',
                'r.motif as reason',
                'r.note_actuelle as current_grade',
                'r.note_souhaitee as expected_grade',
                'r.note_corrigee as corrected_grade',
                'r.statut as status',
                'r.etape_actuelle as current_step',
                'r.decision',
                'r.date_depot as created_at',
                'r.date_traitement as processed_at',
                'u.prenom as student_firstname',
                'u.nom as student_lastname',
                'e.ine as student_ine',
                'm.libelle as subject_name',
                'm.code_matiere as subject_code'
            );

        switch ($user->role) {
            case 'ETUDIANT':
                $etudiant = DB::table('etudiants')->where('id_utilisateur', $userId)->first();
                if ($etudiant) {
                    $query->where('r.id_etudiant', $etudiant->id_etudiant);
                } else {
                    return response()->json([]);
                }
                break;
            case 'SCOLARITE':
                // Scolarité voit TOUTES les réclamations pour pouvoir suivre
                // Pas de filtre ici
                break;
            case 'DIRECTEUR_ADJOINT':
                // DA voit celles à son étape ou celles qu'il a déjà traitées
                $query->where(function ($q) {
                    $q->where('r.etape_actuelle', 'DIRECTEUR_ADJOINT')
                        ->orWhereIn('r.statut', ['VALIDEE', 'NON_VALIDEE', 'TERMINEE']);
                });
                break;
            case 'ENSEIGNANT':
                // Enseignant voit seulement celles liées à ses matières
                $enseignant = DB::table('enseignants')->where('id_utilisateur', $userId)->first();
                if ($enseignant) {
                    $matiereIds = DB::table('enseignant_matieres')
                        ->where('id_enseignant', $enseignant->id_enseignant)
                        ->pluck('id_matiere');
                    $query->where('r.etape_actuelle', 'ENSEIGNANT')
                        ->whereIn('r.id_matiere', $matiereIds);
                } else {
                    return response()->json([]);
                }
                break;
        }

        $claims = $query->orderBy('r.date_depot', 'desc')->get();

        // Ajouter les pièces jointes pour chaque réclamation
        foreach ($claims as $claim) {
            $claim->attachments = DB::table('pieces_jointes')
                ->where('id_reclamation', $claim->id)
                ->select(
                    'id_piece as id',
                    'nom_fichier as filename',
                    'type_fichier as filetype',
                    'chemin_fichier as filepath'
                )
                ->get()
                ->map(function ($attachment) {
                    $attachment->url = asset('storage/' . $attachment->filepath);
                    return $attachment;
                });
        }

        return response()->json($claims);
    }

    // Soumettre une réclamation (Etape 1: ÉTUDIANT)
    public function store(Request $request)
    {
        $userId = $this->getUserId($request);
        if (!$userId) return response()->json(['message' => 'Token invalide'], 401);

        $request->validate([
            'subject_id' => 'required|integer|exists:matieres,id_matiere',
            'reason' => 'required|string|min:10',
            'current_grade' => 'nullable|numeric|min:0|max:20',
            'expected_grade' => 'nullable|numeric|min:0|max:20',
            'documents.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120'
        ]);

        $etudiant = DB::table('etudiants')->where('id_utilisateur', $userId)->first();
        if (!$etudiant) {
            return response()->json(['message' => 'Utilisateur non reconnu comme étudiant'], 403);
        }

        $claimId = DB::table('reclamations')->insertGetId([
            'id_etudiant' => $etudiant->id_etudiant,
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

        // Gestion des fichiers
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('attachments', 'public');
                DB::table('pieces_jointes')->insert([
                    'id_reclamation' => $claimId,
                    'nom_fichier' => $file->getClientOriginalName(),
                    'type_fichier' => $file->getClientMimeType(),
                    'chemin_fichier' => $path,
                    'date_upload' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        DB::table('historique_actions')->insert([
            'id_reclamation' => $claimId,
            'id_utilisateur' => $userId,
            'action' => 'SOUMISSION',
            'commentaire' => 'Réclamation soumise par l\'étudiant',
            'date_action' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Réclamation soumise avec succès.',
            'id' => $claimId,
            'statut' => 'SOUMISE',
            'etape_suivante' => 'SCOLARITE'
        ], 201);
    }

    // Dispatcher pour les actions (PUT /claims/{id})
    public function update(Request $request, $id)
    {
        $userId = $this->getUserId($request);
        if (!$userId) return response()->json(['message' => 'Token invalide'], 401);

        $user = DB::table('utilisateurs')->where('id_utilisateur', $userId)->first();
        if (!$user) return response()->json(['message' => 'Utilisateur non trouvé'], 404);

        $claim = DB::table('reclamations')->where('id_reclamation', $id)->first();
        if (!$claim) {
            return response()->json(['message' => 'Réclamation non trouvée'], 404);
        }

        $request->validate([
            'action' => 'required|in:approve,reject',
            'comment' => 'nullable|string',
            'corrected_grade' => 'nullable|numeric|min:0|max:20'
        ]);

        $action = $request->action;

        // Dispatch selon le rôle
        switch ($user->role) {
            case 'SCOLARITE':
                return $this->processScolarite($request, $id, $userId, $claim);

            case 'DIRECTEUR_ADJOINT':
                return $this->processDirecteurAdjoint($request, $id, $userId, $claim);

            case 'ENSEIGNANT':
                return $this->processEnseignant($request, $id, $userId, $claim);

            default:
                return response()->json(['message' => 'Rôle non autorisé à effectuer cette action'], 403);
        }
    }

    /**
     * ÉTAPE 2: Traitement par la SCOLARITÉ
     * - Si SOUMISE + SCOLARITE: Vérifie fichiers → DIRECTEUR_ADJOINT ou REJETEE
     * - Si (VALIDEE|NON_VALIDEE) + SCOLARITE: Finalise → TERMINEE
     */
    private function processScolarite(Request $request, $claimId, $userId, $claim)
    {
        $action = $request->action;
        $comment = $request->comment;

        // Cas 1: Première vérification (fichiers, délais, lisibilité)
        if ($claim->statut === 'SOUMISE' && $claim->etape_actuelle === 'SCOLARITE') {
            if ($action === 'reject') {
                DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                    'statut' => 'REJETEE',
                    'etape_actuelle' => null,
                    'decision' => $comment,
                    'date_traitement' => now(),
                    'updated_at' => now()
                ]);
                $this->logAction($claimId, $userId, 'REJET_SCOLARITE', $comment);
                return response()->json(['message' => 'Réclamation rejetée (non recevable)']);
            } else {
                // Transmettre au Directeur Adjoint
                DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                    'etape_actuelle' => 'DIRECTEUR_ADJOINT',
                    'updated_at' => now()
                ]);
                $this->logAction($claimId, $userId, 'TRANSMISSION_DA', $comment ?? 'Dossier recevable, transmis au DA');
                return response()->json(['message' => 'Réclamation transmise au Directeur Adjoint']);
            }
        }

        // Cas 2: Finalisation après retour du DA (avis enseignant reçu)
        if (in_array($claim->statut, ['VALIDEE', 'NON_VALIDEE']) && $claim->etape_actuelle === 'SCOLARITE') {
            DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                'statut' => 'TERMINEE',
                'etape_actuelle' => null,
                'date_traitement' => now(),
                'updated_at' => now()
            ]);
            $this->logAction($claimId, $userId, 'FINALISATION', 'Étudiant notifié. Réclamation clôturée.');
            return response()->json(['message' => 'Réclamation finalisée. Étudiant notifié.']);
        }

        return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
    }

    /**
     * ÉTAPE 3 & 5: Traitement par le DIRECTEUR ADJOINT
     * - Si SCOLARITE → DIRECTEUR_ADJOINT: Transmet à l'ENSEIGNANT
     * - Si ENSEIGNANT → DIRECTEUR_ADJOINT: Transmet à SCOLARITÉ pour notification
     */
    private function processDirecteurAdjoint(Request $request, $claimId, $userId, $claim)
    {
        $action = $request->action;
        $comment = $request->comment;

        if ($claim->etape_actuelle !== 'DIRECTEUR_ADJOINT') {
            return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
        }

        // Cas 1: Réclamation vient de la Scolarité (statut SOUMISE) → Transmettre à l'Enseignant
        if ($claim->statut === 'SOUMISE') {
            if ($action === 'reject') {
                DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                    'statut' => 'REJETEE',
                    'etape_actuelle' => null,
                    'decision' => $comment,
                    'date_traitement' => now(),
                    'updated_at' => now()
                ]);
                $this->logAction($claimId, $userId, 'REJET_DA', $comment);
                return response()->json(['message' => 'Réclamation rejetée par le DA']);
            } else {
                DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                    'etape_actuelle' => 'ENSEIGNANT',
                    'updated_at' => now()
                ]);
                $this->logAction($claimId, $userId, 'TRANSMISSION_ENSEIGNANT', $comment ?? 'Transmis à l\'enseignant concerné');
                return response()->json(['message' => 'Réclamation transmise à l\'enseignant']);
            }
        }

        // Cas 2: Réclamation revient de l'Enseignant (statut VALIDEE ou NON_VALIDEE) → Transmettre à Scolarité
        if (in_array($claim->statut, ['VALIDEE', 'NON_VALIDEE'])) {
            DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                'etape_actuelle' => 'SCOLARITE',
                'updated_at' => now()
            ]);
            $this->logAction($claimId, $userId, 'TRANSMISSION_SCOLARITE', 'Avis enseignant transmis à la scolarité pour notification');
            return response()->json(['message' => 'Avis transmis à la scolarité pour notification de l\'étudiant']);
        }

        return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
    }

    /**
     * ÉTAPE 4: Traitement par l'ENSEIGNANT
     * - Donne son avis: FAVORABLE (VALIDEE) ou DÉFAVORABLE (NON_VALIDEE)
     * - Peut corriger la note si favorable
     */
    private function processEnseignant(Request $request, $claimId, $userId, $claim)
    {
        $action = $request->action;
        $comment = $request->comment;
        $correctedGrade = $request->corrected_grade;

        if ($claim->etape_actuelle !== 'ENSEIGNANT') {
            return response()->json(['message' => 'Action non autorisée à cette étape'], 403);
        }

        if ($action === 'approve') {
            // Avis FAVORABLE - la réclamation est fondée
            DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                'statut' => 'VALIDEE',
                'etape_actuelle' => 'DIRECTEUR_ADJOINT',
                'note_corrigee' => $correctedGrade,
                'decision' => $comment ?? 'Avis favorable: réclamation fondée',
                'updated_at' => now()
            ]);
            $this->logAction($claimId, $userId, 'AVIS_FAVORABLE', $comment ?? 'Réclamation fondée. Note corrigée: ' . $correctedGrade);
            return response()->json(['message' => 'Avis favorable enregistré. Transmis au DA.']);
        } else {
            // Avis DÉFAVORABLE - réclamation non fondée
            DB::table('reclamations')->where('id_reclamation', $claimId)->update([
                'statut' => 'NON_VALIDEE',
                'etape_actuelle' => 'DIRECTEUR_ADJOINT',
                'decision' => $comment ?? 'Avis défavorable: réclamation non fondée',
                'updated_at' => now()
            ]);
            $this->logAction($claimId, $userId, 'AVIS_DEFAVORABLE', $comment ?? 'Réclamation non fondée');
            return response()->json(['message' => 'Avis défavorable enregistré. Transmis au DA.']);
        }
    }

    private function logAction($claimId, $userId, $action, $comment)
    {
        DB::table('historique_actions')->insert([
            'id_reclamation' => $claimId,
            'id_utilisateur' => $userId,
            'action' => $action,
            'commentaire' => $comment,
            'date_action' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
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
