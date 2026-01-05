<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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

        // Tentative de connexion par email
        $user = User::where('email', $login)->first();
        
        // Si pas trouvé par email, chercher par INE
        if (!$user) {
            $student = \App\Models\Student::where('ine', $login)->first();
            if ($student) {
                $user = $student->user;
            }
        }

        if ($user && Hash::check($password, $user->password)) {
            if ($user->status === 'INACTIF') {
                return response()->json(['message' => 'Compte inactif'], 403);
            }
            
            $token = $user->createToken('auth-token')->plainTextToken;
            $userData = $user->load(['student', 'teacher']);
            
            return response()->json([
                'token' => $token, 
                'user' => $userData, 
                'role' => $user->role
            ]);
        }

        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
