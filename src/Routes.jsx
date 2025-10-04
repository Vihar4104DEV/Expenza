import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import { ToastProvider } from "components/shared/ToastProvider";
import NotFound from "pages/NotFound";
import LandingPage from './pages/LandingPage';

// Admin Pages
import AdminDashboard from './pages/admin-dashboard';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Employee Pages
import EmployeeDashboard from './pages/employee-dashboard';
import ExpensesPage from './pages/ExpensesPage';
import AddExpensePage from './pages/AddExpensePage';
import EditExpensePage from './pages/employee/EditExpensePage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';

// Manager Pages
import ManagerApprovalDashboard from './pages/manager-approval-dashboard';
import ManagerReportsPage from './pages/ReportsPage';
import TeamManagementPage from './pages/TeamManagementPage';
import TeamExpensesPage from './pages/TeamExpensesPage';

// Shared Pages
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

const Routes = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Admin Routes - Only accessible by admin */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReportsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Employee Routes - Only accessible by employee */}
            <Route 
              path="/employee-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <ExpensesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-expense" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <AddExpensePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expense/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EditExpensePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Manager Routes - Only accessible by manager */}
            <Route 
              path="/manager-approval-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerApprovalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <TeamManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team-expenses" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <TeamExpensesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/reports" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerReportsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Routes - Accessible by all authenticated users */}
            <Route 
              path="/expense/:id" 
              element={
                <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                  <ExpenseDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default Routes;
