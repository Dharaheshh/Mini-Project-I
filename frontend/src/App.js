import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

import Settings from './pages/Settings';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
    <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
    <p className="text-xl text-slate-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
    <a href="/" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
      Go Home
    </a>
  </div>
);

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Register />}
        />

        {/* Protected Routes wrapped in Layout */}
        <Route
          path="/dashboard"
          element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user && user.role === 'admin' ? <Layout><AdminDashboard /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={user ? <Layout><Settings /></Layout> : <Navigate to="/login" />}
        />

        {/* Catch-all */}
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

