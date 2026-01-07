import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            'ETUDIANT': 'Étudiant',
            'ENSEIGNANT': 'Enseignant',
            'SCOLARITE': 'Scolarité',
            'DIRECTEUR_ADJOINT': 'Directeur Adjoint'
        };
        return roleNames[role] || role;
    };

    const getNavigationItems = () => {
        if (!user) return [];
        
        switch (user.role) {
            case 'ETUDIANT':
                return [
                    { path: '/student/dashboard', label: 'Mes Réclamations', icon: '📋' },
                    { path: '/student/create-claim', label: 'Nouvelle Réclamation', icon: '➕' }
                ];
            case 'ENSEIGNANT':
                return [
                    { path: '/teacher/dashboard', label: 'Réclamations à traiter', icon: '📝' },
                    { path: '/teacher/subjects', label: 'Mes Matières', icon: '📚' }
                ];
            case 'SCOLARITE':
                return [
                    { path: '/scolarite/dashboard', label: 'Gestion Réclamations', icon: '🏫' },
                    { path: '/scolarite/students', label: 'Étudiants', icon: '👥' }
                ];
            case 'DIRECTEUR_ADJOINT':
                return [
                    { path: '/da/dashboard', label: 'Validation', icon: '✅' }
                ];
            default:
                return [];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                🎓 IBAM Réclamations
                            </Link>
                            
                            {navigationItems.length > 0 && (
                                <div className="hidden md:flex space-x-4">
                                    {navigationItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                location.pathname === item.path
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="mr-2">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {user && (
                                <>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.firstname} {user.lastname}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {getRoleDisplayName(user.role)}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        🚪 Déconnexion
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
