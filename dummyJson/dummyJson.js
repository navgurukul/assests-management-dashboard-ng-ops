export const menuItems = [
  { name: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', studentOnly: false },
  { name: 'Tickets', icon: 'Ticket', path: '/tickets', studentOnly: false },
  { name: 'Allocations', icon: 'Share2', path: '/allocations', studentOnly: false },
  { name: 'Consignments', icon: 'Archive', path: '/consignments', studentOnly: false },
  { name: 'Assets', icon: 'Package', path: '/assets', studentOnly: false },
  { name: 'Components', icon: 'Component', path: '/components', studentOnly: false },
  { name: 'User List', icon: 'Users', path: '/userlist', studentOnly: false },
  // { name: 'Reports', icon: 'FileText', path: '/reports', studentOnly: false },
  // { name: 'User Profile', icon: 'User', path: '/userprofile', studentOnly: false },
  { name: 'My Assets', icon: 'Package', path: '/myassets', studentOnly: true },
  { name: 'My Ticket Status', icon: 'Ticket', path: '/ticketstatus', studentOnly: true },
  { name: 'Ticket for Approval', icon: 'TicketCheck', path: '/ticketforapproval', studentOnly: true },
  // { name: 'Campus Incharge', icon: 'Building2', path: '/campusincharge', studentOnly: true },
];



export const dashboardCards = [
  { id: 1, count: 792, label: 'Active', icon: 'CheckCircle2', bgColor: 'bg-teal-100', iconColor: 'text-teal-600' },
  { id: 2, count: 105, label: 'In Stock', icon: 'Archive', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 3, count: 321, label: 'Needs Repair', icon: 'Settings', bgColor: 'bg-slate-100', iconColor: 'text-slate-600' },
  { id: 4, count: 22, label: 'In Repair', icon: 'Wrench', bgColor: 'bg-red-100', iconColor: 'text-red-600' },
];

export const locationWiseAssetsData = [
  ['Location', 'Count'],
  ['Campus', 1422],
  ['Remote', 64],
];

export const assetsPerCampusData = [
  ['Campus', 'LWS', 'LIS', 'LR', 'LNW', 'LWFHE', 'LCT', 'LASLFH', 'LSD', 'LB', 'LSJOP', 'LNGIN'],
  ['Amaravati', 45, 30, 15, 10, 2, 3, 1, 5, 4, 2, 1],
  ['Dantewada', 38, 25, 20, 12, 1, 2, 0, 3, 2, 1, 1],
  ['Dharamshala', 42, 28, 18, 8, 3, 4, 2, 6, 5, 1, 0],
  ['Himachal Pradesh', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ['Jabalpur', 50, 35, 22, 15, 2, 5, 1, 4, 3, 2, 1],
  ['Kishangarh', 12, 8, 5, 3, 0, 1, 0, 1, 1, 0, 0],
  ['Pune', 55, 40, 25, 18, 4, 6, 3, 8, 6, 3, 2],
  ['Raipur', 58, 38, 20, 14, 3, 4, 2, 5, 4, 2, 1],
  ['Sarjapur', 40, 30, 28, 20, 2, 3, 1, 4, 3, 1, 1],
  ['Udaipur', 60, 45, 18, 12, 3, 5, 2, 7, 5, 2, 1],
];

  

// Individual Assets List Data for /assets route
export const assetsListData = [
  { id: 1, assetTag: 'NG-SARJ-L-0315', type: 'Laptop', campus: 'Sarjapura', status: 'Repair', location: 'Vendor: TechCare', actions: 'View' },
  { id: 2, assetTag: 'NG-PUNE-L-0210', type: 'Laptop', campus: 'Pune', status: 'Allocated', location: 'Student: Meena', actions: 'View' },
  { id: 3, assetTag: 'NG-DHAR-L-0144', type: 'Laptop', campus: 'Dharamshala', status: 'In Stock', location: 'Store Room', actions: 'Assign' },
  { id: 4, assetTag: 'NG-BANG-L-0089', type: 'Laptop', campus: 'Bangalore', status: 'Allocated', location: 'Student: Raj', actions: 'View' },
  { id: 5, assetTag: 'NG-DANT-L-0029', type: 'Laptop', campus: 'Dantewada', status: 'Scrap', location: 'Scrap Room', actions: 'Details' },
  { id: 6, assetTag: 'NG-JASH-L-0421', type: 'Laptop', campus: 'Jashpur', status: 'Allocated', location: 'Student: Rahul', actions: 'View' },
  { id: 7, assetTag: 'NG-RAIP-L-0087', type: 'Laptop', campus: 'Raipur', status: 'Repair', location: 'Vendor: FixIT', actions: 'View' },
  { id: 8, assetTag: 'NG-AMAR-L-0298', type: 'Laptop', campus: 'Amaravati', status: 'Allocated', location: 'Student: Priya', actions: 'View' },
  { id: 9, assetTag: 'NG-UDAI-L-0112', type: 'Laptop', campus: 'Udaipur', status: 'In Stock', location: 'Store Room', actions: 'Assign' },
  { id: 10, assetTag: 'NG-JABA-L-0045', type: 'Laptop', campus: 'Jabalpur', status: 'Allocated', location: 'Student: Ankit', actions: 'View' },
];

// Dummy Allocations List Data (for create consignment testing)
export const allocationsListData = [
  {
    id: 101,
    allocationCode: 'ALLOC-2026-045',
    status: 'ALLOCATED',
    sourceCampus: { name: 'Sarjapura Campus' },
    destinationCampus: { name: 'TechCare Repairs' },
    userEmail: 'student1@navgurukul.org',
    user: { email: 'student1@navgurukul.org', name: 'Rajesh Kumar' },
    assets: [
      { id: 1, assetTag: 'NG-SARJ-L-0315', assetType: 'Laptop', status: 'Active' },
      { id: 2, assetTag: 'NG-SARJ-L-0316', assetType: 'Laptop', status: 'Active' },
      { id: 3, assetTag: 'NG-SARJ-L-0317', assetType: 'Laptop', status: 'Active' },
    ],
  },
  {
    id: 102,
    allocationCode: 'ALLOC-2026-042',
    status: 'ALLOCATED',
    sourceCampus: { name: 'Pune Campus' },
    destinationCampus: { name: 'Himachal Campus' },
    userEmail: 'student2@navgurukul.org',
    user: { email: 'student2@navgurukul.org', name: 'Priya Sharma' },
    assets: [
      { id: 4, assetTag: 'NG-PUNE-L-0210', assetType: 'Laptop', status: 'Active' },
      { id: 5, assetTag: 'NG-PUNE-L-0211', assetType: 'Desktop', status: 'Active' },
      { id: 6, assetTag: 'NG-PUNE-L-0212', assetType: 'Laptop', status: 'Active' },
    ],
  },
  {
    id: 103,
    allocationCode: 'ALLOC-2026-038',
    status: 'ALLOCATED',
    sourceCampus: { name: 'Himachal Campus' },
    destinationCampus: { name: 'FixIT Repairs' },
    userEmail: 'techteam@navgurukul.org',
    user: { email: 'techteam@navgurukul.org', name: 'Tech Team' },
    assets: [
      { id: 7, assetTag: 'NG-HIMA-L-0144', assetType: 'Laptop', status: 'Active' },
      { id: 8, assetTag: 'NG-HIMA-L-0145', assetType: 'Laptop', status: 'Active' },
    ],
  },
  {
    id: 104,
    allocationCode: 'ALLOC-2026-035',
    status: 'ALLOCATED',
    sourceCampus: { name: 'Dantewada Campus' },
    destinationCampus: { name: 'Pune Campus' },
    userEmail: 'student3@navgurukul.org',
    user: { email: 'student3@navgurukul.org', name: 'Amit Patel' },
    assets: [
      { id: 9, assetTag: 'NG-DANT-L-0029', assetType: 'Laptop', status: 'Active' },
      { id: 10, assetTag: 'NG-DANT-L-0030', assetType: 'Tablet', status: 'Active' },
    ],
  },
  {
    id: 105,
    allocationCode: 'ALLOC-2026-030',
    status: 'ALLOCATED',
    sourceCampus: { name: 'Udaipur Campus' },
    destinationCampus: { name: 'Raipur Campus' },
    userEmail: 'student4@navgurukul.org',
    user: { email: 'student4@navgurukul.org', name: 'Neha Singh' },
    assets: [
      { id: 11, assetTag: 'NG-UDAI-L-0112', assetType: 'Laptop', status: 'Active' },
      { id: 12, assetTag: 'NG-UDAI-L-0113', assetType: 'Laptop', status: 'Active' },
      { id: 13, assetTag: 'NG-UDAI-L-0114', assetType: 'Desktop', status: 'Active' },
    ],
  },
];
 
 

// Ticket Details Data
export const ticketDetailsData = {
  1: {
    ticketId: 'TKT-SARJ-251119-R-001',
    type: 'Repair',
    campus: 'Sarjapura',
    raisedOn: '25 Nov 2025',
    assignedTo: 'Campus IT Coordinator',
    sla: '02h 15m',
    slaStatus: 'critical',
    status: 'IN PROGRESS',
    timeline: [
      { label: 'OPEN', completed: true, active: false },
      { label: 'IN PROGRESS', completed: false, active: true },
      { label: 'VENDOR WAIT', completed: false, active: false },
      { label: 'RESOLVED', completed: false, active: false },
      { label: 'CLOSED', completed: false, active: false },
    ],
    deviceSummary: {
      asset: 'NG-SARJ-L-0315',
      brand: 'Lenovo T480',
      currentLocation: 'Sarjapura Vendor',
      condition: 'NOT WORKING',
    },
    logEntries: [
      { time: '12:35 PM', text: 'Assigned to IT (Anita)' },
      { time: '01:40 PM', text: 'Diagnostics complete' },
      { time: '02:10 PM', text: 'Issue requires motherboard replace' },
    ],
    resolutionNotes: 'Added by IT team',
  },
  2: {
    ticketId: 'TKT-PUNE-251119-C-002',
    type: 'Change',
    campus: 'Pune',
    raisedOn: '25 Nov 2025',
    assignedTo: 'Campus IT Coordinator',
    sla: '11h 30m',
    slaStatus: 'normal',
    status: 'ESCALATED',
    timeline: [
      { label: 'OPEN', completed: true, active: false },
      { label: 'IN PROGRESS', completed: true, active: false },
      { label: 'VENDOR WAIT', completed: false, active: false },
      { label: 'RESOLVED', completed: false, active: false },
      { label: 'CLOSED', completed: false, active: false },
    ],
    deviceSummary: {
      asset: 'NG-PUNE-L-0210',
      brand: 'HP Pavilion',
      currentLocation: 'Pune Campus',
      condition: 'WORKING',
    },
    logEntries: [
      { time: '09:15 AM', text: 'Ticket created by Student B' },
      { time: '10:30 AM', text: 'Assigned to IT Team' },
      { time: '11:45 AM', text: 'Escalated to senior technician' },
    ],
    resolutionNotes: 'Pending coordinator review',
  },
};
 
 
 
// Component Details Data
// ============================================
// REPORTS DATA
// ============================================

// Allocation Summary Report Data
export const allocationSummaryKPIs = [
  { count: 1486, label: 'Total Assets', icon: 'Package', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
  { count: 792, label: 'Allocated', icon: 'CheckCircle2', bgColor: 'bg-teal-100', iconColor: 'text-teal-600', borderColor: 'border-teal-200' },
  { count: 105, label: 'In Stock', icon: 'Archive', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
  { count: 22, label: 'Under Repair', icon: 'Wrench', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', borderColor: 'border-yellow-200' },
  { count: 18, label: 'In Courier', icon: 'Truck', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', borderColor: 'border-purple-200' },
  { count: '3.2%', label: 'Scrap %', icon: 'Trash2', bgColor: 'bg-red-100', iconColor: 'text-red-600', borderColor: 'border-red-200' },
];

export const assetsByCampusData = [
  ['Campus', 'Allocated', 'In Stock', 'Under Repair', 'In Courier', 'Scrap'],
  ['Sarjapura', 180, 25, 5, 3, 2],
  ['Pune', 156, 30, 8, 4, 3],
  ['Dharamshala', 98, 18, 3, 2, 1],
  ['Bangalore', 220, 15, 4, 5, 2],
  ['Dantewada', 65, 8, 1, 2, 1],
  ['Jashpur', 73, 9, 1, 2, 1],
];

export const assetsBySourceData = [
  ['Source', 'Count'],
  ['Purchased', 892],
  ['Donated', 456],
  ['Personal', 138],
];

export const allocatedVsInStockData = [
  ['Month', 'Allocated', 'In Stock'],
  ['Jan', 750, 120],
  ['Feb', 768, 115],
  ['Mar', 775, 110],
  ['Apr', 780, 108],
  ['May', 785, 106],
  ['Jun', 792, 105],
];

export const allocationTableData = [
  { id: 1, assetTag: 'NG-SARJ-L-0315', type: 'Laptop', status: 'Under Repair', campus: 'Sarjapura', withWhom: 'Vendor: TechCare', source: 'Purchased', lastAction: 'Sent for repair', lastUpdated: '2 days ago' },
  { id: 2, assetTag: 'NG-PUNE-L-0210', type: 'Laptop', status: 'Allocated', campus: 'Pune', withWhom: 'Student: Meena', source: 'Donated', lastAction: 'Allocated to student', lastUpdated: '5 days ago' },
  { id: 3, assetTag: 'NG-DHAR-L-0144', type: 'Laptop', status: 'In Stock', campus: 'Dharamshala', withWhom: 'Store Room', source: 'Purchased', lastAction: 'Returned by student', lastUpdated: '1 week ago' },
  { id: 4, assetTag: 'NG-BANG-L-0089', type: 'Laptop', status: 'Allocated', campus: 'Bangalore', withWhom: 'Student: Raj', source: 'Donated', lastAction: 'Allocated to student', lastUpdated: '3 days ago' },
  { id: 5, assetTag: 'NG-DANT-L-0029', type: 'Laptop', status: 'Scrap', campus: 'Dantewada', withWhom: 'Scrap Room', source: 'Purchased', lastAction: 'Marked as scrap', lastUpdated: '2 weeks ago' },
  { id: 6, assetTag: 'NG-JASH-L-0421', type: 'Laptop', status: 'Allocated', campus: 'Jashpur', withWhom: 'Student: Rahul', source: 'Personal', lastAction: 'Allocated to student', lastUpdated: '1 day ago' },
  { id: 7, assetTag: 'NG-RAIP-L-0087', type: 'Laptop', status: 'Under Repair', campus: 'Raipur', withWhom: 'Vendor: FixIT', source: 'Purchased', lastAction: 'Sent for repair', lastUpdated: '4 days ago' },
  { id: 8, assetTag: 'NG-AMAR-L-0298', type: 'Laptop', status: 'Allocated', campus: 'Amaravati', withWhom: 'Student: Priya', source: 'Donated', lastAction: 'Allocated to student', lastUpdated: '6 days ago' },
  { id: 9, assetTag: 'NG-UDAI-L-0112', type: 'Laptop', status: 'In Stock', campus: 'Udaipur', withWhom: 'Store Room', source: 'Purchased', lastAction: 'Received from vendor', lastUpdated: '3 days ago' },
  { id: 10, assetTag: 'NG-JABA-L-0045', type: 'Laptop', status: 'Allocated', campus: 'Jabalpur', withWhom: 'Student: Ankit', source: 'Personal', lastAction: 'Allocated to student', lastUpdated: '1 week ago' },
  { id: 11, assetTag: 'NG-SARJ-L-0420', type: 'Laptop', status: 'In Courier', campus: 'Sarjapura', withWhom: 'Courier: DTDC', source: 'Purchased', lastAction: 'In transit to vendor', lastUpdated: '1 day ago' },
  { id: 12, assetTag: 'NG-PUNE-D-0156', type: 'Desktop', status: 'Allocated', campus: 'Pune', withWhom: 'Staff: IT Dept', source: 'Purchased', lastAction: 'Allocated to staff', lastUpdated: '2 days ago' },
  { id: 13, assetTag: 'NG-DHAR-L-0289', type: 'Laptop', status: 'In Stock', campus: 'Dharamshala', withWhom: 'Store Room', source: 'Donated', lastAction: 'Added to inventory', lastUpdated: '5 days ago' },
  { id: 14, assetTag: 'NG-BANG-L-0512', type: 'Laptop', status: 'Allocated', campus: 'Bangalore', withWhom: 'Student: Amit', source: 'Purchased', lastAction: 'Allocated to student', lastUpdated: '1 day ago' },
  { id: 15, assetTag: 'NG-JASH-L-0198', type: 'Laptop', status: 'Under Repair', campus: 'Jashpur', withWhom: 'Vendor: TechCare', source: 'Donated', lastAction: 'Sent for repair', lastUpdated: '3 days ago' },
];

// Ticket SLA Report Data
export const ticketSLAKPIs = [
  { count: 156, label: 'Total Tickets', icon: 'Ticket', bgColor: 'bg-blue-400' },
  { count: 45, label: 'Critical SLA', icon: 'AlertCircle', bgColor: 'bg-red-400' },
  { count: 68, label: 'Warning SLA', icon: 'Clock', bgColor: 'bg-yellow-400' },
  { count: 43, label: 'Normal SLA', icon: 'CheckCircle2', bgColor: 'bg-green-400' },
  { count: '8.5h', label: 'Avg Resolution', icon: 'Timer', bgColor: 'bg-purple-400' },
  { count: '92%', label: 'SLA Met', icon: 'TrendingUp', bgColor: 'bg-teal-400' },
];

// Movement Tracking Report Data
export const movementTrackingKPIs = [
  { count: 234, label: 'Total Movements', icon: 'TruckIcon', bgColor: 'bg-blue-400' },
  { count: 56, label: 'In Transit', icon: 'Navigation', bgColor: 'bg-purple-400' },
  { count: 178, label: 'Delivered', icon: 'CheckCircle2', bgColor: 'bg-green-400' },
  { count: 12, label: 'Pending Pickup', icon: 'Clock', bgColor: 'bg-yellow-400' },
  { count: '3.2 days', label: 'Avg Transit', icon: 'Timer', bgColor: 'bg-orange-400' },
  { count: 2, label: 'Delayed', icon: 'AlertTriangle', bgColor: 'bg-red-400' },
];

// Vendor + Courier Cost Report Data
export const vendorCourierCostKPIs = [
  { count: '₹12.5L', label: 'Total Cost', icon: 'DollarSign', bgColor: 'bg-blue-400' },
  { count: '₹8.2L', label: 'Vendor Cost', icon: 'Wrench', bgColor: 'bg-purple-400' },
  { count: '₹4.3L', label: 'Courier Cost', icon: 'Truck', bgColor: 'bg-orange-400' },
  { count: 45, label: 'Active Vendors', icon: 'Users', bgColor: 'bg-green-400' },
  { count: '₹15,680', label: 'Avg Repair', icon: 'Settings', bgColor: 'bg-yellow-400' },
  { count: '₹850', label: 'Avg Shipping', icon: 'Package', bgColor: 'bg-teal-400' },
];

// Parts Utilization Report Data
export const partsUtilizationKPIs = [
  { count: 1842, label: 'Total Parts', icon: 'Component', bgColor: 'bg-blue-400' },
  { count: 456, label: 'In Stock', icon: 'Archive', bgColor: 'bg-teal-400' },
  { count: 1286, label: 'Installed', icon: 'CheckCircle2', bgColor: 'bg-green-400' },
  { count: 100, label: 'Scrapped', icon: 'Trash2', bgColor: 'bg-red-400' },
  { count: '69%', label: 'Utilization', icon: 'PieChart', bgColor: 'bg-purple-400' },
  { count: '₹8.5L', label: 'Total Value', icon: 'DollarSign', bgColor: 'bg-orange-400' },
];

 
export const componentDetailsData = {
  'RAM-SARJ-8GB-2311-01': {
    // Basic Information
    componentTag: 'RAM-SARJ-8GB-2311-01',
    componentType: 'RAM',
    brand: 'Kingston',
    modelNumber: 'KVR26N19S8/8',
    specifications: '8GB DDR4 2666MHz SODIMM',
    serialNumber: 'KST8GB2666-SN12345',
    purchaseDate: '2023-11-15T00:00:00Z',
    warrantyExpiryDate: '2026-11-15T00:00:00Z',
    purchasePrice: 2400,
    vendorName: 'Tech Supplies India',
    
    // Source Information
    sourceType: 'NEW_PURCHASE',
    invoiceNumber: 'INV-2023-11-0156',
    purchaseOrderNumber: 'PO-2023-456',
    vendorDetails: 'Tech Supplies India, Mumbai\nGST: 27ABCDE1234F1Z5',
    
    // Current Status
    status: 'INSTALLED',
    locationType: 'INSTALLED',
    conditionNotes: 'Excellent condition, tested and working perfectly',
    
    // Location (if in stock)
    campus: 'Sarjapura',
    almirah: 'ALM-A1',
    shelf: '3B',
    
    // Installation details (if installed)
    currentDevice: {
      id: 1,
      tag: 'NG-SARJ-L-0315',
      type: 'Laptop',
      currentUser: 'Rahul Kumar',
      installationDate: '2024-01-15T00:00:00Z',
      location: 'Sarjapura Campus'
    },
    
    // Additional Details
    lastTestedDate: '2024-12-01T00:00:00Z',
    testedBy: 'Vijay Sharma',
    testResults: 'Memory test passed. No errors detected. Read/Write speed within expected range.',
    assignedTo: 'Hardware Department',
    remarks: 'Part of bulk purchase order. High-quality component suitable for student laptops.',
    
    // Journey/Timeline
    journey: [
      {
        type: 'ACQUIRED',
        description: 'Component purchased from Tech Supplies India',
        timestamp: '2023-11-15T10:30:00Z',
        location: 'Mumbai Warehouse',
        performedBy: 'Procurement Team',
        notes: 'Bulk order of 50 units',
        documents: [
          { name: 'Invoice INV-2023-11-0156.pdf', url: '#' },
          { name: 'Purchase Order.pdf', url: '#' }
        ]
      },
      {
        type: 'RECEIVED',
        description: 'Component received and stored at Sarjapura campus',
        timestamp: '2023-11-20T14:15:00Z',
        location: 'Sarjapura → ALM-A1 → Shelf 3B',
        performedBy: 'Inventory Manager - Suresh',
        notes: 'Quality check completed. All units in good condition.'
      },
      {
        type: 'TESTED',
        description: 'Component tested before installation',
        timestamp: '2024-01-10T11:00:00Z',
        location: 'Sarjapura Campus - Tech Lab',
        performedBy: 'Vijay Sharma',
        notes: 'Memtest86+ passed 4 iterations without errors'
      },
      {
        type: 'INSTALLED',
        description: 'Installed in laptop NG-SARJ-L-0315',
        timestamp: '2024-01-15T09:30:00Z',
        location: 'Sarjapura Campus',
        performedBy: 'Vijay Sharma',
        deviceTag: 'NG-SARJ-L-0315',
        reason: 'RAM upgrade from 4GB to 8GB'
      }
    ],
    
    // Previously installed in
    previousInstallations: [],
    
    // Storage history
    storageHistory: [
      {
        campus: 'Sarjapura',
        almirah: 'ALM-A1',
        shelf: '3B',
        from: '2023-11-20T14:15:00Z',
        to: '2024-01-15T09:30:00Z'
      }
    ],
    
    // Documents
    documents: [
      {
        id: 1,
        name: 'Purchase Invoice.pdf',
        type: 'INVOICE',
        mimeType: 'application/pdf',
        size: 245680,
        uploadedAt: '2023-11-20T00:00:00Z',
        url: '#'
      },
      {
        id: 2,
        name: 'Warranty Certificate.pdf',
        type: 'WARRANTY',
        mimeType: 'application/pdf',
        size: 156420,
        uploadedAt: '2023-11-20T00:00:00Z',
        url: '#'
      },
      {
        id: 3,
        name: 'Component Photo.jpg',
        type: 'PHOTO',
        mimeType: 'image/jpeg',
        size: 523140,
        uploadedAt: '2024-01-10T00:00:00Z',
        url: '#'
      }
    ],
    
    // Audit log
    auditLog: [
      {
        action: 'Component installed in device',
        user: 'Vijay Sharma',
        timestamp: '2024-01-15T09:30:00Z'
      },
      {
        action: 'Component tested',
        user: 'Vijay Sharma',
        timestamp: '2024-01-10T11:00:00Z'
      },
      {
        action: 'Component received and stored',
        user: 'Suresh Kumar',
        timestamp: '2023-11-20T14:15:00Z'
      },
      {
        action: 'Component record created',
        user: 'System',
        timestamp: '2023-11-15T10:30:00Z'
      }
    ]
  },
  
  'SSD-PUNE-512-1211-02': {
    componentTag: 'SSD-PUNE-512-1211-02',
    componentType: 'SSD',
    brand: 'Samsung',
    modelNumber: '970 EVO Plus',
    specifications: '512GB NVMe M.2 PCIe Gen 3.0 x4',
    serialNumber: 'S4EVNG0N123456Z',
    purchaseDate: '2021-12-10T00:00:00Z',
    warrantyExpiryDate: '2026-12-10T00:00:00Z',
    purchasePrice: 5800,
    vendorName: 'Prime Electronics',
    
    sourceType: 'NEW_PURCHASE',
    invoiceNumber: 'INV-2021-12-0892',
    purchaseOrderNumber: 'PO-2021-789',
    
    status: 'IN_STOCK',
    locationType: 'IN_STOCK',
    campus: 'Pune',
    almirah: 'ALM-B2',
    shelf: '1A',
    conditionNotes: 'Brand new, never used. Still in original packaging.',
    
    lastTestedDate: '2024-11-15T00:00:00Z',
    testedBy: 'Amit Patel',
    testResults: 'CrystalDiskInfo shows 100% health. Sequential read: 3500 MB/s, Write: 3200 MB/s',
    remarks: 'Reserved for high-performance workstations',
    
    journey: [
      {
        type: 'ACQUIRED',
        description: 'Component purchased from Prime Electronics',
        timestamp: '2021-12-10T10:00:00Z',
        location: 'Delhi Warehouse',
        performedBy: 'Procurement Team'
      },
      {
        type: 'RECEIVED',
        description: 'Component received and stored at Pune campus',
        timestamp: '2021-12-15T15:30:00Z',
        location: 'Pune → ALM-B2 → Shelf 1A',
        performedBy: 'Ravi Mehta'
      },
      {
        type: 'TESTED',
        description: 'Component tested and verified',
        timestamp: '2024-11-15T10:00:00Z',
        location: 'Pune Campus - Tech Lab',
        performedBy: 'Amit Patel',
        notes: 'Health check performed. SSD in perfect condition.'
      }
    ],
    
    previousInstallations: [],
    storageHistory: [
      {
        campus: 'Pune',
        almirah: 'ALM-B2',
        shelf: '1A',
        from: '2021-12-15T15:30:00Z',
        to: null
      }
    ],
    
    documents: [
      {
        id: 1,
        name: 'Purchase Invoice.pdf',
        type: 'INVOICE',
        mimeType: 'application/pdf',
        size: 198450,
        uploadedAt: '2021-12-15T00:00:00Z',
        url: '#'
      },
      {
        id: 2,
        name: 'Warranty Document.pdf',
        type: 'WARRANTY',
        mimeType: 'application/pdf',
        size: 142380,
        uploadedAt: '2021-12-15T00:00:00Z',
        url: '#'
      }
    ],
    
    auditLog: [
      {
        action: 'Component tested',
        user: 'Amit Patel',
        timestamp: '2024-11-15T10:00:00Z'
      },
      {
        action: 'Component received and stored',
        user: 'Ravi Mehta',
        timestamp: '2021-12-15T15:30:00Z'
      }
    ]
  },
  
  'MB-DANT-INTEL-1211-09': {
    componentTag: 'MB-DANT-INTEL-1211-09',
    componentType: 'MOTHERBOARD',
    brand: 'ASUS',
    modelNumber: 'PRIME H510M-E',
    specifications: 'Intel H510 Chipset, LGA 1200, Micro-ATX',
    serialNumber: 'MBASUS2021H510-45678',
    purchaseDate: '2021-12-05T00:00:00Z',
    warrantyExpiryDate: '2024-12-05T00:00:00Z',
    purchasePrice: 6500,
    vendorName: 'Component World',
    
    sourceType: 'EXTRACTED',
    sourceDeviceTag: 'NG-DANT-D-0089',
    sourceDeviceType: 'Desktop',
    sourceDeviceId: 89,
    extractionDate: '2024-10-15T00:00:00Z',
    extractionReason: 'DEVICE_SCRAP',
    extractionTechnician: 'Rohit Verma',
    
    status: 'SCRAP',
    locationType: 'IN_STOCK',
    campus: 'Dantewada',
    almirah: 'ALM-SCRAP',
    shelf: 'SCRAP-1',
    conditionNotes: 'Multiple capacitors blown. BIOS chip damaged. Not economical to repair.',
    
    lastTestedDate: '2024-10-16T00:00:00Z',
    testedBy: 'Rohit Verma',
    testResults: 'POST test failed. No display output. Damaged beyond repair.',
    remarks: 'To be sent to e-waste recycling facility',
    
    journey: [
      {
        type: 'ACQUIRED',
        description: 'Component purchased from Component World',
        timestamp: '2021-12-05T09:00:00Z',
        location: 'Raipur Warehouse',
        performedBy: 'Procurement Team'
      },
      {
        type: 'RECEIVED',
        description: 'Component received at Dantewada',
        timestamp: '2021-12-12T10:00:00Z',
        location: 'Dantewada → ALM-C1 → Shelf 2A',
        performedBy: 'Manoj Singh'
      },
      {
        type: 'INSTALLED',
        description: 'Installed in desktop NG-DANT-D-0089',
        timestamp: '2021-12-20T11:30:00Z',
        location: 'Dantewada Campus',
        performedBy: 'Manoj Singh',
        deviceTag: 'NG-DANT-D-0089'
      },
      {
        type: 'EXTRACTED',
        description: 'Extracted from desktop NG-DANT-D-0089',
        timestamp: '2024-10-15T14:00:00Z',
        location: 'Dantewada Campus',
        performedBy: 'Rohit Verma',
        deviceTag: 'NG-DANT-D-0089',
        reason: 'Device marked for scrap - motherboard failure'
      },
      {
        type: 'MARKED_SCRAP',
        description: 'Component marked as scrap',
        timestamp: '2024-10-16T15:00:00Z',
        location: 'Dantewada → ALM-SCRAP → SCRAP-1',
        performedBy: 'Rohit Verma',
        notes: 'Not economical to repair. Recommended for e-waste disposal.'
      }
    ],
    
    previousInstallations: [
      {
        id: 89,
        tag: 'NG-DANT-D-0089',
        type: 'Desktop',
        installedFrom: '2021-12-20T11:30:00Z',
        installedTo: '2024-10-15T14:00:00Z',
        removalReason: 'Device scrapped - component failure'
      }
    ],
    
    storageHistory: [
      {
        campus: 'Dantewada',
        almirah: 'ALM-SCRAP',
        shelf: 'SCRAP-1',
        from: '2024-10-16T15:00:00Z',
        to: null
      },
      {
        campus: 'Dantewada',
        almirah: 'ALM-C1',
        shelf: '2A',
        from: '2021-12-12T10:00:00Z',
        to: '2021-12-20T11:30:00Z'
      }
    ],
    
    documents: [
      {
        id: 1,
        name: 'Original Purchase Invoice.pdf',
        type: 'INVOICE',
        mimeType: 'application/pdf',
        size: 178920,
        uploadedAt: '2021-12-12T00:00:00Z',
        url: '#'
      },
      {
        id: 2,
        name: 'Scrap Assessment Report.pdf',
        type: 'TEST_REPORT',
        mimeType: 'application/pdf',
        size: 234560,
        uploadedAt: '2024-10-16T00:00:00Z',
        url: '#'
      },
      {
        id: 3,
        name: 'Damaged Component Photo.jpg',
        type: 'PHOTO',
        mimeType: 'image/jpeg',
        size: 689120,
        uploadedAt: '2024-10-16T00:00:00Z',
        url: '#'
      }
    ],
    
    auditLog: [
      {
        action: 'Component marked as scrap',
        user: 'Rohit Verma',
        timestamp: '2024-10-16T15:00:00Z'
      },
      {
        action: 'Component extracted from device',
        user: 'Rohit Verma',
        timestamp: '2024-10-15T14:00:00Z'
      },
      {
        action: 'Component tested',
        user: 'Rohit Verma',
        timestamp: '2024-10-16T09:00:00Z'
      },
      {
        action: 'Component installed in device',
        user: 'Manoj Singh',
        timestamp: '2021-12-20T11:30:00Z'
      }
    ]
  }
};

// Summary Cards Configuration
export const allocationsSummaryCards = [
  {
    id: 'total',
    label: 'Total Allocations',
    icon: 'UserPlus',
    valueColor: 'text-gray-900',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200',
    getValue: (data) => data.length,
  },
  {
    id: 'active',
    label: 'Active Allocations',
    icon: 'CheckCircle',
    valueColor: 'text-green-600',
    iconColor: 'text-green-500',
    borderColor: 'border-green-200',
    getValue: (data) => data.filter(a => a.isActive).length,
  },
  {
    id: 'returned',
    label: 'Returned',
    icon: 'XCircle',
    valueColor: 'text-gray-600',
    iconColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    getValue: (data) => data.filter(a => !a.isActive).length,
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    icon: 'Calendar',
    valueColor: 'text-purple-600',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-200',
    getValue: (data) => {
      const now = new Date();
      return data.filter(a => {
        const startDate = new Date(a.startDate);
        return startDate.getMonth() === now.getMonth() && 
               startDate.getFullYear() === now.getFullYear();
      }).length;
    },
  },
];

export const ticketsSummaryCards = [
  {
    id: 'total',
    label: 'TOTAL TICKETS',
    status: null,
    icon: 'Ticket',
    valueColor: 'text-blue-600',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200',
  },
  {
    id: 'open',
    label: 'OPEN',
    status: 'OPEN',
    icon: 'AlertCircle',
    valueColor: 'text-green-600',
    iconColor: 'text-green-500',
    borderColor: 'border-green-200',
  },
  {
    id: 'in_progress',
    label: 'IN PROGRESS',
    status: 'IN_PROGRESS',
    icon: 'Clock',
    valueColor: 'text-cyan-600',
    iconColor: 'text-cyan-500',
    borderColor: 'border-cyan-200',
  },
  {
    id: 'resolved',
    label: 'RESOLVED',
    status: 'RESOLVED',
    icon: 'CheckCircle2',
    valueColor: 'text-purple-600',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-200',
  },
  {
    id: 'raised',
    label: 'RAISED',
    status: 'RAISED',
    icon: 'XCircle',
    valueColor: 'text-gray-600',
    iconColor: 'text-gray-500',
    borderColor: 'border-gray-200',
  },
  {
    id: 'escalated',
    label: 'ESCALETED',
    status: 'ESCALATED',
    icon: 'Ban',
    valueColor: 'text-red-600',
    iconColor: 'text-red-500',
    borderColor: 'border-red-200',
  },
];

export const inTransitReturnsDummyData = [
  {
    id: 1,
    consignmentCode: 'CON-1021',
    assetTag:        'NG-LP-00451',
    model:           'Dell Latitude 5520',
    userName:        'Arjun Mehta',
    userEmail:       'arjun.mehta@ng.com',
    trackingId:      'DTDC-8834712',
    estimatedArrival:'02 Mar 2026',
  },
  {
    id: 2,
    consignmentCode: 'CON-1021',
    assetTag:        'NG-LP-00512',
    model:           'HP EliteBook 840 G8',
    userName:        'Arjun Mehta',
    userEmail:       'arjun.mehta@ng.com',
    trackingId:      'DTDC-8834712',
    estimatedArrival:'02 Mar 2026',
  },
  {
    id: 3,
    consignmentCode: 'CON-1027',
    assetTag:        'NG-LP-00389',
    model:           'Lenovo ThinkPad E15',
    userName:        'Priya Sharma',
    userEmail:       'priya.sharma@ng.com',
    trackingId:      'BLUEDART-99112',
    estimatedArrival:'04 Mar 2026',
  },
  {
    id: 4,
    consignmentCode: 'CON-1031',
    assetTag:        'NG-LP-00601',
    model:           'Apple MacBook Air M2',
    userName:        'Rohan Verma',
    userEmail:       'rohan.verma@ng.com',
    trackingId:      'ECOM-47762301',
    estimatedArrival:'05 Mar 2026',
  },
  {
    id: 5,
    consignmentCode: 'CON-1031',
    assetTag:        'NG-LP-00744',
    model:           'Apple MacBook Pro M3',
    userName:        'Rohan Verma',
    userEmail:       'rohan.verma@ng.com',
    trackingId:      'ECOM-47762301',
    estimatedArrival:'05 Mar 2026',
  },
];

// Campus Incharge
export const campusInchargeFormFields = [
  {
    name: 'campus',
    label: 'Campus',
    type: 'text',
    placeholder: 'e.g. PUNE',
    required: true,
  },
  // IT Coordinator
  {
    name: 'itCoordinatorName',
    label: 'IT Coordinator Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
  },
  {
    name: 'itCoordinatorEmail',
    label: 'IT Coordinator Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'itCoordinatorPhone',
    label: 'IT Coordinator Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
  },
  // Operation
  {
    name: 'operationName',
    label: 'Operation Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
  },
  {
    name: 'operationEmail',
    label: 'Operation Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'operationPhone',
    label: 'Operation Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
  },
  // IT Lead
  {
    name: 'itLeadName',
    label: 'IT Lead Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
  },
  {
    name: 'itLeadEmail',
    label: 'IT Lead Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'itLeadPhone',
    label: 'IT Lead Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
  },
];

export const campusInchargeData = [
  {
    id: 1,
    campus: 'PUNE',
    itCoordinator: {
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@navgurukul.org',
      phone: '+91 98765 43210',
    },
    operation: {
      name: 'Priya Deshmukh',
      email: 'priya.d@navgurukul.org',
      phone: '+91 98765 43211',
    },
    itLead: {
      name: 'Amit Patil',
      email: 'amit.patil@navgurukul.org',
      phone: '+91 98765 43212',
    },
  },
  {
    id: 2,
    campus: 'DELHI',
    itCoordinator: {
      name: 'Vikram Singh',
      email: 'vikram.singh@navgurukul.org',
      phone: '+91 98765 43213',
    },
    operation: {
      name: 'Anjali Kumar',
      email: 'anjali.k@navgurukul.org',
      phone: '+91 98765 43214',
    },
    itLead: {
      name: 'Rahul Verma',
      email: 'rahul.verma@navgurukul.org',
      phone: '+91 98765 43215',
    },
  },
];

export const campusInchargeColumns = [
  { key: 'campus', label: 'CAMPUS', align: 'start' },
  { key: 'itCoordinator', label: 'IT COORDINATOR', align: 'start' },
  { key: 'operation', label: 'OPERATION', align: 'start' },
  { key: 'itLead', label: 'IT LEAD', align: 'start' },
  { key: 'actions', label: 'ACTION', align: 'center' },
];

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

export const returnAssetFields = [
  {
    name: 'assetId',
    label: 'Asset ID',
    type: 'text',
    required: false,
    disabled: true,
    placeholder: '',
  },
  {
    name: 'assetSource',
    label: 'Asset Source (Campus)',
    type: 'api-autocomplete',
    required: true,
    placeholder: 'Search and select campus',
    apiUrl: `${baseUrl}/campuses`,
    queryKey: ['campuses'],
    labelKey: 'campusName',
    valueKey: 'campusName',
  },
  {
    name: 'campusItCoordinator',
    label: 'Campus IT Co-ordinator Email',
    type: 'email',
    required: true,
    placeholder: 'IT coordinator email',
  },
  {
    name: 'exactAddress',
    label: 'Exact Address',
    type: 'textarea',
    required: true,
    placeholder: 'Enter exact pickup / drop address...',
  },
  {
    name: 'vendorName',
    label: 'Vendor Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Bluedart',
  },
  {
    name: 'vendorReceipt',
    label: 'Vendor Receipt (Photo / PDF)',
    type: 'file',
    required: true,
    accept: 'image/*,application/pdf',
    multiple: true,
    hint: 'Accepted formats: JPG, PNG, PDF',
  },
  {
    name: 'managerEmail',
    label: 'Manager Email',
    type: 'email',
    required: true,
    placeholder: 'Manager email to loop in',
  },
  {
    name: 'expectedDeliveryDate',
    label: 'Expected Delivery Date',
    type: 'date',
    required: true,
    placeholder: 'Select date',
  },
];

export const extendLeaseFields = [
  {
    name: 'leaseType',
    label: 'Lease Type',
    type: 'radio',
    required: true,
    options: [
      { label: 'Bond', value: 'BOND' },
      { label: 'Deposit', value: 'DEPOSIT' },
    ],
  },
  {
    name: 'extendUntil',
    label: 'Extend Until',
    type: 'date',
    required: true,
    placeholder: 'Select date',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Reason for extending lease...',
  },
];

export const allocationSummaryCardsConfig = [
  { 
    id: 'total',
    label: 'Total Allocations', 
    dataKey: 'totalAllocations',
    iconName: 'BarChart2',
    valueColor: 'text-gray-900', 
    iconColor: 'text-gray-500', 
    borderColor: 'border-gray-200' 
  },
  { 
    id: 'active',
    label: 'Active Allocations', 
    dataKey: 'activeAllocations',
    iconName: 'CheckCircle',
    valueColor: 'text-green-600', 
    iconColor: 'text-green-500', 
    borderColor: 'border-green-200' 
  },
  { 
    id: 'returned',
    label: 'Returned', 
    dataKey: 'returnedAllocations',
    iconName: 'XCircle',
    valueColor: 'text-gray-600', 
    iconColor: 'text-gray-500', 
    borderColor: 'border-gray-200' 
  },
  { 
    id: 'thisMonth',
    label: 'This Month', 
    dataKey: 'thisMonthAllocations',
    iconName: 'Calendar',
    valueColor: 'text-purple-600', 
    iconColor: 'text-purple-500', 
    borderColor: 'border-purple-200' 
  },
];
