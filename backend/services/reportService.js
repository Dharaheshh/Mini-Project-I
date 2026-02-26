const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const Complaint = require('../models/Complaint');

const generateReport = async (filters) => {
  const { startDate, endDate, type, department } = filters;
  const matchquery = {};

  if (startDate || endDate) {
    matchquery.createdAt = {};
    if (startDate) matchquery.createdAt.$gte = new Date(startDate);
    if (endDate) matchquery.createdAt.$lte = new Date(endDate);
  }

  // Inject Supervisor Department scoping securely
  if (type === 'department' && department) {
    matchquery.assignedDepartment = department;
  }

  // Aggregations
  const totalReportsStats = await Complaint.aggregate([
    { $match: matchquery },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $in: ['$status', ['Submitted', 'In-Progress']] }, 1, 0] } },
        // Average resolution time can be computed if we have resolutionDate, 
        // for now we'll just mock it or calculate from statusHistory where status='Resolved'
      }
    }
  ]);

  const categoryStats = await Complaint.aggregate([
    { $match: matchquery },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const priorityStats = await Complaint.aggregate([
    { $match: matchquery },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  const trendStats = await Complaint.aggregate([
    { $match: matchquery },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const locationStats = await Complaint.aggregate([
    { $match: matchquery },
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const stats = totalReportsStats.length > 0 ? totalReportsStats[0] : { total: 0, resolved: 0, pending: 0 };
  stats.resolutionRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(2) : 0;

  // Try to generate average resolution time based on statusHistory
  const resolvedComplaints = await Complaint.find({ ...matchquery, status: 'Resolved' }).select('createdAt updatedAt statusHistory');
  let totalTime = 0;
  let resolvedCount = 0;
  resolvedComplaints.forEach(c => {
    const resolvedEntry = c.statusHistory.find(h => h.status === 'Resolved');
    if (resolvedEntry) {
      const timeDiff = new Date(resolvedEntry.date) - new Date(c.createdAt);
      if (timeDiff > 0) {
        totalTime += timeDiff;
        resolvedCount++;
      }
    }
  });

  const avgResolutionHours = resolvedCount > 0 ? (totalTime / resolvedCount / (1000 * 60 * 60)).toFixed(2) : 0;
  stats.avgResolutionHours = avgResolutionHours;

  const data = {
    stats,
    categories: categoryStats,
    priorities: priorityStats,
    trends: trendStats,
    locations: locationStats,
    generatedAt: new Date().toLocaleString(),
    range: {
      startDate: startDate ? new Date(startDate).toLocaleDateString() : 'All Time',
      endDate: endDate ? new Date(endDate).toLocaleDateString() : 'Today'
    }
  };

  // Setup EJS Template inline for simplicity and safety
  const templateHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>System Damage Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      :root {
        --primary: #2563eb;
        --secondary: #475569;
        --bg: #f8fafc;
        --surface: #ffffff;
        --border: #e2e8f0;
      }
      body { 
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
        margin: 0;
        padding: 40px; 
        color: #1e293b; 
        background-color: var(--bg);
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid var(--border);
      }
      .header h1 { 
        color: #0f172a; 
        margin: 0 0 10px 0;
        font-size: 28px;
        letter-spacing: -0.5px;
      }
      .header p {
        color: var(--secondary);
        margin: 4px 0;
        font-size: 14px;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 32px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        page-break-inside: avoid;
      }
      .summary-grid { 
        display: grid; 
        grid-template-columns: repeat(5, 1fr); 
        gap: 16px; 
        margin-bottom: 32px; 
      }
      .stat-box { 
        background: var(--surface);
        padding: 20px 16px; 
        border-radius: 12px;
        border: 1px solid var(--border);
        text-align: center; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      }
      .stat-value { 
        font-size: 28px; 
        font-weight: 700; 
        color: var(--primary); 
        line-height: 1;
        margin-bottom: 8px;
      }
      .stat-label { 
        font-size: 11px; 
        color: var(--secondary); 
        text-transform: uppercase; 
        letter-spacing: 0.5px;
        font-weight: 600;
      }
      .section-title { 
        color: #0f172a; 
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
      }
      .chart-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }
      .chart-container {
        position: relative;
        height: 250px;
        width: 100%;
      }
      .full-width-chart {
        height: 300px;
        width: 100%;
        margin-bottom: 32px;
      }
      table { 
        width: 100%; 
        border-collapse: separate; 
        border-spacing: 0;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border);
      }
      th, td { 
        padding: 12px 16px; 
        text-align: left; 
        border-bottom: 1px solid var(--border);
        font-size: 14px;
      }
      th { 
        background-color: #f1f5f9; 
        color: #334155;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.5px;
      }
      tr:last-child td { border-bottom: none; }
      tbody tr:nth-child(even) { background-color: #f8fafc; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Infrastructure Damage Report</h1>
      <p><strong>Generated:</strong> <%= generatedAt %></p>
      <p><strong>Time Range:</strong> <%= range.startDate %> - <%= range.endDate %></p>
    </div>
    
    <div class="summary-grid">
      <div class="stat-box">
        <div class="stat-value"><%= stats.total %></div>
        <div class="stat-label">Total Reports</div>
      </div>
      <div class="stat-box">
        <div class="stat-value"><%= stats.resolved %></div>
        <div class="stat-label">Resolved</div>
      </div>
      <div class="stat-box">
        <div class="stat-value"><%= stats.pending %></div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-box">
        <div class="stat-value"><%= stats.resolutionRate %>%</div>
        <div class="stat-label">Resolution Rate</div>
      </div>
      <div class="stat-box">
        <div class="stat-value"><%= stats.avgResolutionHours %>h</div>
        <div class="stat-label">Avg Resolution Time</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="card">
        <h2 class="section-title">Visual Analytics</h2>
        <div class="chart-grid">
            <div class="chart-container">
                <canvas id="categoryChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="priorityChart"></canvas>
            </div>
        </div>
        <div class="full-width-chart">
            <canvas id="trendChart"></canvas>
        </div>
    </div>

    <!-- Data Tables Section -->
    <div class="chart-grid">
        <div class="card">
            <h2 class="section-title">Location Distribution</h2>
            <div class="chart-container">
                <canvas id="locationChart"></canvas>
            </div>
            <table>
            <tr><th>Location</th><th>Count</th></tr>
            <% locations.forEach(function(loc) { %>
                <tr><td><%= loc._id || 'Unspecified' %></td><td><%= loc.count %></td></tr>
            <% }); %>
            </table>
        </div>
        
        <div class="card">
            <h2 class="section-title" style="margin-top: 0;">Category Breakdown</h2>
            <table>
            <tr><th>Category</th><th>Count</th></tr>
            <% categories.forEach(function(cat) { %>
                <tr><td><%= cat._id || 'Uncategorized' %></td><td><%= cat.count %></td></tr>
            <% }); %>
            </table>
            
            <h2 class="section-title" style="margin-top: 32px;">Priority Breakdown</h2>
            <table>
            <tr><th>Priority</th><th>Count</th></tr>
            <% priorities.forEach(function(pri) { %>
                <tr><td><%= pri._id || 'None' %></td><td><%= pri.count %></td></tr>
            <% }); %>
            </table>
        </div>
    </div>

    <!-- Chart.js Injection Script -->
    <script>
        // Inject server data safely
        const rawData = <%- JSON.stringify({ categories, priorities, trends, locations }) %>;
        
        // Common chart options to remove animations for instant PDF capture
        const commonOptions = {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: {size: 11} } }
            }
        };

        // 1. Category Chart (Bar)
        new Chart(document.getElementById('categoryChart'), {
            type: 'bar',
            data: {
                labels: rawData.categories.map(c => c._id || 'Uncategorized'),
                datasets: [{
                    label: 'Reports',
                    data: rawData.categories.map(c => c.count),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Issues by Category' } } }
        });

        // 2. Priority Chart (Doughnut)
        const priorityColors = { 'High': '#ef4444', 'Medium': '#f59e0b', 'Low': '#10b981' };
        new Chart(document.getElementById('priorityChart'), {
            type: 'doughnut',
            data: {
                labels: rawData.priorities.map(p => p._id || 'None'),
                datasets: [{
                    data: rawData.priorities.map(p => p.count),
                    backgroundColor: rawData.priorities.map(p => priorityColors[p._id] || '#cbd5e1'),
                    borderWidth: 0
                }]
            },
            options: { ...commonOptions, cutout: '65%', plugins: { ...commonOptions.plugins, title: { display: true, text: 'Severity Breakdown' } } }
        });

        // 3. Trend Chart (Line)
        new Chart(document.getElementById('trendChart'), {
            type: 'line',
            data: {
                labels: rawData.trends.map(t => t._id),
                datasets: [{
                    label: 'Daily Reports',
                    data: rawData.trends.map(t => t.count),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                }]
            },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Reporting Frequency' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
        
        // 4. Location Chart (Horizontal Bar)
        new Chart(document.getElementById('locationChart'), {
            type: 'bar',
            data: {
                labels: rawData.locations.slice(0, 5).map(l => l._id || 'Unspecified'), // Top 5
                datasets: [{
                    label: 'Report Count',
                    data: rawData.locations.slice(0, 5).map(l => l.count),
                    backgroundColor: '#0ea5e9',
                    borderRadius: 4
                }]
            },
            options: { 
                ...commonOptions, 
                indexAxis: 'y', 
                plugins: { ...commonOptions.plugins, title: { display: true, text: 'Top 5 Locations' }, legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    </script>
  </body>
  </html>
  `;

  // Render HTML
  const html = ejs.render(templateHtml, data);

  // Generate PDF
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Wait until network is fully idle (CDN scripts loaded, charts rendered)
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
};

module.exports = {
  generateReport
};
