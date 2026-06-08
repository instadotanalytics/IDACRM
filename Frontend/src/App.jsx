import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import SuperAdminLogin from './components/SuperAdminLogin/SuperAdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import SuperAdminDashboard from './components/SuperAdminDashboard/SuperAdminDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard/AdminDashboard';
import SalesDashboard from './pages/dashboard/SalesDashboard/SalesDashboard';
import HRDashboard from './pages/dashboard/HRDashboard/HRDashboard';
import TrainerDashboard from './pages/dashboard/TrainerDashboard/TrainerDashboard';
import CounselorDashboard from './pages/dashboard/CounselorDashboard/CounselorDashboard';

// Role-based redirect helper with loading state
const RoleBasedRedirect = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            // ✅ No token → go to login
            setRedirectPath('/login');
            setIsLoading(false);
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            
            // ✅ Role based redirect
            switch (user.role) {
                case 'super_admin':
                    setRedirectPath('/super-admin-dashboard');
                    break;
                case 'admin_manager':
                    setRedirectPath('/admin-dashboard');
                    break;
                case 'sales_executive':
                    setRedirectPath('/sales-dashboard');
                    break;
                case 'hr_executive':
                    setRedirectPath('/hr-dashboard');
                    break;
                case 'trainer':
                    setRedirectPath('/trainer-dashboard');
                    break;
                case 'counselor':
                    setRedirectPath('/counselor-dashboard');
                    break;
                default:
                    setRedirectPath('/login');
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            setRedirectPath('/login');
        }
        
        setIsLoading(false);
    }, []);
    
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0f172a',
                color: '#2ef4ff'
            }}>
                <div>Loading...</div>
            </div>
        );
    }
    
    return <Navigate to={redirectPath} replace />;
};

function App() {
    return (
        <Router>
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    }
                }}
            />
            <Routes>
                {/* ✅ Public Auth Routes */}
                {/* Super Admin - Separate login page */}
                <Route path="/super-admin-login" element={<SuperAdminLogin />} />
                
                {/* Other users - Common login page */}
                <Route path="/login" element={<Login />} />
                
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* ✅ Protected Dashboards - Role Based */}
                <Route 
                    path="/super-admin-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['super_admin']}>
                            <SuperAdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/admin-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['admin_manager', 'super_admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/sales-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['sales_executive', 'admin_manager', 'super_admin']}>
                            <SalesDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/hr-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_executive', 'admin_manager', 'super_admin']}>
                            <HRDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/trainer-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['trainer', 'admin_manager', 'super_admin']}>
                            <TrainerDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/counselor-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['counselor', 'admin_manager', 'super_admin']}>
                            <CounselorDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* ✅ Default Route - Role based redirect */}
                <Route path="/" element={<RoleBasedRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;