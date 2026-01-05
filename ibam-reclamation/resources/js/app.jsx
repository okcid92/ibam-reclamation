import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardStudent from './pages/DashboardStudent';
import DashboardStaff from './pages/DashboardStaff';
import CreateClaim from './pages/CreateClaim';

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Chargement...</div>;
    if (!user) return <Navigate to="/login" />;
    
    // Simple role check logic
    if (role === 'ETUDIANT' && user.role !== 'ETUDIANT') return <Navigate to="/staff/dashboard" />;
    if (role === 'STAFF' && user.role === 'ETUDIANT') return <Navigate to="/student/dashboard" />;
    
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />
                
                <Route path="/student/dashboard" element={
                    <PrivateRoute role="ETUDIANT">
                        <DashboardStudent />
                    </PrivateRoute>
                } />

                <Route path="/student/create-claim" element={
                    <PrivateRoute role="ETUDIANT">
                        <CreateClaim />
                    </PrivateRoute>
                } />
                
                <Route path="/staff/dashboard" element={
                    <PrivateRoute role="STAFF">
                        <DashboardStaff />
                    </PrivateRoute>
                } />
            </Routes>
        </AuthProvider>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    );
}
