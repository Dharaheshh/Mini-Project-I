import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';
import { StatsCard } from '../components/ui/StatsCard';
import { Button } from '../components/ui/Button';
import { PlusCircle, ListChecks, Clock, CheckCircle2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('list'); // 'list' or 'create'

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintsAPI.getAll();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintCreated = () => {
    fetchComplaints();
    setViewState('list');
  };

  // Calculate simple stats for the user
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Submitted').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500">Track and report campus infrastructure issues.</p>
        </div>

        {viewState === 'list' && (
          <Button
            onClick={() => setViewState('create')}
            className="shadow-lg shadow-primary-500/20"
            size="lg"
          >
            <PlusCircle size={20} className="mr-2" />
            New Report
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="My Reports"
          value={stats.total}
          icon={ListChecks}
          color="primary"
        />
        <StatsCard
          title="Pending Integration"
          value={stats.pending}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="success"
        />
      </div>

      {/* Main Content Area */}
      {viewState === 'create' ? (
        <div className="animate-fade-in">
          <ComplaintForm
            onSuccess={handleComplaintCreated}
            onCancel={() => setViewState('list')}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Recent History</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <ComplaintList complaints={complaints} />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

