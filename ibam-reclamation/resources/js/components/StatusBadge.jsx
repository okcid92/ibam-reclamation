import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
    const statusConfig = {
        'soumise': { color: 'bg-blue-100 text-blue-800', label: 'Soumise' },
        'en_cours': { color: 'bg-yellow-100 text-yellow-800', label: 'En cours' },
        'validee': { color: 'bg-green-100 text-green-800', label: 'Validée' },
        'rejetee': { color: 'bg-red-100 text-red-800', label: 'Rejetée' },
        'en_attente_scolarite': { color: 'bg-orange-100 text-orange-800', label: 'En attente scolarité' },
        'en_attente_directeur': { color: 'bg-purple-100 text-purple-800', label: 'En attente directeur' },
        'en_attente_enseignant': { color: 'bg-indigo-100 text-indigo-800', label: 'En attente enseignant' },
        'en_attente_da_adjoint': { color: 'bg-pink-100 text-pink-800', label: 'En attente DA adjoint' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

    return (
        <span className={`inline-flex items-center ${sizeClass} rounded-full font-medium ${config.color}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;