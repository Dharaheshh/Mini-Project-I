import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';

const ComplaintList = ({ complaints }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
      {complaints.map((complaint) => (
        <Card key={complaint._id} className="group hover:shadow-lg transition-all duration-300 border-slate-100 overflow-hidden p-0">
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

            <div className="flex items-center justify-between">
              <Badge variant={
                complaint.status === 'Resolved' ? 'success' :
                  complaint.status === 'In-Progress' ? 'default' : 'warning'
              }>
                {complaint.status}
              </Badge>

              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group/btn">
                Details
                <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ComplaintList;

