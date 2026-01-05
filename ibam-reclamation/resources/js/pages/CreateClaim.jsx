import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateClaim() {
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [reason, setReason] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch subjects (needs an API endpoint, we might need to add it or hardcode for now if not ready)
        // For now let's assume we have an endpoint or hardcode a few if the endpoint isn't made
        // We really should have an endpoint: Route::get('/subjects', ...) in api.php
        // I will add that endpoint instruction or just mock it if needed but better to be real.
        // Let's assume /api/subjects exists (I'll add it).
        axios.get('/api/subjects').then(res => setSubjects(res.data)).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('subject_id', subjectId);
        formData.append('reason', reason);
        if (file) {
            formData.append('documents[]', file); // Note: Controller expects array 'documents'
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
        <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded">
            <h1 className="text-2xl font-bold mb-6">Nouvelle Réclamation</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700">Matière</label>
                    <select 
                        className="w-full border p-2 rounded"
                        value={subjectId}
                        onChange={e => setSubjectId(e.target.value)}
                        required
                    >
                        <option value="">Choisir une matière</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.label} ({s.code})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700">Motif de la réclamation</label>
                    <textarea 
                        className="w-full border p-2 rounded h-32"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                        placeholder="Expliquez votre problème..."
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Pièce jointe (facultatif)</label>
                    <input 
                        type="file" 
                        onChange={e => setFile(e.target.files[0])}
                        className="w-full"
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Soumettre
                </button>
            </form>
        </div>
    );
}
