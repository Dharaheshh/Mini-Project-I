import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supervisorAPI } from '../services/api';
import {
    Search,
    MoreVertical,
    CheckCircle,
    Clock,
    ClipboardList,
    AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const StatsCardDark = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all group-hover:blur-3xl group-hover:opacity-20 ${colorClass}`} />
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-slate-400 font-medium text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-slate-900/50 ${colorClass} text-opacity-100`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const SupervisorDashboard = () => {
    const { user } = useAuthStore();
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
    });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const fetchData = async () => {
        try {
            const response = await supervisorAPI.getAssignedComplaints(filters);
            setComplaints(response.data.complaints);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching supervisor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await supervisorAPI.updateStatus(id, { status: newStatus });
            fetchData(); // Refresh UI after update
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center animate-pulse">
                    <div className="h-12 w-12 bg-slate-700 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-up bg-slate-900 min-h-screen text-slate-200 p-6 rounded-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        Department Operations
                        <span className="text-sm font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full capitalize">
                            {user?.department} Team
                        </span>
                    </h1>
                    <p className="text-slate-400 mt-1">Manage, update, and resolve issues assigned strictly to your sector.</p>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCardDark
                        title="Total Assigned"
                        value={stats.totalAssigned}
                        icon={ClipboardList}
                        colorClass="bg-blue-500"
                    />
                    <StatsCardDark
                        title="Pending Validation"
                        value={stats.pending}
                        icon={AlertCircle}
                        colorClass="bg-red-500"
                    />
                    <StatsCardDark
                        title="Active Jobs (In-Progress)"
                        value={stats.inProgress}
                        icon={Clock}
                        colorClass="bg-yellow-500"
                    />
                    <StatsCardDark
                        title="Successfully Resolved"
                        value={stats.resolved}
                        icon={CheckCircle}
                        colorClass="bg-green-500"
                    />
                </div>
            )}

            {/* Main Table Operations */}
            <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        📋 Work Orders
                    </h3>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search location..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-slate-500"
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="Submitted">Pending</option>
                            <option value="In-Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Report</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action Handler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {complaints.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No active work orders matched your filters.
                                    </td>
                                </tr>
                            ) : (
                                complaints.map((complaint) => (
                                    <tr key={complaint._id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700 shadow-md">
                                                    <img src={complaint.image.url} alt="Damage" className="h-full w-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white line-clamp-1 w-48">{complaint.note || 'No description provided'}</p>
                                                    <p className="text-xs text-slate-400 flex items-center mt-1">
                                                        <Clock size={12} className="mr-1 opacity-70" />
                                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="neutral" className="bg-slate-700 text-slate-200 border-0">{complaint.category}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-300 font-medium">{complaint.location}</div>
                                            {complaint.classroom && <div className="text-xs text-slate-500 mt-0.5">Room: {complaint.classroom}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                complaint.priority === 'High' ? 'danger' :
                                                    complaint.priority === 'Medium' ? 'warning' : 'success'
                                            }>
                                                {complaint.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                complaint.status === 'Resolved' ? 'success' :
                                                    complaint.status === 'In-Progress' ? 'default' : 'warning'
                                            } className="capitalize font-bold h-6 shadow-sm">
                                                {complaint.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right flex justify-end gap-3 items-center mt-2 border-none">
                                            <select
                                                value={complaint.status}
                                                onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                                                className={`text-xs font-bold rounded-lg focus:ring-2 focus:ring-blue-500 py-2 px-3 shadow-inner cursor-pointer transition-colors border-0
                          ${complaint.status === 'Resolved' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                                        complaint.status === 'In-Progress' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                                                            'bg-slate-700 text-white hover:bg-slate-600'
                                                    }`}
                                            >
                                                <option value="Submitted">Mark Pending</option>
                                                <option value="In-Progress">Start Job</option>
                                                <option value="Resolved">Complete Issue</option>
                                            </select>
                                            <Link to={`/complaints/${complaint._id}`} className="text-slate-500 hover:text-white p-2 rounded max-w-max hover:bg-slate-700 transition">
                                                <MoreVertical size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupervisorDashboard;
