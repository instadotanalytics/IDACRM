import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/super-admin-login" replace />;
  }

  if (user.role !== 'super_admin') {
    return <Navigate to="/super-admin-login" replace />;
  }

  return children;
};

export default ProtectedRoute;