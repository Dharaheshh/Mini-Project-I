import React, { useMemo } from 'react';

function TrendsChart({ reports }) {
  const chartData = useMemo(() => {
    // Group reports by date
    const dateMap = new Map();
    
    reports.forEach(report => {
      const date = report.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, count: 0, open: 0, resolved: 0 });
      }
      const entry = dateMap.get(date);
      entry.count++;
      if (report.status === 'Open' || report.status === 'In Progress') {
        entry.open++;
      } else {
        entry.resolved++;
      }
    });

    // Convert to array and sort by date
    const data = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days

    return data;
  }, [reports]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="trends-chart">
      <h3 className="chart-title">
        <span className="chart-icon">📈</span>
        Issue Trends (Last 30 Days)
      </h3>
      <div className="chart-container">
        {chartData.length === 0 ? (
          <div className="chart-empty">No data available</div>
        ) : (
          <div className="chart-bars">
            {chartData.map((item, index) => {
              const height = (item.count / maxCount) * 100;
              const openHeight = item.count > 0 ? (item.open / item.count) * height : 0;
              const resolvedHeight = height - openHeight;

              return (
                <div key={index} className="chart-bar-wrapper" title={`${item.date}: ${item.count} issues`}>
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar resolved"
                      style={{ height: `${resolvedHeight}%` }}
                      title={`Resolved: ${item.resolved}`}
                    />
                    <div 
                      className="chart-bar open"
                      style={{ height: `${openHeight}%` }}
                      title={`Open: ${item.open}`}
                    />
                  </div>
                  <span className="chart-label">
                    {new Date(item.date).getDate()}/{new Date(item.date).getMonth() + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="chart-legend">
        <div className="chart-legend-item">
          <span className="legend-color open"></span>
          <span>Open/In Progress</span>
        </div>
        <div className="chart-legend-item">
          <span className="legend-color resolved"></span>
          <span>Resolved/Closed</span>
        </div>
      </div>
    </div>
  );
}

export default TrendsChart;

