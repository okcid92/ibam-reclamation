import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';

export default function DashboardStaff() {
    const [claims, setClaims] = useState([]);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();
    
    useEffect(() => {
        axios.get('/api/claims').then(res => setClaims(res.data)).catch(console.error);
    }, []);

    const handleAction = async (claimId, action, comment = '', correctedGrade = null) => {
        try {
            const payload = { action, comment };
            if (correctedGrade) payload.corrected_grade = correctedGrade;
            
            await axios.put(`/api/claims/${claimId}`, payload);
            // Recharger les réclamations
            const res = await axios.get('/api/claims');
            setClaims(res.data);
        } catch (error) {
            alert('Erreur lors du traitement: ' + error.response?.data?.message);
        }
    };

    const filteredClaims = claims.filter(claim => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['soumise', 'en_cours'].includes(claim.status);
        if (filter === 'my_stage') {
            const stageMap = {
                'SCOLARITE': 'SCOLARITE',
                'ENSEIGNANT': 'ENSEIGNANT', 
                'DIRECTEUR_ACADEMIQUE': 'DIRECTEUR_ACADEMIQUE'
            };
            return claim.current_stage === stageMap[user.role];
        }
        return claim.status === filter;
    });

    const getStatusColor = (status) => {
        const colors = {
            'soumise': 'bg-blue-100 text-blue-800',
            'en_cours': 'bg-yellow-100 text-yellow-800',
            'validee': 'bg-green-100 text-green-800',
            'rejetee': 'bg-red-100 text-red-800',
            'cloturee': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const canProcess = (claim) => {
        const roleStageMap = {
            'SCOLARITE': 'SCOLARITE',
            'ENSEIGNANT': 'ENSEIGNANT',
            'DIRECTEUR_ACADEMIQUE': 'DIRECTEUR_ACADEMIQUE'
        };
        return claim.current_stage === roleStageMap[user.role] && 
               ['soumise', 'en_cours'].includes(claim.status);
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Réclamations</h1>
                <p className="mt-1 text-sm text-gray-500">Traitement des demandes académiques - {user.role}</p>
            </div>
            
            {/* Filtres */}
            <div className="mb-6 flex space-x-4">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Toutes</button>
                <button onClick={() => setFilter('my_stage')} className={`px-4 py-2 rounded ${filter === 'my_stage' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>À traiter</button>
                <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>En cours</button>
                <button onClick={() => setFilter('validee')} className={`px-4 py-2 rounded ${filter === 'validee' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Validées</button>
                <button onClick={() => setFilter('rejetee')} className={`px-4 py-2 rounded ${filter === 'rejetee' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Rejetées</button>
            </div>
            
            <div className="space-y-4">
                {filteredClaims.map(claim => (
                    <ClaimCard 
                        key={claim.id} 
                        claim={claim} 
                        onAction={handleAction}
                        canProcess={canProcess(claim)}
                        userRole={user.role}
                        getStatusColor={getStatusColor}
                    />
                ))}
                {filteredClaims.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">Aucune réclamation trouvée pour ce filtre.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

function ClaimCard({ claim, onAction, canProcess, userRole, getStatusColor }) {
    const [showActions, setShowActions] = useState(false);
    const [comment, setComment] = useState('');
    const [correctedGrade, setCorrectedGrade] = useState('');

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {claim.subject?.label} ({claim.subject?.code})
                    </h3>
                    <p className="text-sm text-gray-600">
                        Étudiant: {claim.student?.user?.firstname} {claim.student?.user?.lastname} - INE: {claim.student?.ine}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Déposée le: {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                        Étape: {claim.current_stage}
                    </span>
                </div>
            </div>
            
            <div className="mb-4">
                <p className="text-sm text-gray-700">
                    <strong>Motif:</strong> {claim.reason}
                </p>
                {claim.initial_grade && (
                    <p className="text-sm text-gray-700 mt-1">
                        <strong>Note initiale:</strong> {claim.initial_grade}/20
                    </p>
                )}
                {claim.corrected_grade && (
                    <p className="text-sm text-gray-700 mt-1">
                        <strong>Note corrigée:</strong> {claim.corrected_grade}/20
                    </p>
                )}
            </div>
            
            {canProcess && (
                <div className="border-t pt-4">
                    {!showActions ? (
                        <button 
                            onClick={() => setShowActions(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Traiter cette réclamation
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                placeholder="Commentaire (optionnel)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows="2"
                            />
                            
                            {userRole === 'ENSEIGNANT' && (
                                <input
                                    type="number"
                                    placeholder="Note corrigée (optionnel)"
                                    value={correctedGrade}
                                    onChange={(e) => setCorrectedGrade(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    min="0"
                                    max="20"
                                    step="0.25"
                                />
                            )}
                            
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => onAction(claim.id, 'approve', comment, correctedGrade)}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    {userRole === 'DIRECTEUR_ACADEMIQUE' ? 'Valider' : 'Approuver'}
                                </button>
                                <button 
                                    onClick={() => onAction(claim.id, 'reject', comment)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Rejeter
                                </button>
                                <button 
                                    onClick={() => setShowActions(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}