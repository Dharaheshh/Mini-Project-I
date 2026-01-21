import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-bold">
              🏛️ Damage Reporting System
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-blue-200">
                Admin Dashboard
              </Link>
            )}
            {user?.role === 'user' && (
              <Link to="/dashboard" className="hover:text-blue-200">
                My Complaints
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

