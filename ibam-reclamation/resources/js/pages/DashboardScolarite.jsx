import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';
import ClaimCard from '../components/ClaimCard';
import { useAuth } from '../context/AuthContext';

export default function DashboardScolarite() {
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
            if (correctedGrade) payload.corrected_grade = correctedGrade;
            
            const response = await axios.put(`/api/claims/${claimId}`, payload);
            setSuccessMessage(response.data.message || 'Action effectuée avec succès');
            
            // Recharger les données
            await fetchData();

            // Effacer le message après 3 secondes
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
        }
    };

    const getFilteredClaims = () => {
        switch (filter) {
            case 'a_traiter':
                // Réclamations à l'étape SCOLARITE
                return claims.filter(claim => claim.current_step === 'SCOLARITE');
            case 'en_cours':
                // Réclamations en cours (pas encore terminées ni rejetées)
                return claims.filter(claim => 
                    claim.status === 'SOUMISE' && claim.current_step !== 'SCOLARITE'
                );
            case 'a_notifier':
                // Réclamations revenues du DA avec avis enseignant
                return claims.filter(claim => 
                    claim.current_step === 'SCOLARITE' && 
                    ['VALIDEE', 'NON_VALIDEE'].includes(claim.status)
                );
            case 'terminees':
                return claims.filter(claim => claim.status === 'TERMINEE');
            case 'rejetees':
                return claims.filter(claim => claim.status === 'REJETEE');
            default:
                return claims;
        }
    };

    const canProcess = (claim) => {
        return claim.current_step === 'SCOLARITE';
    };

    const getClaimCounts = () => {
        const aTraiter = claims.filter(claim => 
            claim.current_step === 'SCOLARITE' && claim.status === 'SOUMISE'
        ).length;
        const aNotifier = claims.filter(claim => 
            claim.current_step === 'SCOLARITE' && ['VALIDEE', 'NON_VALIDEE'].includes(claim.status)
        ).length;
        const enCours = claims.filter(claim => 
            claim.status === 'SOUMISE' && claim.current_step !== 'SCOLARITE'
        ).length;
        
        return {
            all: claims.length,
            a_traiter: aTraiter,
            a_notifier: aNotifier,
            en_cours: enCours,
            terminees: claims.filter(claim => claim.status === 'TERMINEE').length,
            rejetees: claims.filter(claim => claim.status === 'REJETEE').length
        };
    };

    const filteredClaims = getFilteredClaims();
    const counts = getClaimCounts();

    const filterOptions = [
        { key: 'all', label: 'Toutes', count: counts.all, color: 'blue' },
        { key: 'a_traiter', label: 'À vérifier', count: counts.a_traiter, color: 'orange' },
        { key: 'a_notifier', label: 'À notifier', count: counts.a_notifier, color: 'purple' },
        { key: 'en_cours', label: 'En cours', count: counts.en_cours, color: 'yellow' },
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🏫 Gestion Scolarité</h1>
                <p className="text-sm text-gray-500">
                    Réception, vérification des fichiers et notification des étudiants
                </p>
            </div>

            {/* Message de succès */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center">
                    <span className="mr-2">✅</span>
                    {successMessage}
                </div>
            )}

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                {filterOptions.map(opt => (
                    <div 
                        key={opt.key}
                        onClick={() => setFilter(opt.key)}
                        className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                            filter === opt.key 
                                ? `border-${opt.color}-500 bg-${opt.color}-50` 
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

            {/* Légende du workflow */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">📋 Workflow Scolarité:</h3>
                <div className="text-sm text-blue-700 flex flex-wrap gap-4">
                    <span>1️⃣ <strong>À vérifier:</strong> Vérifier fichiers → Approuver/Rejeter</span>
                    <span>2️⃣ <strong>En cours:</strong> Chez DA ou Enseignant</span>
                    <span>3️⃣ <strong>À notifier:</strong> Avis enseignant reçu → Notifier étudiant</span>
                </div>
            </div>

            <div className="space-y-4">
                {filteredClaims.map(claim => (
                    <ClaimCard 
                        key={claim.id} 
                        claim={claim}
                        onAction={handleAction}
                        canProcess={canProcess(claim)}
                        userRole="SCOLARITE"
                        showActions={true}
                    />
                ))}
                
                {filteredClaims.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">📭</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation</h3>
                        <p className="text-sm text-gray-500">
                            Aucune réclamation ne correspond au filtre "{filterOptions.find(f => f.key === filter)?.label}".
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}