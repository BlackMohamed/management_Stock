import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AlertsPage from './pages/alerts/AlertsPage';
import HistoryPage from './pages/history/HistoryPage';
import UsersPage from './pages/admin/UsersPage';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/router/PrivateRoute';
import AdminRoute from './components/router/AdminRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import SparkPage from './pages/spark/SparkPage';

const App: React.FC = () => {
  const { state } = useAuth();
  
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={
        state.isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
      } />
      <Route path="/register" element={
        state.isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />
      } />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="/spark" element={<SparkPage />} />
        <Route path="admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;