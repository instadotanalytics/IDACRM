import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('ProtectedRoute - Checking auth...');
    console.log('Token exists:', !!token);
    console.log('UserData exists:', !!userData);

    if (!token || !userData) {
      setRedirectPath('/login');
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      console.log('User role:', user.role);

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log('Role not allowed, redirecting to login');
        setAuthenticated(false);
        setRedirectPath('/login');
      } else {
        setAuthenticated(true);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setRedirectPath('/login');
      setAuthenticated(false);
    }

    setLoading(false);
  }, [allowedRoles]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '18px',
        background: '#0f172a',
        color: '#2ef4ff'
      }}>
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;