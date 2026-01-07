import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';
import ClaimCard from '../components/ClaimCard';
import { useAuth } from '../context/AuthContext';

export default function DashboardAssistantDirector() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('a_transmettre');
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/claims');
            setClaims(response.data);
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
            
            const response = await axios.put(`/api/claims/${claimId}`, payload);
            setSuccessMessage(response.data.message || 'Action effectuée avec succès');
            await fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
        }
    };

    const getFilteredClaims = () => {
        switch (filter) {
            case 'a_transmettre':
                // Réclamations à l'étape DA avec statut SOUMISE (venant de Scolarité)
                return claims.filter(claim => 
                    claim.current_step === 'DIRECTEUR_ADJOINT' && claim.status === 'SOUMISE'
                );
            case 'avis_recu':
                // Réclamations revenues de l'Enseignant (avec avis)
                return claims.filter(claim => 
                    claim.current_step === 'DIRECTEUR_ADJOINT' && 
                    ['VALIDEE', 'NON_VALIDEE'].includes(claim.status)
                );
            case 'transmises':
                // Réclamations actuellement chez l'Enseignant
                return claims.filter(claim => claim.current_step === 'ENSEIGNANT');
            case 'terminees':
                return claims.filter(claim => claim.status === 'TERMINEE');
            case 'rejetees':
                return claims.filter(claim => claim.status === 'REJETEE');
            default:
                return claims;
        }
    };

    const canProcess = (claim) => {
        return claim.current_step === 'DIRECTEUR_ADJOINT';
    };

    const getClaimCounts = () => {
        const aTransmettre = claims.filter(claim => 
            claim.current_step === 'DIRECTEUR_ADJOINT' && claim.status === 'SOUMISE'
        ).length;
        const avisRecu = claims.filter(claim => 
            claim.current_step === 'DIRECTEUR_ADJOINT' && 
            ['VALIDEE', 'NON_VALIDEE'].includes(claim.status)
        ).length;
        
        return {
            all: claims.length,
            a_transmettre: aTransmettre,
            avis_recu: avisRecu,
            transmises: claims.filter(claim => claim.current_step === 'ENSEIGNANT').length,
            terminees: claims.filter(claim => claim.status === 'TERMINEE').length,
            rejetees: claims.filter(claim => claim.status === 'REJETEE').length
        };
    };

    const filteredClaims = getFilteredClaims();
    const counts = getClaimCounts();

    const filterOptions = [
        { key: 'all', label: 'Toutes', count: counts.all },
        { key: 'a_transmettre', label: 'À transmettre', count: counts.a_transmettre },
        { key: 'transmises', label: 'Transmises (Prof)', count: counts.transmises },
        { key: 'avis_recu', label: 'Avis reçu → Scolarité', count: counts.avis_recu },
        { key: 'terminees', label: 'Terminées', count: counts.terminees },
        { key: 'rejetees', label: 'Rejetées', count: counts.rejetees }
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 Directeur Adjoint</h1>
                <p className="text-sm text-gray-500">
                    Transmission des réclamations aux enseignants et retour à la scolarité
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
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">📋 Workflow DA:</h3>
                <div className="text-sm text-purple-700 flex flex-wrap gap-4">
                    <span>1️⃣ <strong>Réception:</strong> Dossier vérifié par Scolarité</span>
                    <span>2️⃣ <strong>Transmission:</strong> Envoyer à l'Enseignant concerné</span>
                    <span>3️⃣ <strong>Retour:</strong> Avis reçu → Retransmettre à Scolarité</span>
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
                                ? 'bg-purple-600 text-white'
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
                        userRole="DIRECTEUR_ADJOINT"
                        showActions={true}
                    />
                ))}
                
                {filteredClaims.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">📭</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation</h3>
                        <p className="text-sm text-gray-500">
                            Aucune réclamation ne correspond au filtre sélectionné.
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}