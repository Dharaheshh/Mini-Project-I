import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Filter,
  Download,
  Search,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatsCard } from '../components/ui/StatsCard';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchData = async () => {
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        adminAPI.getAllComplaints(filters),
        adminAPI.getStats(),
      ]);
      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminAPI.updateStatus(id, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const COLORS = ['#8b5cf6', '#d946ef', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center animate-pulse">
          <div className="h-12 w-12 bg-primary-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Prepare Chart Data
  const categoryData = stats?.categoryStats?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const priorityData = [
    { name: 'High', value: complaints.filter(c => c.priority === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: complaints.filter(c => c.priority === 'Low').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500">Real-time infrastructure monitoring dashboard.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Filter size={16} className="mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Reports"
            value={stats.totalComplaints}
            icon={FileText}
            color="primary"
            trend="up"
            trendValue="12%"
          />
          <StatsCard
            title="Pending Actions"
            value={stats.status.submitted}
            icon={Clock}
            color="warning"
          />
          <StatsCard
            title="In Progress"
            value={stats.status.inProgress}
            icon={CheckCircle}
            color="primary"
          />
          <StatsCard
            title="Critical Issues"
            value={priorityData.find(p => p.name === 'High')?.value || 0}
            icon={AlertTriangle}
            color="danger"
          />
        </div>
      )}

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Reports by Category</h3>
            <p className="text-sm text-slate-500">Distribution of facility issues</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Priority Breakdown</h3>
            <p className="text-sm text-slate-500">Severity assessment</p>
          </div>
          <div className="h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-2xl font-bold text-slate-800">{stats?.totalComplaints || 0}</span>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="overflow-hidden p-0 border-0 shadow-lg">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-slate-800">Recent Reports</h3>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No reports found matching your filters.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm relative group-hover:scale-105 transition-transform">
                          <img src={complaint.image.url} alt="Damage" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1 w-48">{complaint.note || 'No description'}</p>
                          <p className="text-xs text-slate-500 flex items-center mt-1">
                            <Clock size={12} className="mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral">{complaint.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {complaint.location}
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
                      } className="capitalize">
                        {complaint.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                        className="text-xs border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 py-1.5 px-2 bg-white shadow-sm cursor-pointer"
                      >
                        <option value="Submitted">Pending</option>
                        <option value="In-Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;

