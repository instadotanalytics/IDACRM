import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminLogin from './components/SuperAdminLogin/SuperAdminLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard/SuperAdminDashboard';

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
        <Route path="/super-admin-login" element={<SuperAdminLogin/>} />
        <Route 
          path="/super-admin-dashboard" 
          element={
            <ProtectedRoute>
              <SuperAdminDashboard/>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/super-admin-login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;