export const menuItems = [
  { name: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  { name: 'Assets', icon: 'Package', path: '/assets' },
  { name: 'Components', icon: 'Component', path: '/components' },
  { name: 'Allocations', icon: 'Share2', path: '/allocations' },
  { name: 'Tickets', icon: 'Ticket', path: '/tickets' },
  { name: 'Consignments', icon: 'Archive', path: '/consignments' },
  { name: 'Reports', icon: 'FileText', path: '/reports' },
  { name: 'Settings', icon: 'Settings', path: '/settings' },
];

export const dashboardCards = [
  { id: 1, count: 792, label: 'Active', icon: 'CheckCircle2', bgColor: 'bg-green-100' },
  { id: 2, count: 278, label: 'In Storage', icon: 'Archive', bgColor: 'bg-blue-100' },
  { id: 3, count: 321, label: 'Needs Repair', icon: 'Settings', bgColor: 'bg-gray-800' },
  { id: 4, count: 22, label: 'In Repair', icon: 'Wrench', bgColor: 'bg-gray-400' },
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
  ['Satlapur', 40, 30, 28, 20, 2, 3, 1, 4, 3, 1, 1],
  ['Udaipur', 60, 45, 18, 12, 3, 5, 2, 7, 5, 2, 1],
];

export const assetsTableData = [
  { id: 1, assetId: 'AST-001', name: 'Dell Laptop', category: 'Computer', status: 'Active', location: 'Campus', assignedTo: 'John Doe', purchaseDate: '2023-01-15' },
  { id: 2, assetId: 'AST-002', name: 'HP Monitor', category: 'Display', status: 'Active', location: 'Campus', assignedTo: 'Jane Smith', purchaseDate: '2023-02-20' },
  { id: 3, assetId: 'AST-003', name: 'Logitech Mouse', category: 'Peripheral', status: 'In Storage', location: 'Remote', assignedTo: 'Unassigned', purchaseDate: '2023-03-10' },
  { id: 4, assetId: 'AST-004', name: 'MacBook Pro', category: 'Computer', status: 'Active', location: 'Campus', assignedTo: 'Robert Brown', purchaseDate: '2023-01-25' },
  { id: 5, assetId: 'AST-005', name: 'Samsung Printer', category: 'Printer', status: 'Needs Repair', location: 'Campus', assignedTo: 'Unassigned', purchaseDate: '2022-11-05' },
  { id: 6, assetId: 'AST-006', name: 'iPad Pro', category: 'Tablet', status: 'Active', location: 'Remote', assignedTo: 'Sarah Wilson', purchaseDate: '2023-04-12' },
  { id: 7, assetId: 'AST-007', name: 'Wireless Keyboard', category: 'Peripheral', status: 'In Repair', location: 'Campus', assignedTo: 'Unassigned', purchaseDate: '2023-02-28' },
  { id: 8, assetId: 'AST-008', name: 'Canon Camera', category: 'Camera', status: 'Active', location: 'Campus', assignedTo: 'Michael Davis', purchaseDate: '2023-05-01' },
  { id: 9, assetId: 'AST-009', name: 'Projector', category: 'Display', status: 'In Storage', location: 'Campus', assignedTo: 'Unassigned', purchaseDate: '2022-12-15' },
  { id: 10, assetId: 'AST-010', name: 'Dell Desktop', category: 'Computer', status: 'Active', location: 'Campus', assignedTo: 'Emily Johnson', purchaseDate: '2023-03-20' },
];

export const ticketsTableData = [
  { id: 1, ticketId: 'TKT-SARJ-251119-R-001', type: 'Repair', sla: '02h', slaStatus: 'critical', status: 'IN PROGRESS' },
  { id: 2, ticketId: 'TKT-PUNE-251119-C-002', type: 'Change', sla: '11h', slaStatus: 'normal', status: 'ESCALATED' },
  { id: 3, ticketId: 'TKT-HIMA-241119-D-001', type: 'Dispute', sla: '19h', slaStatus: 'normal', status: 'OPEN' },
  { id: 4, ticketId: 'TKT-JASH-231119-N-004', type: 'New', sla: '28h', slaStatus: 'normal', status: 'PENDING APPROVAL' },
  { id: 5, ticketId: 'TKT-DANT-221119-R-005', type: 'Repair', sla: '05h', slaStatus: 'warning', status: 'IN PROGRESS' },
  { id: 6, ticketId: 'TKT-UDAI-201119-C-006', type: 'Change', sla: '15h', slaStatus: 'normal', status: 'OPEN' },
  { id: 7, ticketId: 'TKT-RAIP-191119-D-007', type: 'Dispute', sla: '32h', slaStatus: 'normal', status: 'PENDING APPROVAL' },
  { id: 8, ticketId: 'TKT-AMAR-181119-N-008', type: 'New', sla: '01h', slaStatus: 'critical', status: 'ESCALATED' },
  { id: 9, ticketId: 'TKT-JABA-171119-R-009', type: 'Repair', sla: '08h', slaStatus: 'warning', status: 'IN PROGRESS' },
  { id: 10, ticketId: 'TKT-DHAR-161119-C-010', type: 'Change', sla: '24h', slaStatus: 'normal', status: 'OPEN' },
];

export const assetsPageData = [
  { id: 1, assetTag: 'NG-SARJ-L-0315', type: 'Laptop', campus: 'Sarjapura', status: 'Repair', location: 'Vendor: TechCare', actions: 'View' },
  { id: 2, assetTag: 'NG-PUNE-L-0210', type: 'Laptop', campus: 'Pune', status: 'Allocated', location: 'Student: Meena', actions: 'View' },
  { id: 3, assetTag: 'NG-HIMA-L-0144', type: 'Laptop', campus: 'Himachal', status: 'In Stock', location: 'Store Room', actions: 'Assign' },
  { id: 4, assetTag: 'NG-DANT-L-0029', type: 'Laptop', campus: 'Dantewada', status: 'Scrap', location: 'Scrap Room', actions: 'Details' },
  { id: 5, assetTag: 'NG-JABA-L-0421', type: 'Laptop', campus: 'Jabalpur', status: 'Allocated', location: 'Student: Rahul', actions: 'View' },
  { id: 6, assetTag: 'NG-UDAI-L-0156', type: 'Laptop', campus: 'Udaipur', status: 'In Stock', location: 'Store Room', actions: 'Assign' },
  { id: 7, assetTag: 'NG-RAIP-L-0087', type: 'Laptop', campus: 'Raipur', status: 'Repair', location: 'Vendor: FixIT', actions: 'View' },
  { id: 8, assetTag: 'NG-AMAR-L-0298', type: 'Laptop', campus: 'Amaravati', status: 'Allocated', location: 'Student: Priya', actions: 'View' },
  { id: 9, assetTag: 'NG-DHAR-L-0112', type: 'Laptop', campus: 'Dharamshala', status: 'In Stock', location: 'Store Room', actions: 'Assign' },
  { id: 10, assetTag: 'NG-KISH-L-0045', type: 'Laptop', campus: 'Kishangarh', status: 'Scrap', location: 'Scrap Room', actions: 'Details' },
];

export const componentsPageData = [
  { id: 1, componentTag: 'RAM-SARJ-8GB-2311-01', type: 'RAM', status: 'Working', installedOn: 'NG-SARJ-L-0315', action: 'Remove' },
  { id: 2, componentTag: 'SSD-PUNE-512-1211-02', type: 'SSD', status: 'In Stock', installedOn: '-', action: 'Install' },
  { id: 3, componentTag: 'MB-DANT-INTEL-1211-09', type: 'Motherboard', status: 'Scrap', installedOn: '-', action: 'Details' },
  { id: 4, componentTag: 'RAM-HIMA-16GB-1811-03', type: 'RAM', status: 'Working', installedOn: 'NG-HIMA-L-0144', action: 'Remove' },
  { id: 5, componentTag: 'HDD-JABA-1TB-0911-04', type: 'HDD', status: 'In Stock', installedOn: '-', action: 'Install' },
  { id: 6, componentTag: 'SSD-UDAI-256-1511-05', type: 'SSD', status: 'Working', installedOn: 'NG-UDAI-L-0156', action: 'Remove' },
  { id: 7, componentTag: 'RAM-RAIP-8GB-2011-06', type: 'RAM', status: 'In Stock', installedOn: '-', action: 'Install' },
  { id: 8, componentTag: 'MB-AMAR-AMD-1411-07', type: 'Motherboard', status: 'Working', installedOn: 'NG-AMAR-L-0298', action: 'Remove' },
  { id: 9, componentTag: 'SSD-DHAR-512-1011-08', type: 'SSD', status: 'Scrap', installedOn: '-', action: 'Details' },
  { id: 10, componentTag: 'RAM-KISH-4GB-0511-10', type: 'RAM', status: 'In Stock', installedOn: '-', action: 'Install' },
];

export const consignmentsPageData = [
  { id: 1, code: 'CON-SARJ-241119-REPR-001', courier: 'DTDC', fromTo: 'Sarj -> Vendor', status: 'IN TRANSIT' },
  { id: 2, code: 'CON-PUNE-221119-TRNF-003', courier: 'Bluedart', fromTo: 'Pune -> Himachal', status: 'DELIVERED' },
  { id: 3, code: 'CON-HIMA-201119-REPR-005', courier: 'Delhivery', fromTo: 'Himachal -> Vendor', status: 'IN TRANSIT' },
  { id: 4, code: 'CON-DANT-181119-TRNF-007', courier: 'DTDC', fromTo: 'Dantewada -> Pune', status: 'DELIVERED' },
  { id: 5, code: 'CON-JABA-151119-REPR-009', courier: 'Bluedart', fromTo: 'Jabalpur -> Vendor', status: 'IN TRANSIT' },
  { id: 6, code: 'CON-UDAI-131119-TRNF-011', courier: 'Delhivery', fromTo: 'Udaipur -> Raipur', status: 'DELIVERED' },
  { id: 7, code: 'CON-RAIP-111119-REPR-013', courier: 'DTDC', fromTo: 'Raipur -> Vendor', status: 'IN TRANSIT' },
  { id: 8, code: 'CON-AMAR-091119-TRNF-015', courier: 'Bluedart', fromTo: 'Amaravati -> Dharamshala', status: 'DELIVERED' },
  { id: 9, code: 'CON-DHAR-071119-REPR-017', courier: 'Delhivery', fromTo: 'Dharamshala -> Vendor', status: 'IN TRANSIT' },
  { id: 10, code: 'CON-KISH-051119-TRNF-019', courier: 'DTDC', fromTo: 'Kishangarh -> Sarjapura', status: 'DELIVERED' },
];

// Ticket Details Data
export const ticketDetailsData = {
  1: {
    ticketId: 'TKT-SARJ-251119-R-001',
    type: 'Repair',
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
  },
  2: {
    ticketId: 'TKT-PUNE-251119-C-002',
    type: 'Change',
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
  },
};

// Asset Details Data
export const assetDetailsData = {
  1: {
    assetTag: 'NG-SARJ-L-0315',
    type: 'Laptop',
    campus: 'Sarjapura',
    status: 'Repair',
    slaRisk: 'High (RED)',
    specs: {
      brand: 'Lenovo ThinkPad T480',
      cpu: 'i5',
      ram: '8GBx2',
      ssd: '256GB',
      purchase: '₹45,000',
      donor: 'CSR Fund',
    },
    components: [
      {
        componentTag: 'RAM-SARJ-8GB-2311-01',
        type: 'RAM',
        status: 'Working',
        installedOn: '03 Oct 2025',
        slot: 'SLOT A',
      },
      {
        componentTag: 'RAM-SARJ-8GB-2311-02',
        type: 'RAM',
        status: 'Working',
        installedOn: '03 Oct 2025',
        slot: 'SLOT B',
      },
    ],
    movementLog: [
      { date: '21 Nov', event: 'Sent to Vendor (Consignment: CON-SARJ-2111-REPR-001)' },
      { date: '19 Nov', event: 'Ticket Raised by Student A' },
      { date: '10 Sep', event: 'Allocated to Student A' },
    ],
  },
  2: {
    assetTag: 'NG-PUNE-L-0210',
    type: 'Laptop',
    campus: 'Pune',
    status: 'Allocated',
    slaRisk: 'Low (GREEN)',
    specs: {
      brand: 'HP Pavilion',
      cpu: 'i7',
      ram: '16GB',
      ssd: '512GB',
      purchase: '₹55,000',
      donor: 'Corporate Donation',
    },
    components: [
      {
        componentTag: 'RAM-PUNE-16GB-1211-01',
        type: 'RAM',
        status: 'Working',
        installedOn: '15 Sep 2025',
        slot: 'SLOT A',
      },
    ],
    movementLog: [
      { date: '15 Sep', event: 'Allocated to Student: Meena' },
      { date: '01 Sep', event: 'Received from Vendor' },
      { date: '20 Aug', event: 'Purchased and added to inventory' },
    ],
  },
};
