import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardStudent from './pages/DashboardStudent';
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardScolarite from './pages/DashboardScolarite';
import DashboardAssistantDirector from './pages/DashboardAssistantDirector';
import CreateClaim from './pages/CreateClaim';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    if (!user) return <Navigate to="/login" />;
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getDefaultRoute(user.role)} />;
    }
    
    return children;
};

const getDefaultRoute = (role) => {
    switch (role) {
        case 'ETUDIANT':
            return '/student/dashboard';
        case 'ENSEIGNANT':
            return '/teacher/dashboard';
        case 'SCOLARITE':
            return '/scolarite/dashboard';
        case 'DIRECTEUR_ADJOINT':
            return '/da/dashboard';
        default:
            return '/login';
    }
};

const RedirectToRole = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <Navigate to={getDefaultRoute(user.role)} />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RedirectToRole />} />
                
                <Route path="/student/dashboard" element={
                    <PrivateRoute allowedRoles={['ETUDIANT']}>
                        <DashboardStudent />
                    </PrivateRoute>
                } />
                <Route path="/student/create-claim" element={
                    <PrivateRoute allowedRoles={['ETUDIANT']}>
                        <CreateClaim />
                    </PrivateRoute>
                } />
                
                <Route path="/teacher/dashboard" element={
                    <PrivateRoute allowedRoles={['ENSEIGNANT']}>
                        <DashboardTeacher />
                    </PrivateRoute>
                } />
                
                <Route path="/scolarite/dashboard" element={
                    <PrivateRoute allowedRoles={['SCOLARITE']}>
                        <DashboardScolarite />
                    </PrivateRoute>
                } />
                
                <Route path="/da/dashboard" element={
                    <PrivateRoute allowedRoles={['DIRECTEUR_ADJOINT']}>
                        <DashboardAssistantDirector />
                    </PrivateRoute>
                } />
                
                {/* Redirect old routes */}
                <Route path="/director/dashboard" element={<Navigate to="/da/dashboard" />} />
                <Route path="/assistant-director/dashboard" element={<Navigate to="/da/dashboard" />} />
                
                <Route path="*" element={<RedirectToRole />} />
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