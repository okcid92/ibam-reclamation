import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';
import ClaimCard from '../components/ClaimCard';
import { useAuth } from '../context/AuthContext';

export default function DashboardTeacher() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('a_traiter');
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const claimsRes = await axios.get('/api/claims');
            setClaims(claimsRes.data);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (claimId, action, comment = '', correctedGrade = null) => {
        try {
            const payload = { action, comment };
            if (correctedGrade) payload.corrected_grade = parseFloat(correctedGrade);
            
            const response = await axios.put(`/api/claims/${claimId}`, payload);
            setSuccessMessage(response.data.message || 'Avis enregistré avec succès');
            await fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
        }
    };

    const getFilteredClaims = () => {
        switch (filter) {
            case 'a_traiter':
                return claims.filter(claim => claim.current_step === 'ENSEIGNANT');
            case 'favorable':
                return claims.filter(claim => claim.status === 'VALIDEE');
            case 'defavorable':
                return claims.filter(claim => claim.status === 'NON_VALIDEE');
            default:
                return claims;
        }
    };

    const canProcess = (claim) => {
        return claim.current_step === 'ENSEIGNANT';
    };

    const getClaimCounts = () => {
        return {
            all: claims.length,
            a_traiter: claims.filter(claim => claim.current_step === 'ENSEIGNANT').length,
            favorable: claims.filter(claim => claim.status === 'VALIDEE').length,
            defavorable: claims.filter(claim => claim.status === 'NON_VALIDEE').length
        };
    };

    const filteredClaims = getFilteredClaims();
    const counts = getClaimCounts();

    const filterOptions = [
        { key: 'all', label: 'Toutes', count: counts.all },
        { key: 'a_traiter', label: 'À évaluer', count: counts.a_traiter },
        { key: 'favorable', label: 'Avis favorable', count: counts.favorable },
        { key: 'defavorable', label: 'Avis défavorable', count: counts.defavorable }
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Espace Enseignant</h1>
                <p className="text-sm text-gray-500">
                    Évaluez les réclamations concernant vos matières
                </p>
            </div>

            {/* Message de succès */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center">
                    <span className="mr-2">✅</span>
                    {successMessage}
                </div>
            )}

            {/* Légende du workflow */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">📋 Votre rôle:</h3>
                <div className="text-sm text-yellow-700">
                    <p>• <strong>Avis Favorable:</strong> La réclamation est fondée. Vous pouvez proposer une note corrigée.</p>
                    <p>• <strong>Avis Défavorable:</strong> La réclamation n'est pas fondée. Aucune modification de note.</p>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterOptions.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setFilter(opt.key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === opt.key
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {opt.label} ({opt.count})
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredClaims.map(claim => (
                    <ClaimCard 
                        key={claim.id} 
                        claim={claim}
                        onAction={handleAction}
                        canProcess={canProcess(claim)}
                        userRole="ENSEIGNANT"
                        showActions={true}
                    />
                ))}
                
                {filteredClaims.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">📭</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation</h3>
                        <p className="text-sm text-gray-500">
                            {filter === 'a_traiter' 
                                ? 'Aucune réclamation à évaluer pour le moment.'
                                : 'Aucune réclamation ne correspond au filtre sélectionné.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}