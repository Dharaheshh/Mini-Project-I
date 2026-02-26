import React from 'react';

function BlockDetailsModal({ block, reports, isOpen, onClose }) {
  if (!isOpen) return null;

  const blockReports = reports.filter(r => r.block === block.name);
  const severityColors = {
    Critical: '#ff0000',
    High: '#ff6b6b',
    Medium: '#ffa500',
    Low: '#4caf50'
  };

  const statusColors = {
    Open: '#ff6b6b',
    'In Progress': '#667eea',
    Resolved: '#4caf50',
    Closed: '#9e9e9e'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="modal-icon">🏢</span>
            {block.name}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-stats">
            <div className="modal-stat">
              <span className="modal-stat-value">{blockReports.length}</span>
              <span className="modal-stat-label">Total Issues</span>
            </div>
            <div className="modal-stat">
              <span className="modal-stat-value">
                {blockReports.filter(r => r.status === 'Open').length}
              </span>
              <span className="modal-stat-label">Open</span>
            </div>
            <div className="modal-stat">
              <span className="modal-stat-value">
                {blockReports.filter(r => r.status === 'In Progress').length}
              </span>
              <span className="modal-stat-label">In Progress</span>
            </div>
            <div className="modal-stat">
              <span className="modal-stat-value">
                {blockReports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length}
              </span>
              <span className="modal-stat-label">Resolved</span>
            </div>
          </div>

          <div className="modal-reports-list">
            <h3 className="reports-list-title">Issue Reports</h3>
            {blockReports.length === 0 ? (
              <div className="no-reports">No reports for this block</div>
            ) : (
              <div className="reports-container">
                {blockReports
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((report) => (
                    <div key={report.id} className="report-card">
                      <div className="report-header">
                        <div className="report-meta">
                          <span 
                            className="severity-badge"
                            style={{ backgroundColor: severityColors[report.severity] }}
                          >
                            {report.severity}
                          </span>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: statusColors[report.status] }}
                          >
                            {report.status}
                          </span>
                          <span className="type-badge">{report.type}</span>
                        </div>
                        <span className="report-date">{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <p className="report-description">{report.description}</p>
                      <div className="report-footer">
                        <span className="report-author">Reported by: {report.reportedBy}</span>
                        <span className="report-id">#{report.id}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockDetailsModal;

