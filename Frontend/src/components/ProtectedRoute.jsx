import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Verify authentication
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            
            console.log('ProtectedRoute - Verifying auth...');
            console.log('Token exists:', !!token);
            console.log('UserData exists:', !!userData);
            
            if (!token || !userData) {
                console.log('No token or user data, authentication failed');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }
            
            try {
                const user = JSON.parse(userData);
                console.log('User role:', user.role);
                
                // Check if user has required role
                if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                    console.log(`Role ${user.role} not allowed. Allowed: ${allowedRoles}`);
                    setIsAuthenticated(false);
                } else {
                    console.log('Authentication successful');
                    setIsAuthenticated(true);
                    setUserRole(user.role);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                setIsAuthenticated(false);
            }
            
            setIsLoading(false);
        };
        
        verifyAuth();
    }, [allowedRoles]);

    // Show loading state while checking authentication
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
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(46, 244, 255, 0.2)',
                        borderTopColor: '#2ef4ff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p>Verifying authentication...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/super-admin-login" replace />;
    }

    // Allow access
    return children;
};

export default ProtectedRoute;