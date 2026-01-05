import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';
import ClaimCard from '../components/ClaimCard';
import ClaimFilters from '../components/ClaimFilters';
import { useAuth } from '../context/AuthContext';

export default function DashboardDirector() {
    const [claims, setClaims] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('my_stage');
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [claimsRes, teachersRes] = await Promise.all([
                axios.get('/api/claims'),
                axios.get('/api/teachers')
            ]);
            setClaims(claimsRes.data);
            setTeachers(teachersRes.data);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (claimId, action, comment = '', correctedGrade = null) => {
        try {
            const payload = { action, comment };
            if (correctedGrade) payload.corrected_grade = correctedGrade;
            
            await axios.put(`/api/claims/${claimId}`, payload);
            await fetchData();
        } catch (error) {
            alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
        }
    };

    const getFilteredClaims = () => {
        switch (filter) {
            case 'my_stage':
                return claims.filter(claim => claim.current_stage === 'DIRECTEUR_ACADEMIQUE');
            case 'en_cours':
                return claims.filter(claim => ['en_cours', 'en_attente_directeur', 'en_attente_enseignant'].includes(claim.status));
            case 'validee':
                return claims.filter(claim => claim.status === 'validee');
            case 'rejetee':
                return claims.filter(claim => claim.status === 'rejetee');
            default:
                return claims;
        }
    };

    const canProcess = (claim) => {
        return claim.current_stage === 'DIRECTEUR_ACADEMIQUE';
    };

    const getClaimCounts = () => {
        return {
            all: claims.length,
            my_stage: claims.filter(claim => claim.current_stage === 'DIRECTEUR_ACADEMIQUE').length,
            en_cours: claims.filter(claim => ['en_cours', 'en_attente_directeur', 'en_attente_enseignant'].includes(claim.status)).length,
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Supervision Académique</h1>
                <p className="text-sm text-gray-500">
                    Directeur Académique - Supervision et transmission des réclamations
                </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-semibold text-sm">{counts.my_stage}</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">À traiter</p>
                            <p className="text-xs text-gray-500">Transmission</p>
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
                            <p className="text-xs text-gray-500">Finalisées</p>
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

            <ClaimFilters 
                currentFilter={filter}
                onFilterChange={setFilter}
                userRole="DIRECTEUR_ACADEMIQUE"
                claimCounts={counts}
            />

            <div className="space-y-4">
                {filteredClaims.map(claim => (
                    <ClaimCard 
                        key={claim.id} 
                        claim={claim}
                        onAction={handleAction}
                        canProcess={canProcess(claim)}
                        userRole="DIRECTEUR_ACADEMIQUE"
                        showActions={true}
                    />
                ))}
                
                {filteredClaims.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">👨‍💼</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation</h3>
                        <p className="text-sm text-gray-500">
                            {filter === 'my_stage' 
                                ? 'Aucune réclamation à traiter pour le moment.'
                                : 'Aucune réclamation ne correspond au filtre sélectionné.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}