 
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: "2rem", color: "#d9534f", textAlign: "center" }}>
        <h3>Access Denied</h3>
        <p>Your current role (<strong>{user.role}</strong>) does not have permission to access this page.</p>
      </div>
    );
  }

  return children;
}