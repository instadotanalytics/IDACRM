// App.jsx - FIXED (sessionStorage-aware auth)
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import SuperAdminLogin from "./components/SuperAdminLogin/SuperAdminLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import SuperAdminDashboard from "./components/SuperAdminDashboard/SuperAdminDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard/AdminDashboard";
import SalesDashboard from "./pages/dashboard/SalesDashboard/SalesDashboard";
import HRDashboard from "./pages/dashboard/HRDashboard/HRDashboard";
import TrainerDashboard from "./pages/dashboard/TrainerDashboard/TrainerDashboard";
import CounselorDashboard from "./pages/dashboard/CounselorDashboard/CounselorDashboard";

import { getToken, getUser } from "./services/auth";

const DASHBOARD_MAP = {
  super_admin: "/super-admin-dashboard",
  admin_manager: "/admin-dashboard",
  sales_executive: "/sales-dashboard",
  hr_executive: "/hr-dashboard",
  trainer: "/trainer-dashboard",
  counselor: "/counselor-dashboard",
};

const RoleBasedRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState("/login");

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user?.role) {
      setRedirectPath("/login");
    } else {
      setRedirectPath(DASHBOARD_MAP[user.role] || "/login");
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0f172a",
          color: "#fff",
          fontSize: 16,
        }}
      >
        Loading…
      </div>
    );
  }

  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <Router>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: "#363636", color: "#fff" },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/super-admin-login" element={<SuperAdminLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected */}
          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin_manager", "super_admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "sales_executive",
                  "admin_manager",
                  "super_admin",
                ]}
              >
                <SalesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["hr_executive", "admin_manager", "super_admin"]}
              >
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["trainer", "admin_manager", "super_admin"]}
              >
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counselor-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["counselor", "admin_manager", "super_admin"]}
              >
                <CounselorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;
