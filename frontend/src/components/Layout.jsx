import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User
} from 'lucide-react';
import { Button } from './ui/Button';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import NotificationDropdown from './NotificationDropdown';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link to={path}>
        <div className={cn(
            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
            active
                ? "bg-primary-50 text-primary-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}>
            <Icon size={20} className={cn("transition-colors", active ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
            <span className="font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />}
        </div>
    </Link>
);

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: user?.role === 'admin' ? '/admin' : '/dashboard' },
        // For students, Dashboard IS the report list, preventing redundant links.
        // { icon: FileText, label: 'My Reports', path: '/reports' }, 
        { icon: Settings, label: 'Settings', path: user?.role === 'admin' ? '/admin/settings' : '/settings' },
    ];

    return (
        <div className="min-h-screen bg-bg-light flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-glow">
                        <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                        DamageReport
                    </span>
                    <button
                        className="ml-auto lg:hidden text-slate-400"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    <div className="mb-6 px-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                    </div>
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </div>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3 mb-4 p-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold border border-primary-200">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@college.edu'}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} className="mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <div className="flex items-center">
                        <button
                            className="lg:hidden mr-4 text-slate-500 hover:text-primary-600"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search (Visual Only) */}
                        <div className="relative hidden md:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                className="h-10 pl-10 pr-4 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-primary-500 text-sm w-64 transition-all"
                            />
                        </div>

                        <NotificationDropdown />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
