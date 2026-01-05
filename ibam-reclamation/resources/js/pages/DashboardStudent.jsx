import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';
import ClaimCard from '../components/ClaimCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardStudent() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();
    
    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const response = await axios.get('/api/claims');
            setClaims(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des réclamations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredClaims = () => {
        switch (filter) {
            case 'en_cours':
                return claims.filter(claim => ['soumise', 'en_cours', 'en_attente_scolarite', 'en_attente_directeur', 'en_attente_enseignant', 'en_attente_da_adjoint'].includes(claim.status));
            case 'validee':
                return claims.filter(claim => claim.status === 'validee');
            case 'rejetee':
                return claims.filter(claim => claim.status === 'rejetee');
            default:
                return claims;
        }
    };

    const getClaimCounts = () => {
        return {
            all: claims.length,
            en_cours: claims.filter(claim => ['soumise', 'en_cours', 'en_attente_scolarite', 'en_attente_directeur', 'en_attente_enseignant', 'en_attente_da_adjoint'].includes(claim.status)).length,
            validee: claims.filter(claim => claim.status === 'validee').length,
            rejetee: claims.filter(claim => claim.status === 'rejetee').length
        };
    };

    const filteredClaims = getFilteredClaims();
    const counts = getClaimCounts();

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes Réclamations</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Bienvenue {user?.firstname}, suivez l'état de vos demandes académiques.
                        </p>
                    </div>
                    <Link 
                        to="/student/create-claim" 
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        ➕ Nouvelle Réclamation
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">{counts.all}</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Total</p>
                                <p className="text-xs text-gray-500">Réclamations</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-600 font-semibold text-sm">{counts.en_cours}</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">En cours</p>
                                <p className="text-xs text-gray-500">Traitement</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-semibold text-sm">{counts.validee}</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Validées</p>
                                <p className="text-xs text-gray-500">Acceptées</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-semibold text-sm">{counts.rejetee}</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Rejetées</p>
                                <p className="text-xs text-gray-500">Refusées</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'Toutes', count: counts.all },
                            { key: 'en_cours', label: 'En cours', count: counts.en_cours },
                            { key: 'validee', label: 'Validées', count: counts.validee },
                            { key: 'rejetee', label: 'Rejetées', count: counts.rejetee }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.key}
                                onClick={() => setFilter(filterOption.key)}
                                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === filterOption.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filterOption.label}
                                {filterOption.count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                        filter === filterOption.key
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                    }`}>
                                        {filterOption.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredClaims.map(claim => (
                    <ClaimCard 
                        key={claim.id} 
                        claim={claim}
                        canProcess={false}
                        showActions={false}
                    />
                ))}
                
                {filteredClaims.length === 0 && claims.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation</h3>
                        <p className="text-sm text-gray-500 mb-6">Commencez par créer votre première demande de réclamation.</p>
                        <Link 
                            to="/student/create-claim" 
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            ➕ Créer une réclamation
                        </Link>
                    </div>
                )}
                
                {filteredClaims.length === 0 && claims.length > 0 && (
                    <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</h3>
                        <p className="text-sm text-gray-500">Aucune réclamation ne correspond au filtre sélectionné.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}