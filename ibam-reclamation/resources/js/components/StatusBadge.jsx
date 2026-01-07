import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
    const statusConfig = {
        'SOUMISE': { color: 'bg-blue-100 text-blue-800', label: 'Soumise' },
        'REJETEE': { color: 'bg-red-100 text-red-800', label: 'Rejetée' },
        'VALIDEE': { color: 'bg-green-100 text-green-800', label: 'Validée' },
        'NON_VALIDEE': { color: 'bg-orange-100 text-orange-800', label: 'Non validée' },
        'TERMINEE': { color: 'bg-gray-100 text-gray-800', label: 'Terminée' }
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