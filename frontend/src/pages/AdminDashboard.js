import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FileText,
  Mail,
  Activity,
  ChevronDown,
  ChevronRight,
  Wrench,
  Zap,
  Droplets
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
    startDate: '',
    endDate: '',
    search: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingDept, setExportingDept] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [expandedDepts, setExpandedDepts] = useState({
    infrastructure: true,
    electrical: false,
    plumbing: false,
  });

  const toggleDept = (dept) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  // Grouping mapping logic
  const getDepartmentForCategory = (category) => {
    const electricalOpts = ['Projector', 'Socket', 'Fan', 'Light'];
    const plumbingOpts = ['Pipe', 'Washbasin', 'Toilets'];
    if (electricalOpts.includes(category)) return 'electrical';
    if (plumbingOpts.includes(category)) return 'plumbing';
    return 'infrastructure'; // Bench, Chair, Other, etc.
  };

  const groupedComplaints = {
    infrastructure: [],
    electrical: [],
    plumbing: []
  };

  complaints.forEach(c => {
    const dept = getDepartmentForCategory(c.category);
    groupedComplaints[dept].push(c);
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

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const response = await adminAPI.exportReport(filters);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `damage-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export report error:', error);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleDepartmentExport = async (department) => {
    try {
      setExportingDept(department);
      const response = await adminAPI.exportDepartmentReport(department);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${department}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export department error:', error);
      alert('Failed to export department report');
    } finally {
      setExportingDept(null);
    }
  };

  const handleSendEmail = async (department) => {
    if (!window.confirm(`Are you sure you want to generate and email the report to the ${department} supervisor?`)) return;

    try {
      setSendingEmail(department);
      const response = await adminAPI.sendDepartmentReport(department);
      alert(response.data.message || 'Report sent successfully');
    } catch (error) {
      console.error('Email send error:', error);
      alert(error.response?.data?.message || 'Failed to dispatch email to supervisor.');
    } finally {
      setSendingEmail(null);
    }
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

  // Smart Issue Radar & Urgent Issues Aggregation
  const unresolvedComplaints = complaints.filter(c => c.status !== 'Resolved');
  const urgentIssuesCount = unresolvedComplaints.filter(c => c.priority === 'High').length;

  const radarMap = {};
  unresolvedComplaints.forEach(c => {
    const loc = c.location || 'Unknown Area';
    if (!radarMap[loc]) {
      radarMap[loc] = { block: loc, high: 0, medium: 0, low: 0, hasOverdue: false };
    }
    if (c.priority === 'High') radarMap[loc].high++;
    if (c.priority === 'Medium') radarMap[loc].medium++;
    if (c.priority === 'Low') radarMap[loc].low++;
    
    if (c.slaDeadline) {
      if (new Date() > new Date(c.slaDeadline)) {
        radarMap[loc].hasOverdue = true;
      }
    }
  });
  const radarData = Object.values(radarMap).sort((a, b) => b.high - a.high || b.medium - a.medium);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500">Real-time infrastructure monitoring dashboard.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExportReport} disabled={exporting}>
            <Download size={16} className="mr-2" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
          <Button size="sm" onClick={() => setShowFilterModal(true)}>
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

      {/* Smart Radar & Urgent Issues Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Issues Widget */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-red-50 to-white flex md:flex-row lg:flex-col justify-center items-center p-8 text-center relative overflow-hidden ring-1 ring-red-100/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <AlertTriangle size={48} className="text-red-500 mb-4 animate-[bounce_2s_infinite]" />
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">🚨 Urgent Issues</h3>
            <p className="text-slate-600 flex flex-col items-center">
              <strong className="text-4xl font-extrabold text-red-600 my-2">{urgentIssuesCount}</strong>
              <span className="text-sm font-medium">High Priority Complaints<br/>need attention</span>
            </p>
          </div>
        </Card>

        {/* Smart Issue Radar Widget */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <Activity size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Smart Issue Radar</h3>
              <p className="text-xs text-slate-500">Real-time localized priority mapping</p>
            </div>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {radarData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CheckCircle size={32} className="mb-2 text-slate-300" />
                <p>No active issues on campus.</p>
              </div>
            ) : (
              radarData.map((data, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] ${data.hasOverdue ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {data.hasOverdue ? '🚨' : data.high > 0 ? '🔴' : data.medium > 0 ? '🟠' : '🟢'}
                    </div>
                    <div>
                      <h4 className={`font-bold ${data.hasOverdue ? 'text-red-900' : 'text-slate-800'}`}>
                        {data.block}
                      </h4>
                      <div className="text-xs mt-1">
                        {data.hasOverdue ? (
                          <span className="text-red-600 font-semibold flex items-center gap-1">
                            <Clock size={10} /> {data.high + data.medium + data.low} Overdue Issues
                          </span>
                        ) : (
                          <div className="flex gap-2 text-slate-500 font-medium">
                            {data.high > 0 && <span className="text-red-600">{data.high} High</span>}
                            {data.medium > 0 && <span className="text-orange-500">{data.medium} Medium</span>}
                            {data.low > 0 && <span className="text-green-600">{data.low} Low</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={data.hasOverdue ? 'danger' : 'neutral'} className="shadow-sm">
                    {data.high + data.medium + data.low} Total
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Supervisor Reports (Department Scopes) */}
      <Card className="p-6">
        <h3 className="text-xl font-bold flex items-center text-slate-800 mb-2">
          📊 Supervisor Reports
        </h3>
        <p className="text-sm text-slate-500 mb-6">Instantly export or dispatch departmental summary sheets directly to assigned supervisors.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['infrastructure', 'electrical', 'plumbing'].map((dept) => (
            <div key={dept} className="flex flex-col p-5 bg-slate-50 hover:bg-primary-50/30 transition-colors rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 capitalize mb-4 text-center">{dept} Department</h4>
              <div className="flex flex-col gap-3 mt-auto">
                <Button variant="outline" size="sm" className="w-full justify-center !text-primary-600 border-primary-200 hover:bg-primary-50" onClick={() => handleDepartmentExport(dept)} disabled={exportingDept === dept || sendingEmail === dept}>
                  <Download size={14} className="mr-2" />
                  {exportingDept === dept ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button size="sm" className="w-full justify-center shadow-lg hover:shadow-primary-500/30" onClick={() => handleSendEmail(dept)} disabled={sendingEmail === dept || exportingDept === dept}>
                  <Mail size={14} className="mr-2" />
                  {sendingEmail === dept ? 'Dispatching...' : 'Send via Email'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
                placeholder="Search location..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    No reports found matching your filters.
                  </td>
                </tr>
              ) : (
                [
                  { id: 'infrastructure', label: 'Infrastructure', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' }
                ].map(dept => {
                  const deptComplaints = groupedComplaints[dept.id];
                  if (deptComplaints.length === 0) return null;

                  const isExpanded = expandedDepts[dept.id];

                  return (
                    <React.Fragment key={dept.id}>
                      {/* Department Group Header */}
                      <tr 
                        className={`cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}
                        onClick={() => toggleDept(dept.id)}
                      >
                        <td colSpan="8" className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-md ${dept.bg} ${dept.color}`}>
                              <dept.icon size={18} />
                            </div>
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                              {dept.label} Reports
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                {deptComplaints.length}
                              </span>
                            </h4>
                            <div className="ml-auto text-slate-400">
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Department Complaints (Collapsible) */}
                      {isExpanded && deptComplaints.map((complaint) => (
                        <tr key={complaint._id} className={`hover:bg-slate-50/80 transition-all duration-300 group ${complaint.duplicate ? 'bg-orange-50/60' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
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
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="neutral">{complaint.category}</Badge>
                        {complaint.duplicate && (
                          <Badge variant="danger" className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 border-orange-200 shadow-sm flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Duplicate Report
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
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {complaint.location}
                      {complaint.classroom && <div className="text-xs text-slate-500 mt-0.5">Room: {complaint.classroom}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        complaint.priority === 'High' ? 'danger' :
                          complaint.priority === 'Medium' ? 'warning' : 'success'
                      } className="shadow-sm">
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
                                    <span className="text-slate-500 font-medium tracking-normal mb-0.5">{deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    {isResolved ? (
                                        <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 w-max">On Time</span>
                                    ) : isOverdue ? (
                                        <span className="text-red-700 bg-red-50 px-1 py-0.5 rounded border border-red-200 flex items-center gap-1 w-max"><AlertTriangle size={10} /> Overdue by {Math.abs(diffDays)}d</span>
                                    ) : isDueSoon ? (
                                        <span className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 w-max">Due Soon ({diffDays}d)</span>
                                    ) : (
                                        <span className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 w-max">{diffDays} days left</span>
                                    )}
                                </div>
                            );
                        })() : <span className="text-xs text-slate-500">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        complaint.status === 'Resolved' ? 'success' :
                          complaint.status === 'In-Progress' ? 'default' : 'warning'
                      } className="capitalize">
                        {complaint.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3 items-center mt-3 border-none opacity-80 group-hover:opacity-100 transition-opacity">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                        className="text-xs border-slate-200 text-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 py-1.5 px-2 bg-white shadow-sm cursor-pointer hover:border-primary-300 transition-colors"
                      >
                        <option value="Submitted">Pending</option>
                        <option value="In-Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <Link to={`/complaints/${complaint._id}`} className="text-slate-400 hover:text-primary-600 p-1 hover:bg-primary-50 rounded-full transition-colors">
                        <MoreVertical size={16} />
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
      </Card>

      {/* Advanced Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
          <Card className="w-full max-w-md animate-scale-up">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Filter size={18} className="mr-2" /> Advanced Filters
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Chair">Chair</option>
                  <option value="Bench">Bench</option>
                  <option value="Projector">Projector</option>
                  <option value="Socket">Socket</option>
                  <option value="Pipe">Pipe</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-b-xl border-t border-slate-100 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setFilters({ category: '', priority: '', status: '', startDate: '', endDate: '', search: '' })}
              >
                Reset
              </Button>
              <Button onClick={() => setShowFilterModal(false)}>
                Apply Filters
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

