import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';

export default function DashboardStaff() {
    const [claims, setClaims] = useState([]);

    useEffect(() => {
        axios.get('/api/claims').then(res => setClaims(res.data)).catch(console.error);
    }, []);

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Réclamations</h1>
                <p className="mt-1 text-sm text-gray-500">Gérez les demandes soumises par les étudiants.</p>
            </div>
            
            <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etudiant</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matière</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etape Actualle</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {claims.map(claim => (
                            <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{claim.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="font-medium text-gray-900">{claim.student?.user?.lastname} {claim.student?.user?.firstname}</div>
                                    <div className="text-xs text-gray-400">{claim.student?.ine}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.subject?.label}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${claim.status === 'validee' ? 'bg-green-100 text-green-800' :
                                          claim.status === 'rejetee' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'}`}>
                                        {claim.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.current_stage}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 font-semibold">Traiter</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {claims.length === 0 && (
                    <div className="text-center py-10 text-gray-500">Aucune réclamation à afficher.</div>
                )}
            </div>
        </Layout>
    );
}
