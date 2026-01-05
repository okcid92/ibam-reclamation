import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';

export default function CreateClaim() {
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [reason, setReason] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/subjects').then(res => setSubjects(res.data)).catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('subject_id', subjectId);
        formData.append('reason', reason);
        if (file) {
            formData.append('documents[]', file);
        }

        try {
            await axios.post('/api/claims', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/student/dashboard');
        } catch (err) {
            setError('Erreur lors de l\'envoi de la réclamation.');
            console.error(err);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-4 text-gray-500 hover:text-gray-700 font-medium flex items-center">
                    &larr; Retour
                </button>
                <div className="bg-white shadow rounded-lg p-8 border border-gray-100">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Nouvelle Réclamation</h1>
                    {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Matière concernée</label>
                            <select 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                value={subjectId}
                                onChange={e => setSubjectId(e.target.value)}
                                required
                            >
                                <option value="">Choisir une matière...</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.label} ({s.code})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motif de la réclamation</label>
                            <textarea 
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2 h-32"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                required
                                placeholder="Décrivez votre problème en détail..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pièce justificative (PDF, Image)</label>
                            <input 
                                type="file" 
                                onChange={e => setFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                            />
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                Soumettre la demande
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
