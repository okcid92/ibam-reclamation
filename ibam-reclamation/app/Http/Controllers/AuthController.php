<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required',
        ]);

        $login = $request->login;
        $password = $request->password;

        $user = null;

        // Vérifier si c'est un INE (étudiant)
        if (preg_match('/^[A-Z]\d+$/', $login)) {
            // Recherche par INE dans la table etudiants
            $etudiant = DB::table('etudiants')
                ->join('utilisateurs', 'etudiants.id_utilisateur', '=', 'utilisateurs.id_utilisateur')
                ->where('etudiants.ine', $login)
                ->select('utilisateurs.*', 'etudiants.ine', 'etudiants.filiere', 'etudiants.niveau')
                ->first();
            
            if ($etudiant) {
                $user = $etudiant;
            }
        } else {
            // Recherche par identifiant/email pour le personnel
            $user = DB::table('utilisateurs')
                ->where('role', '!=', 'ETUDIANT')
                ->where(function($query) use ($login) {
                    $query->where('email', $login)
                          ->orWhere('identifiant_interne', $login);
                })
                ->first();
        }

        if (!$user) {
            return response()->json(['message' => 'Accès refusé. Veuillez contacter la scolarité.'], 401);
        }

        if (!Hash::check($password, $user->mot_de_passe)) {
            return response()->json(['message' => 'Accès refusé. Veuillez contacter la scolarité.'], 401);
        }

        if ($user->statut === 'INACTIF') {
            return response()->json(['message' => 'Accès refusé. Veuillez contacter la scolarité.'], 403);
        }
        // Créer un token simple (pour la démo)
        $token = base64_encode($user->id_utilisateur . ':' . time());
        
        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id_utilisateur,
                'firstname' => $user->prenom,
                'lastname' => $user->nom,
                'role' => $user->role,
                'status' => $user->statut,
                'ine' => $user->ine ?? null,
                'filiere' => $user->filiere ?? null,
                'niveau' => $user->niveau ?? null
            ]
        ]);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'Déconnecté']);
    }

    public function user(Request $request)
    {
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

        $user = DB::table('utilisateurs')->where('id_utilisateur', $userId)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Si c'est un étudiant, récupérer les infos supplémentaires
        if ($user->role === 'ETUDIANT') {
            $etudiant = DB::table('etudiants')->where('id_utilisateur', $userId)->first();
            return response()->json([
                'id' => $user->id_utilisateur,
                'firstname' => $user->prenom,
                'lastname' => $user->nom,
                'role' => $user->role,
                'status' => $user->statut,
                'ine' => $etudiant->ine ?? null,
                'filiere' => $etudiant->filiere ?? null,
                'niveau' => $etudiant->niveau ?? null
            ]);
        }

        return response()->json([
            'id' => $user->id_utilisateur,
            'firstname' => $user->prenom,
            'lastname' => $user->nom,
            'role' => $user->role,
            'status' => $user->statut
        ]);
    }
}