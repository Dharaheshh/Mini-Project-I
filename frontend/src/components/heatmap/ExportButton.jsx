import React from 'react';

function ExportButton({ onExportPNG, onExportCSV, reports }) {
  const handleExportPNG = () => {
    const heatmapFrame = document.querySelector('.heatmap-frame');
    if (!heatmapFrame) return;

    // Create a canvas to capture the heatmap
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Draw the heatmap overlay
      const heatmapCanvas = document.querySelector('.heatmap-overlay');
      if (heatmapCanvas) {
        ctx.drawImage(heatmapCanvas, 0, 0);
      }
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campus-heatmap-${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = document.querySelector('.heatmap-frame img').src;
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Block', 'Type', 'Severity', 'Status', 'Date', 'Description', 'Reported By'];
    const rows = reports.map(r => [
      r.id,
      r.block,
      r.type,
      r.severity,
      r.status,
      r.date,
      r.description,
      r.reportedBy
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-button-group">
      <button className="export-button" onClick={handleExportPNG} title="Export heatmap as PNG">
        <span className="export-icon">📷</span>
        Export PNG
      </button>
      <button className="export-button" onClick={handleExportCSV} title="Export data as CSV">
        <span className="export-icon">📊</span>
        Export CSV
      </button>
    </div>
  );
}

export default ExportButton;

