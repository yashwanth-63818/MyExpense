import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AmountReceived from './pages/AmountReceived';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import AppPrivacy from './pages/AppPrivacy';
import AppTerms from './pages/AppTerms';

// Helper component to redirect authenticated users away from public routes
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Let ProtectedRoute handle loading or just show nothing temporarily
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (Auth) */}
          <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

          {/* Pure Public Routes */}
          <Route path="/privacy-policy" element={<AppPrivacy />} />
          <Route path="/terms" element={<AppTerms />} />

          {/* Main App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/amount-received" element={<AmountReceived />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-500 mb-8">Page not found.</p>
                <a href="/" className="text-blue-600 hover:underline">Go back home</a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
