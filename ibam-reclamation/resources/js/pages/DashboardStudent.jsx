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
        setLoading(true);
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
                // En cours = SOUMISE avec une étape actuelle
                return claims.filter(claim => 
                    claim.status === 'SOUMISE' && claim.current_step
                );
            case 'en_attente':
                // En attente de notification finale = VALIDEE ou NON_VALIDEE pas encore TERMINEE
                return claims.filter(claim => 
                    ['VALIDEE', 'NON_VALIDEE'].includes(claim.status) && claim.current_step
                );
            case 'terminees':
                return claims.filter(claim => claim.status === 'TERMINEE');
            case 'rejetees':
                return claims.filter(claim => claim.status === 'REJETEE');
            default:
                return claims;
        }
    };

    const getClaimCounts = () => {
        return {
            all: claims.length,
            en_cours: claims.filter(claim => claim.status === 'SOUMISE' && claim.current_step).length,
            en_attente: claims.filter(claim => ['VALIDEE', 'NON_VALIDEE'].includes(claim.status) && claim.current_step).length,
            terminees: claims.filter(claim => claim.status === 'TERMINEE').length,
            rejetees: claims.filter(claim => claim.status === 'REJETEE').length
        };
    };

    const filteredClaims = getFilteredClaims();
    const counts = getClaimCounts();

    const filterOptions = [
        { key: 'all', label: 'Toutes', count: counts.all, color: 'blue' },
        { key: 'en_cours', label: 'En cours', count: counts.en_cours, color: 'yellow' },
        { key: 'en_attente', label: 'En attente', count: counts.en_attente, color: 'purple' },
        { key: 'terminees', label: 'Terminées', count: counts.terminees, color: 'green' },
        { key: 'rejetees', label: 'Rejetées', count: counts.rejetees, color: 'red' }
    ];

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
                        <h1 className="text-3xl font-bold text-gray-900">📋 Mes Réclamations</h1>
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

                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {filterOptions.map(opt => (
                        <div 
                            key={opt.key}
                            onClick={() => setFilter(opt.key)}
                            className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                                filter === opt.key 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-10 h-10 bg-${opt.color}-100 rounded-full flex items-center justify-center`}>
                                    <span className={`text-${opt.color}-600 font-bold`}>{opt.count}</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Légende des statuts */}
                {/* <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">📊 Comprendre les statuts:</h3>
                    <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <span>🟡 <strong>En cours:</strong> Traitement en cours</span>
                        <span>🟣 <strong>En attente:</strong> Avis reçu</span>
                        <span>🟢 <strong>Terminée:</strong> Traitement finalisé</span>
                        <span>🔴 <strong>Rejetée:</strong> Demande refusée</span>
                    </div>
                </div> */}
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