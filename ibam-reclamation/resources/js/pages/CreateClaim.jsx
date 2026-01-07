import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';

export default function CreateClaim() {
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [reason, setReason] = useState('');
    const [currentGrade, setCurrentGrade] = useState('');
    const [expectedGrade, setExpectedGrade] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('/api/subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des matières:', error);
            setError('Impossible de charger les matières.');
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            const maxSize = 5 * 1024 * 1024;
            return validTypes.includes(file.type) && file.size <= maxSize;
        });
        
        if (validFiles.length !== selectedFiles.length) {
            setError('Certains fichiers ne sont pas valides. Seuls les PDF et images (max 5MB) sont acceptés.');
        } else {
            setError('');
        }
        
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 Début de la soumission');
        
        // Validation explicite
        if (!subjectId) {
            setError('Veuillez sélectionner une matière.');
            return;
        }
        if (!reason.trim()) {
            setError('Veuillez saisir le motif de la réclamation.');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('subject_id', subjectId);
        formData.append('reason', reason);
        if (currentGrade) formData.append('current_grade', currentGrade);
        if (expectedGrade) formData.append('expected_grade', expectedGrade);
        
        files.forEach((file, index) => {
            formData.append(`documents[${index}]`, file);
        });

        console.log('📝 Données à envoyer:', {
            subject_id: subjectId,
            reason: reason,
            current_grade: currentGrade,
            expected_grade: expectedGrade,
            files_count: files.length
        });

        try {
            console.log('📡 Envoi de la requête...');
            const response = await axios.post('/api/claims', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('✅ Réponse reçue:', response.data);
            setSuccess('Réclamation soumise avec succès!');
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 2000);
        } catch (err) {
            console.error('❌ Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la réclamation.');
        } finally {
            setLoading(false);
            console.log('🏁 Fin de la soumission');
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-6 inline-flex items-center text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                    ← Retour au tableau de bord
                </button>
                
                <div className="bg-white shadow-lg rounded-lg border border-gray-200">
                    <div className="px-8 py-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">📝 Nouvelle Réclamation</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Bonjour {user?.firstname}, remplissez ce formulaire pour soumettre votre réclamation académique.
                        </p>
                    </div>
                    
                    <div className="px-8 py-6">
                        {error && (
                            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
                                ❌ {error}
                            </div>
                        )}
                        
                        {success && (
                            <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg">
                                ✅ {success}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Matière concernée *
                                    </label>
                                    <select 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={subjectId}
                                        onChange={e => setSubjectId(e.target.value)}
                                        required
                                    >
                                        <option value="">Sélectionnez une matière...</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.label} ({subject.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Note actuelle
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={currentGrade}
                                        onChange={e => setCurrentGrade(e.target.value)}
                                        min="0"
                                        max="20"
                                        step="0.25"
                                        placeholder="Ex: 12.5"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Note espérée
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={expectedGrade}
                                        onChange={e => setExpectedGrade(e.target.value)}
                                        min="0"
                                        max="20"
                                        step="0.25"
                                        placeholder="Ex: 15"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motif de la réclamation *
                                </label>
                                <textarea 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    required
                                    rows="5"
                                    placeholder="Décrivez en détail les raisons de votre réclamation (erreur de correction, problème de notation, etc.)..."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Soyez précis et détaillé pour faciliter le traitement de votre demande.
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pièces justificatives
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <input 
                                        type="file" 
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <div className="text-gray-400 mb-2">📎</div>
                                        <p className="text-sm text-gray-600">
                                            Cliquez pour ajouter des fichiers ou glissez-déposez
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF, JPG, PNG (max 5MB par fichier)
                                        </p>
                                    </label>
                                </div>
                                
                                {files.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Fichiers sélectionnés:</p>
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-600">📄 {file.name}</span>
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    ✕ Supprimer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Processus de traitement</h3>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>1️⃣ <strong>Scolarité:</strong> Vérifie la recevabilité (fichiers, délais)</li>
                                    <li>2️⃣ <strong>Directeur Adjoint:</strong> Transmet à l'enseignant concerné</li>
                                    <li>3️⃣ <strong>Enseignant:</strong> Analyse et donne son avis (favorable/défavorable)</li>
                                    <li>4️⃣ <strong>Notification:</strong> Vous serez informé du résultat final</li>
                                </ul>
                            </div>
                            
                            <div className="flex space-x-4 pt-6">
                                <button 
                                    type="button"
                                    onClick={() => navigate('/student/dashboard')}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 border border-transparent text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Envoi en cours...
                                        </span>
                                    ) : (
                                        '📤 Soumettre la réclamation'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}