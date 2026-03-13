import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Bell, LogOut, Shield, User, ChevronDown, LayoutDashboard, Wrench } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'supervisor' ? '/supervisor' : '/dashboard';
  const dashboardLabel = user?.role === 'admin' ? 'Admin Panel' : user?.role === 'supervisor' ? 'Operations' : 'My Reports';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link to={dashboardLink} className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-br from-slate-800 to-cyan-700 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-lg font-black text-slate-800 hidden sm:inline">
                Campus<span className="text-cyan-600">DR</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to={dashboardLink}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <LayoutDashboard size={16} />
                {dashboardLabel}
              </Link>
              {user?.role === 'supervisor' && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                  <Wrench size={14} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 capitalize">{user?.department}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Notifications & User */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                    <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">Live</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <div className="p-4 text-center text-slate-400 text-sm">
                      <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                      No new notifications
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                    <Link to={dashboardLink} className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                      View all activity →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</span>
                  <span className="text-[11px] text-slate-400 capitalize">{user?.role}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to={dashboardLink}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
