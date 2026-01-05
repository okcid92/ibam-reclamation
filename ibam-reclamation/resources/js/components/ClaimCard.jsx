import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const ClaimCard = ({ claim, onAction, canProcess, userRole, showActions = false }) => {
    const [showActionPanel, setShowActionPanel] = useState(false);
    const [comment, setComment] = useState('');
    const [correctedGrade, setCorrectedGrade] = useState('');

    const handleAction = (action) => {
        onAction(claim.id, action, comment, correctedGrade);
        setShowActionPanel(false);
        setComment('');
        setCorrectedGrade('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {claim.subject?.label}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({claim.subject?.code})
                            </span>
                        </h3>
                        {claim.student && (
                            <p className="text-sm text-gray-600 mt-1">
                                Étudiant: {claim.student.user?.firstname} {claim.student.user?.lastname}
                                <span className="ml-2 text-gray-400">INE: {claim.student.ine}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <StatusBadge status={claim.status} />
                        <span className="text-xs text-gray-400">
                            {formatDate(claim.updated_at)}
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Motif:</span> {claim.reason}
                    </p>
                    {claim.current_grade && (
                        <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Note actuelle:</span> {claim.current_grade}/20
                        </p>
                    )}
                </div>

                {claim.attachments && claim.attachments.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Pièces jointes:</p>
                        <div className="flex flex-wrap gap-2">
                            {claim.attachments.map((attachment, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    📎 {attachment.filename}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {canProcess && showActions && (
                    <div className="border-t pt-4 mt-4">
                        {!showActionPanel ? (
                            <button
                                onClick={() => setShowActionPanel(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Traiter la demande
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Commentaire
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
                                            Note corrigée (optionnel)
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

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleAction('approve')}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Approuver
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Rejeter
                                    </button>
                                    <button
                                        onClick={() => setShowActionPanel(false)}
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