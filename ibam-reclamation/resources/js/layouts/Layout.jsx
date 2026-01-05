import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    IBAM Réclamations
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user && (
                                <>
                                    <span className="text-sm text-gray-500">
                                        Bonjour, <span className="font-medium text-gray-900">{user.firstname} {user.lastname}</span>
                                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                                            {user.role}
                                        </span>
                                    </span>
                                    <button 
                                        onClick={handleLogout}
                                        className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        Déconnexion
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                {children}
            </main>
        </div>
    );
}
