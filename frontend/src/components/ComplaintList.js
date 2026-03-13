import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { MapPin, Calendar, Clock, ChevronRight, AlertTriangle, ChevronDown, Wrench, Zap, Droplets } from 'lucide-react';

const ComplaintList = ({ complaints }) => {
  const [expandedDepts, setExpandedDepts] = useState({
    infrastructure: true,
    electrical: false,
    plumbing: false,
  });

  const toggleDept = (dept) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  const getDepartmentForCategory = (category) => {
    const electricalOpts = ['Projector', 'Socket', 'Fan', 'Light'];
    const plumbingOpts = ['Pipe', 'Washbasin', 'Toilets'];
    if (electricalOpts.includes(category)) return 'electrical';
    if (plumbingOpts.includes(category)) return 'plumbing';
    return 'infrastructure';
  };

  const groupedComplaints = {
    infrastructure: [],
    electrical: [],
    plumbing: []
  };

  (complaints || []).forEach(c => {
    const dept = getDepartmentForCategory(c.category);
    groupedComplaints[dept].push(c);
  });
  if (!complaints || complaints.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900">No reports yet</h3>
        <p className="text-slate-500">Submit your first report to help improve the campus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {[
        { id: 'infrastructure', label: 'Infrastructure', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' }
      ].map(dept => {
        const deptComplaints = groupedComplaints[dept.id];
        if (deptComplaints.length === 0) return null;

        const isExpanded = expandedDepts[dept.id];

        return (
          <div key={dept.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Department Group Header */}
            <div 
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/50 border-b border-slate-100' : ''}`}
              onClick={() => toggleDept(dept.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dept.bg} ${dept.color}`}>
                  <dept.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  {dept.label} Issues
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                    {deptComplaints.length}
                  </span>
                </h3>
              </div>
              <div className="text-slate-400">
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>

            {/* Department Complaints Grid */}
            {isExpanded && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/30">
                {deptComplaints.map((complaint) => (
                  <Card key={complaint._id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 overflow-hidden p-0 bg-white">
          <div className="h-48 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img
              src={complaint.image.url}
              alt={complaint.category}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute bottom-3 left-3 z-20 text-white">
              <Badge variant="neutral" className="mb-2 bg-white/20 backdrop-blur-md border-white/20 text-white">{complaint.category}</Badge>
              <div className="flex items-center text-sm font-medium">
                <MapPin size={14} className="mr-1" />
                <span className="line-clamp-1">{complaint.location}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-2">{complaint.note || "No description provided."}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 border-t border-slate-50 pt-3">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {new Date(complaint.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center ml-auto font-medium">
                Priority:
                <span className={`ml-1 ${complaint.priority === 'High' ? 'text-red-600' :
                  complaint.priority === 'Medium' ? 'text-amber-600' : 'text-green-600'
                  }`}>
                  {complaint.priority}
                </span>
              </div>
            </div>

            {complaint.slaDeadline && (
              <div className="flex items-center justify-between text-xs border-t border-slate-50 pt-2 pb-1 mb-1">
                <span className="text-slate-400 flex items-center"><Clock size={12} className="mr-1" /> Resolution Deadline:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">
                    {new Date(complaint.slaDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {(() => {
                      const diffDays = Math.ceil((new Date(complaint.slaDeadline) - new Date()) / (1000 * 60 * 60 * 24));
                      const isResolved = complaint.status === 'Resolved';
                      if (diffDays > 0 && !isResolved) return ` (${diffDays} day${diffDays > 1 ? 's' : ''} left)`;
                      return '';
                    })()}
                  </span>
                  {(() => {
                    const diffDays = Math.ceil((new Date(complaint.slaDeadline) - new Date()) / (1000 * 60 * 60 * 24));
                    const isResolved = complaint.status === 'Resolved';
                    if (diffDays < 0 && !isResolved) return <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><AlertTriangle size={9} />Overdue</span>;
                    if (diffDays >= 0 && diffDays <= 1 && !isResolved) return <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Due Soon</span>;
                    return null;
                  })()}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge variant={
                complaint.status === 'Resolved' ? 'success' :
                  complaint.status === 'In-Progress' ? 'default' : 'warning'
              }>
                {complaint.status}
              </Badge>

              <Link to={`/complaints/${complaint._id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group/btn">
                Details
                <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintList;

