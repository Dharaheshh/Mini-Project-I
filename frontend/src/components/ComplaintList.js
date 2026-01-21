import React from 'react';

const ComplaintList = ({ complaints }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'In-Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">No complaints submitted yet.</p>
        <p className="text-gray-400 text-sm mt-2">Click "New Complaint" to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div key={complaint._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <img
                src={complaint.image.url}
                alt="Damage"
                className="w-full md:w-48 h-48 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority} Priority
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {complaint.category}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Location: {complaint.location}</h3>
              {complaint.note && (
                <p className="text-gray-600 mb-3">{complaint.note}</p>
              )}
              <div className="text-sm text-gray-500">
                <p>Submitted: {new Date(complaint.createdAt).toLocaleString()}</p>
                {complaint.adminNotes && (
                  <p className="mt-2 text-blue-600">Admin Note: {complaint.adminNotes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintList;

