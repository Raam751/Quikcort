import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CreateCase from './pages/CreateCase';
import CaseDetails from './pages/CaseDetails';
import JoinCase from './pages/JoinCase';
import Profile from './pages/Profile';
import CasesPage from './pages/CasesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/case/join/:token" element={<JoinCase />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/cases" element={
              <ProtectedRoute>
                <CasesPage />
              </ProtectedRoute>
            } />
            <Route path="/create-case" element={
              <ProtectedRoute>
                <CreateCase />
              </ProtectedRoute>
            } />
            <Route path="/case/:caseId" element={
              <ProtectedRoute>
                <CaseDetails />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
