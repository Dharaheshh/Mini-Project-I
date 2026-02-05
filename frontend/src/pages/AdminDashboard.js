import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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
      // In a real app, you might want to debounce this
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
      fetchData(); // Refresh to ensure consistency
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Submitted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In-Progress': 'bg-primary-100 text-primary-800 border-primary-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'High': 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
      'Medium': 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
      'Low': 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20',
    };
    return styles[priority] || 'bg-gray-50 text-gray-700';
  };

  // Chart Configuration
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const chartData = stats?.categoryStats
    ? {
      labels: stats.categoryStats.map((item) => item._id),
      datasets: [
        {
          label: 'Complaints',
          data: stats.categoryStats.map((item) => item.count),
          backgroundColor: [
            '#0ea5e9', // primary-500
            '#6366f1', // secondary-500
            '#f59e0b', // amber-500
            '#ef4444', // red-500
            '#8b5cf6', // violet-500
            '#10b981', // emerald-500
          ],
          borderRadius: 6,
        },
      ],
    }
    : null;

  // Mock data for a second chart (Priority Distribution) - purely for visuals
  const priorityChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          complaints.filter(c => c.priority === 'High').length,
          complaints.filter(c => c.priority === 'Medium').length,
          complaints.filter(c => c.priority === 'Low').length,
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-gray-500 animate-pulse">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Overview of campus infrastructure status</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-semibold text-gray-800">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Reports</h3>
                  <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.totalComplaints}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 font-medium bg-green-50 inline-block px-2 py-1 rounded">
                +12% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending</h3>
                  <p className="text-4xl font-extrabold text-yellow-500 mt-2">{stats.status.submitted}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1 mt-6">
                <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${(stats.status.submitted / stats.totalComplaints) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">In Progress</h3>
                  <p className="text-4xl font-extrabold text-primary-600 mt-2">{stats.status.inProgress}</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                  ⚙️
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1 mt-6">
                <div className="bg-primary-600 h-1 rounded-full" style={{ width: `${(stats.status.inProgress / stats.totalComplaints) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Resolved</h3>
                  <p className="text-4xl font-extrabold text-green-600 mt-2">{stats.status.resolved}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  ✅
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1 mt-6">
                <div className="bg-green-600 h-1 rounded-full" style={{ width: `${(stats.status.resolved / stats.totalComplaints) * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Reports by Category</h2>
            <div className="h-64">
              {chartData && <Bar data={chartData} options={barChartOptions} />}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between">
              Priority Breakdown
              <span className="text-xs font-normal text-gray-500 border rounded px-2 py-1">Live</span>
            </h2>
            <div className="h-48 relative flex items-center justify-center">
              <Doughnut
                data={priorityChartData}
                options={{
                  cutout: '70%',
                  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-300">!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span className="bg-gray-100 p-2 rounded">🔍</span> Filter Reports
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">All Categories</option>
              <option value="Chair">Chair</option>
              <option value="Bench">Bench</option>
              <option value="Projector">Projector</option>
              <option value="Socket">Socket</option>
              <option value="Pipe">Pipe</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints List Table Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Image/Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      No reports found matching your filters.
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            <img src={complaint.image.url} alt="Damage" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1 w-48">{complaint.note || 'No description'}</p>
                            <p className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600">
                          {complaint.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complaint.location}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold border rounded-full ${getStatusBadge(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={complaint.status}
                          onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                          className="text-sm border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 py-1"
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

