import React from 'react';

const ClaimFilters = ({ currentFilter, onFilterChange, userRole, claimCounts = {} }) => {
    const getFiltersForRole = (role) => {
        const baseFilters = [
            { key: 'all', label: 'Toutes', count: claimCounts.all || 0 },
            { key: 'validee', label: 'Validées', count: claimCounts.validee || 0 },
            { key: 'rejetee', label: 'Rejetées', count: claimCounts.rejetee || 0 }
        ];

        switch (role) {
            case 'SCOLARITE':
                return [
                    ...baseFilters.slice(0, 1),
                    { key: 'my_stage', label: 'À traiter', count: claimCounts.my_stage || 0 },
                    { key: 'en_attente_scolarite', label: 'En attente', count: claimCounts.en_attente_scolarite || 0 },
                    ...baseFilters.slice(1)
                ];
            case 'ENSEIGNANT':
                return [
                    ...baseFilters.slice(0, 1),
                    { key: 'my_stage', label: 'À traiter', count: claimCounts.my_stage || 0 },
                    { key: 'my_subjects', label: 'Mes matières', count: claimCounts.my_subjects || 0 },
                    ...baseFilters.slice(1)
                ];
            case 'DIRECTEUR_ACADEMIQUE':
            case 'DIRECTEUR_ACADEMIQUE_ADJOINT':
                return [
                    ...baseFilters.slice(0, 1),
                    { key: 'my_stage', label: 'À traiter', count: claimCounts.my_stage || 0 },
                    { key: 'en_cours', label: 'En cours', count: claimCounts.en_cours || 0 },
                    ...baseFilters.slice(1)
                ];
            default:
                return baseFilters;
        }
    };

    const filters = getFiltersForRole(userRole);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentFilter === filter.key
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {filter.label}
                        {filter.count > 0 && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                currentFilter === filter.key
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                            }`}>
                                {filter.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ClaimFilters;