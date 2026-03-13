import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle size={14} /></div>;
            case 'warning': return <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><AlertTriangle size={14} /></div>;
            case 'error': return <div className="p-1.5 rounded-lg bg-red-50 text-red-600"><AlertTriangle size={14} /></div>;
            default: return <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Info size={14} /></div>;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-xl shadow-md border border-slate-200 overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
                        <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                                <Check size={12} className="mr-1" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    className={cn(
                                        "px-4 py-3 border-b border-slate-100/50 group hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer",
                                        !notification.read ? "bg-blue-50/20" : ""
                                    )}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                >
                                    <div className="flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn("text-sm text-slate-800", !notification.read && "font-bold")}>
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs font-semibold text-slate-400">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                            {notification.complaint && (
                                                <Link 
                                                    to={`/complaints/${notification.complaint}`}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                                >
                                                    View complaint →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
