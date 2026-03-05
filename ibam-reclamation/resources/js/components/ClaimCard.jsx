import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const ClaimCard = ({ claim, onAction, canProcess, userRole, showActions = false }) => {
    const [showActionPanel, setShowActionPanel] = useState(false);
    const [comment, setComment] = useState('');
    const [correctedGrade, setCorrectedGrade] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleAction = async (action) => {
        setError('');

        // Règles de validation pour l'enseignant
        if (userRole === 'ENSEIGNANT') {
            if (action === 'approve') {
                const gradeStr = String(correctedGrade ?? '').trim();
                if (gradeStr === '') {
                    setError("La note corrigée est obligatoire pour un avis favorable.");
                    return;
                }
                const grade = Number(gradeStr);
                if (Number.isNaN(grade) || grade < 0 || grade > 20) {
                    setError("La note corrigée doit être un nombre entre 0 et 20.");
                    return;
                }
            }

            if (action === 'reject') {
                if (!comment || comment.trim() === '') {
                    setError("Le commentaire est obligatoire pour un avis défavorable.");
                    return;
                }
            }
        }

        setProcessing(true);
        try {
            await onAction(claim.id, action, comment, correctedGrade);
            setShowActionPanel(false);
            setComment('');
            setCorrectedGrade('');
        } catch (error) {
            console.error('Erreur lors du traitement:', error);
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionLabels = () => {
        switch (userRole) {
            case 'SCOLARITE':
                if (claim.status === 'SOUMISE') {
                    return { approve: 'Recevable → DA', reject: 'Non recevable' };
                }
                if (['VALIDEE', 'NON_VALIDEE'].includes(claim.status)) {
                    return { approve: 'Notifier étudiant', reject: null };
                }
                return { approve: 'Approuver', reject: 'Rejeter' };
            case 'DIRECTEUR_ADJOINT':
                if (claim.status === 'SOUMISE') {
                    return { approve: 'Transmettre au Prof', reject: 'Rejeter' };
                }
                return { approve: 'Transmettre à Scolarité', reject: null };
            case 'ENSEIGNANT':
                return { approve: 'Avis Favorable', reject: 'Avis Défavorable' };
            default:
                return { approve: 'Approuver', reject: 'Rejeter' };
        }
    };

    const actionLabels = getActionLabels();

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {claim.subject_name}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({claim.subject_code})
                            </span>
                        </h3>
                        {claim.student_firstname && (
                            <p className="text-sm text-gray-600 mt-1">
                                Étudiant: {claim.student_firstname} {claim.student_lastname}
                                <span className="ml-2 text-gray-400">INE: {claim.student_ine}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <StatusBadge status={claim.status} />
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            Étape: {claim.current_step || 'Terminé'}
                        </span>
                        <span className="text-xs text-gray-400">
                            {formatDate(claim.created_at)}
                        </span>
                    </div>
                </div>

                <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Motif:</span> {claim.reason}
                    </p>
                    {claim.current_grade && (
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Note actuelle:</span> {claim.current_grade}/20
                            {claim.expected_grade && (
                                <span className="ml-2">→ Espérée: {claim.expected_grade}/20</span>
                            )}
                        </p>
                    )}
                    {claim.corrected_grade && (
                        <p className="text-sm text-green-700 font-medium">
                            ✓ Note corrigée: {claim.corrected_grade}/20
                        </p>
                    )}
                    {claim.decision && (
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                            <span className="font-medium">Décision:</span> {claim.decision}
                        </p>
                    )}
                </div>

                {/* Pièces jointes */}
                {claim.attachments && claim.attachments.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg shadow-inner">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            📎 Pièces jointes ({claim.attachments.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {claim.attachments.map((attachment, index) => (
                                <a
                                    key={attachment.id || index}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                >
                                    {attachment.filetype?.includes('pdf') ? '📄' : '🖼️'} {attachment.filename}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Historique */}
                {claim.history && claim.history.length > 0 && (
                    <div className="mb-4 border-t pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3 ml-1">
                            📜 Historique du traitement:
                        </p>
                        <div className="space-y-3">
                            {claim.history.map((item, idx) => (
                                <div key={idx} className="flex items-start space-x-3 text-sm">
                                    <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-400"></div>
                                    <div className="flex-1 bg-gray-50 p-2 rounded-md border border-gray-100">
                                        <div className="flex justify-between items-center mb-1 text-xs">
                                            <span className="font-semibold text-gray-700">
                                                {item.user_firstname} {item.user_lastname}
                                                <span className="text-gray-400 font-normal ml-1">
                                                    ({item.user_role})
                                                </span>
                                            </span>
                                            <span className="text-gray-400 font-light">
                                                {formatDate(item.created_at)}
                                            </span>
                                        </div>
                                        <div className="text-blue-600 font-medium text-xs mb-1 uppercase tracking-wide">
                                            {item.action}
                                        </div>
                                        {item.comment && (
                                            <p className="text-gray-600 mt-1 border-l-2 border-blue-200 pl-2 text-sm italic">
                                                "{item.comment}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {canProcess && showActions && (
                    <div className="border-t pt-4 mt-4">
                        {!showActionPanel ? (
                            <button
                                onClick={() => {
                                    setError('');
                                    setShowActionPanel(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                🔧 Traiter la demande
                            </button>
                        ) : (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Commentaire / Justification
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Ajoutez votre commentaire..."
                                    />
                                </div>

                                {userRole === 'ENSEIGNANT' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Note corrigée (si avis favorable)
                                        </label>
                                        <input
                                            type="number"
                                            value={correctedGrade}
                                            onChange={(e) => setCorrectedGrade(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            max="20"
                                            step="0.25"
                                            placeholder="Note sur 20"
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleAction('approve')}
                                        disabled={processing}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? '⏳' : '✓'} {actionLabels.approve}
                                    </button>

                                    {actionLabels.reject && (
                                        <button
                                            onClick={() => handleAction('reject')}
                                            disabled={processing}
                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? '⏳' : '✗'} {actionLabels.reject}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            setError('');
                                            setShowActionPanel(false);
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClaimCard;