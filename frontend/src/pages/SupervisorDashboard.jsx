import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supervisorAPI } from '../services/api';
import {
    Search,
    MoreVertical,
    CheckCircle,
    Clock,
    ClipboardList,
    AlertCircle,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Play,
    CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';

const StatsCardDark = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 bg-slate-900/50 ${colorClass} text-opacity-100 transition-transform duration-300 group-hover:scale-110`}>
            <Icon size={20} className="text-white" />
        </div>
        <p className="text-slate-400 font-medium text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
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
    const [expandedStatus, setExpandedStatus] = useState({
        Submitted: true,
        'In-Progress': true,
        Resolved: false,
    });

    const toggleStatus = (status) => {
        setExpandedStatus(prev => ({ ...prev, [status]: !prev[status] }));
    };

    const groupedComplaints = {
        Submitted: [],
        'In-Progress': [],
        Resolved: []
    };

    complaints.forEach(c => {
        if (groupedComplaints[c.status]) {
            groupedComplaints[c.status].push(c);
        } else {
            groupedComplaints.Submitted.push(c); // fallback
        }
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
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-700/60 shadow-lg bg-slate-800/80 backdrop-blur-xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/60 backdrop-blur-md border-b border-slate-700/80">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Report</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Deadline</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action Handler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {complaints.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No active work orders matched your filters.
                                    </td>
                                </tr>
                            ) : (
                                [
                                    { id: 'Submitted', label: 'Submitted / Pending Action', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
                                    { id: 'In-Progress', label: 'Active Jobs', icon: Play, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                                    { id: 'Resolved', label: 'Successfully Completed', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' }
                                ].map(statusGroup => {
                                    const statusComplaints = groupedComplaints[statusGroup.id];
                                    if (statusComplaints.length === 0) return null;

                                    const isExpanded = expandedStatus[statusGroup.id];

                                    return (
                                        <React.Fragment key={statusGroup.id}>
                                            <tr 
                                                className={`cursor-pointer hover:bg-slate-700/50 transition-colors ${isExpanded ? 'bg-slate-700/30' : ''}`}
                                                onClick={() => toggleStatus(statusGroup.id)}
                                            >
                                                <td colSpan="8" className="px-6 py-3 border-y border-slate-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-1.5 rounded-md ${statusGroup.bg} ${statusGroup.color}`}>
                                                            <statusGroup.icon size={18} />
                                                        </div>
                                                        <h4 className="font-bold text-white flex items-center gap-2">
                                                            {statusGroup.label}
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                                                {statusComplaints.length}
                                                            </span>
                                                        </h4>
                                                        <div className="ml-auto text-slate-500">
                                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                            {isExpanded && statusComplaints.map((complaint) => (
                                                <tr key={complaint._id} className={`hover:bg-slate-700/40 transition-colors group ${complaint.duplicate ? 'bg-orange-900/20 border-l-2 border-l-orange-500' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-600 shadow-md relative group-hover:scale-105 transition-transform duration-300">
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
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <Badge variant="neutral" className="bg-slate-700 text-slate-200 border-0">{complaint.category}</Badge>
                                                            {complaint.duplicate && (
                                                                <Badge variant="danger" className="bg-orange-900/30 text-orange-400 text-[10px] px-1.5 py-0.5 border-orange-700/50 shadow-sm flex items-center gap-1">
                                                                    <AlertTriangle size={10} />
                                                                    Duplicate
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={
                                                            complaint.severity === 'Hazardous' ? 'danger' :
                                                                complaint.severity === 'Severe' ? 'orange' :
                                                                    complaint.severity === 'Moderate' ? 'yellow' : 'success'
                                                        }>
                                                            {complaint.severity || 'Unknown'}
                                                        </Badge>
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
                                                        {complaint.slaDeadline ? (() => {
                                                            const now = new Date();
                                                            const deadline = new Date(complaint.slaDeadline);
                                                            const diffMs = deadline - now;
                                                            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                                            const isResolved = complaint.status === 'Resolved';
                                                            const isOverdue = diffDays < 0 && !isResolved;
                                                            const isDueSoon = diffDays >= 0 && diffDays <= 1 && !isResolved;
                                                            return (
                                                                <div className="flex flex-col gap-1 text-[11px] font-semibold tracking-wide uppercase">
                                                                    <span className="text-slate-400 font-medium tracking-normal mb-0.5">{deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                    {isResolved ? (
                                                                        <span className="text-green-500 bg-green-500/10 px-1 py-0.5 rounded w-max">On Time</span>
                                                                    ) : isOverdue ? (
                                                                        <span className="text-red-500 bg-red-500/10 px-1 py-0.5 rounded flex items-center gap-1 w-max"><AlertTriangle size={10} /> Overdue by {Math.abs(diffDays)}d</span>
                                                                    ) : isDueSoon ? (
                                                                        <span className="text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded w-max">Due Soon ({diffDays}d)</span>
                                                                    ) : (
                                                                        <span className="text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded w-max">{diffDays} days left</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })() : <span className="text-xs text-slate-500">—</span>}
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
                                                        <div className="w-40">
                                                            <Select
                                                                value={complaint.status}
                                                                onChange={(val) => handleStatusChange(complaint._id, val)}
                                                                options={[
                                                                    { value: 'Submitted', label: 'Mark Pending' },
                                                                    { value: 'In-Progress', label: 'Start Job' },
                                                                    { value: 'Resolved', label: 'Complete Issue' }
                                                                ]}
                                                            />
                                                        </div>
                                                        <Link to={`/complaints/${complaint._id}`} className="text-slate-500 hover:text-white p-2 rounded max-w-max hover:bg-slate-700 transition">
                                                            <MoreVertical size={18} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupervisorDashboard;
