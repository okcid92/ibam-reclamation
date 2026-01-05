import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authLogin(login, password);
            
            switch (data.user.role) {
                case 'ETUDIANT':
                    navigate('/student/dashboard');
                    break;
                case 'ENSEIGNANT':
                    navigate('/teacher/dashboard');
                    break;
                case 'SCOLARITE':
                    navigate('/scolarite/dashboard');
                    break;
                case 'DIRECTEUR_ACADEMIQUE':
                    navigate('/director/dashboard');
                    break;
                case 'DIRECTEUR_ACADEMIQUE_ADJOINT':
                    navigate('/assistant-director/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError('Identifiants incorrects ou compte inactif.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl text-white">🎓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            IBAM Réclamations
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Système de gestion des réclamations académiques
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                <div className="flex items-center">
                                    <span className="mr-2">❌</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                                Identifiant
                            </label>
                            <input
                                id="login"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="INE (étudiants) ou email (personnel)"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Étudiants: utilisez votre INE • Personnel: utilisez votre email
                            </p>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Votre mot de passe"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Connexion...
                                </span>
                            ) : (
                                '🔐 Se connecter'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">
                                ℹ️ Accès par rôle
                            </h3>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• <strong>Étudiants:</strong> Déposer et suivre vos réclamations</li>
                                <li>• <strong>Enseignants:</strong> Traiter les réclamations de vos matières</li>
                                <li>• <strong>Scolarité:</strong> Vérifier et finaliser les demandes</li>
                                <li>• <strong>Direction:</strong> Superviser le processus</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Institut Africain de Biomédicale (IBAM)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Système sécurisé - Tous droits réservés
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}