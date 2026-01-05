<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
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
        
        if (!$user || $user->statut === 'INACTIF') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $request->merge(['auth_user' => $user]);
        
        return $next($request);
    }
}
