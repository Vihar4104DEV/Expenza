import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userRole = localStorage.getItem('userRole');
  const userToken = localStorage.getItem('userToken');

  // Check if user is authenticated
  if (!userToken) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'manager':
        return <Navigate to="/manager-approval-dashboard" replace />;
      case 'employee':
        return <Navigate to="/employee-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
