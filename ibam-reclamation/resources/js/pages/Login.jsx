import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(email, password);
            if (data.user.role === 'ETUDIANT') {
                navigate('/student/dashboard');
            } else {
                navigate('/staff/dashboard');
            }
        } catch (err) {
            setError('Identifiants incorrects ou compte inactif.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded shadow">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
                    Connexion IBAM
                </h2>
                {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email ou INE</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Votre email ou votre INE"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">Mot de passe</label>
                        <input
                            type="password"
                            className="w-full mt-1 p-2 border rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
