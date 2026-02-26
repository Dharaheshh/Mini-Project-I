// Enhanced issue reports with detailed information
const ISSUE_TYPES = ['Maintenance', 'Safety', 'Infrastructure', 'Electrical', 'Plumbing', 'HVAC', 'Other'];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

// Generate dates over the last 60 days
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const REPORTS = [
  { 
    id: 1, 
    block: 'A Block',
    type: 'Maintenance',
    severity: 'High',
    date: getRandomDate(5),
    status: 'Open',
    description: 'Broken window on 2nd floor, needs immediate repair',
    reportedBy: 'John Smith',
    priority: 3
  },
  { 
    id: 2, 
    block: 'A Block',
    type: 'Electrical',
    severity: 'Medium',
    date: getRandomDate(12),
    status: 'In Progress',
    description: 'Flickering lights in corridor',
    reportedBy: 'Sarah Johnson',
    priority: 2
  },
  { 
    id: 3, 
    block: 'G Block',
    type: 'Plumbing',
    severity: 'Critical',
    date: getRandomDate(2),
    status: 'Open',
    description: 'Water leak in restroom, urgent attention required',
    reportedBy: 'Mike Davis',
    priority: 4
  },
  { 
    id: 4, 
    block: 'F Block',
    type: 'Safety',
    severity: 'High',
    date: getRandomDate(8),
    status: 'Open',
    description: 'Damaged handrail on staircase',
    reportedBy: 'Emily Chen',
    priority: 3
  },
  { 
    id: 5, 
    block: 'F Block',
    type: 'HVAC',
    severity: 'Medium',
    date: getRandomDate(15),
    status: 'Resolved',
    description: 'Air conditioning not working properly',
    reportedBy: 'Robert Wilson',
    priority: 2
  },
  { 
    id: 6, 
    block: 'F Block',
    type: 'Infrastructure',
    severity: 'Low',
    date: getRandomDate(20),
    status: 'Closed',
    description: 'Cracked floor tile in hallway',
    reportedBy: 'Lisa Anderson',
    priority: 1
  },
  { 
    id: 7, 
    block: 'CSE Block',
    type: 'Electrical',
    severity: 'High',
    date: getRandomDate(3),
    status: 'Open',
    description: 'Power outlet not functioning in lab',
    reportedBy: 'David Lee',
    priority: 3
  },
  { 
    id: 8, 
    block: 'CSE Block',
    type: 'Maintenance',
    severity: 'Medium',
    date: getRandomDate(10),
    status: 'In Progress',
    description: 'Door handle needs replacement',
    reportedBy: 'Jennifer Brown',
    priority: 2
  },
  { 
    id: 9, 
    block: 'C Block',
    type: 'Plumbing',
    severity: 'Low',
    date: getRandomDate(25),
    status: 'Resolved',
    description: 'Slow draining sink',
    reportedBy: 'Michael Taylor',
    priority: 1
  },
  { 
    id: 10, 
    block: 'Library',
    type: 'Infrastructure',
    severity: 'Medium',
    date: getRandomDate(7),
    status: 'Open',
    description: 'Bookshelf needs reinforcement',
    reportedBy: 'Amanda White',
    priority: 2
  },
  { 
    id: 11, 
    block: 'Library',
    type: 'HVAC',
    severity: 'High',
    date: getRandomDate(4),
    status: 'In Progress',
    description: 'Temperature control issues in reading area',
    reportedBy: 'Christopher Martinez',
    priority: 3
  },
  { 
    id: 12, 
    block: 'Admin',
    type: 'Safety',
    severity: 'Critical',
    date: getRandomDate(1),
    status: 'Open',
    description: 'Fire extinguisher expired, needs immediate replacement',
    reportedBy: 'Patricia Garcia',
    priority: 4
  },
  {
    id: 13,
    block: 'IT block',
    type: 'Electrical',
    severity: 'Medium',
    date: getRandomDate(18),
    status: 'Resolved',
    description: 'Network port not working',
    reportedBy: 'James Rodriguez',
    priority: 2
  },
  {
    id: 14,
    block: 'Boys hostel',
    type: 'Plumbing',
    severity: 'High',
    date: getRandomDate(6),
    status: 'Open',
    description: 'Shower head leaking',
    reportedBy: 'Daniel Kim',
    priority: 3
  },
  {
    id: 15,
    block: 'Girls hostel',
    type: 'Maintenance',
    severity: 'Low',
    date: getRandomDate(30),
    status: 'Closed',
    description: 'Loose cabinet door',
    reportedBy: 'Michelle Park',
    priority: 1
  },
];

export default REPORTS;
export { ISSUE_TYPES, SEVERITY_LEVELS, STATUS_OPTIONS };