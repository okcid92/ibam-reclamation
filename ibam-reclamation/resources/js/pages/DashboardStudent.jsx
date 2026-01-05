import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../layouts/Layout';
import { Link } from 'react-router-dom';

export default function DashboardStudent() {
    const [claims, setClaims] = useState([]);
    
    useEffect(() => {
        axios.get('/api/claims').then(res => setClaims(res.data)).catch(console.error);
    }, []);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mes Réclamations</h1>
                    <p className="mt-1 text-sm text-gray-500">Suivez l'état de vos demandes académiques.</p>
                </div>
                <Link to="/student/create-claim" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    + Nouvelle Réclamation
                </Link>
            </div>
            
            <div className="grid gap-6">
                {claims.map(claim => (
                    <div key={claim.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 border border-gray-100">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {claim.subject?.label} <span className="text-gray-400 text-sm font-normal">({claim.subject?.code})</span>
                                    </h3>
                                    <p className="mt-2 max-w-xl text-sm text-gray-500">
                                        {claim.reason}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${claim.status === 'validee' ? 'bg-green-100 text-green-800' :
                                          claim.status === 'rejetee' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {claim.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Mis à jour le {new Date(claim.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {claims.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réclamation</h3>
                        <p className="mt-1 text-sm text-gray-500">Commencez par créer une nouvelle demande.</p>
                        <div className="mt-6">
                            <Link to="/student/create-claim" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Créer une réclamation
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
