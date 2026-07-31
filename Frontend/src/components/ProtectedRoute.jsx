// components/ProtectedRoute.jsx - FIXED (sessionStorage-aware)
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser, clearAuth } from "../services/auth";

const getLoginPageForRole = (role) =>
  role === "super_admin" ? "/super-admin-login" : "/login";

const getLoginPageForPath = (pathname) =>
  pathname === "/super-admin-dashboard" ? "/super-admin-login" : "/login";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  const token = getToken();

  if (!token) {
    return (
      <Navigate
        to={getLoginPageForPath(location.pathname)}
        state={{ from: location }}
        replace
      />
    );
  }

  let user = null;
  try {
    user = getUser();
  } catch {
    clearAuth();
    return <Navigate to={getLoginPageForPath(location.pathname)} replace />;
  }

  if (!user || !user.role) {
    clearAuth();
    return <Navigate to={getLoginPageForPath(location.pathname)} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Wrong role for this route — send to their correct login page
    return <Navigate to={getLoginPageForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
