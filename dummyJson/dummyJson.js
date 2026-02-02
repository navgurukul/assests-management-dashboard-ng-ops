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

// Documents/Bills Data - For linking to components
export const documentsLibrary = [
  {
    id: 'DOC-001',
    name: 'Invoice - Amazon Basics - Jan 2024',
    type: 'INVOICE',
    vendor: 'Amazon',
    date: '2024-01-15',
    amount: '₹45,000',
    invoiceNumber: 'AMZ-2024-001',
    componentsLinked: 25,
    filePath: '/documents/invoice-amazon-jan-2024.pdf',
    uploadedBy: 'Admin',
    uploadedDate: '2024-01-15'
  },
  {
    id: 'DOC-002',
    name: 'Invoice - Dell Computers - Feb 2024',
    type: 'INVOICE',
    vendor: 'Dell India',
    date: '2024-02-20',
    amount: '₹1,20,000',
    invoiceNumber: 'DELL-2024-002',
    componentsLinked: 10,
    filePath: '/documents/invoice-dell-feb-2024.pdf',
    uploadedBy: 'Admin',
    uploadedDate: '2024-02-20'
  },
  {
    id: 'DOC-003',
    name: 'Invoice - Kingston RAM Bulk Purchase',
    type: 'INVOICE',
    vendor: 'Kingston Distributor',
    date: '2024-03-05',
    amount: '₹75,000',
    invoiceNumber: 'KING-2024-003',
    componentsLinked: 50,
    filePath: '/documents/invoice-kingston-mar-2024.pdf',
    uploadedBy: 'Admin',
    uploadedDate: '2024-03-05'
  },
  {
    id: 'DOC-004',
    name: 'Warranty Certificate - HP',
    type: 'WARRANTY',
    vendor: 'HP India',
    date: '2024-01-10',
    amount: 'N/A',
    invoiceNumber: 'HP-WAR-2024-001',
    componentsLinked: 5,
    filePath: '/documents/warranty-hp-jan-2024.pdf',
    uploadedBy: 'Admin',
    uploadedDate: '2024-01-10'
  },
  {
    id: 'DOC-005',
    name: 'Invoice - Samsung SSD 512GB - Bulk Order',
    type: 'INVOICE',
    vendor: 'Samsung Authorized Dealer',
    date: '2023-12-10',
    amount: '₹85,000',
    invoiceNumber: 'SAM-SSD-2023-045',
    componentsLinked: 30,
    filePath: '/documents/invoice-samsung-dec-2023.pdf',
    uploadedBy: 'Admin',
    uploadedDate: '2023-12-10'
  },
  {
    id: 'DOC-006',
    name: 'Invoice - Seagate HDD 1TB - Annual Purchase',
    type: 'INVOICE',
    vendor: 'Seagate Distributor India',
    date: '2023-11-15',
    amount: '₹95,000',
    invoiceNumber: 'SEA-HDD-2023-089',
    componentsLinked: 40,
    filePath: '/documents/invoice-seagate-nov-2023.pdf',
    uploadedBy: 'Admin',
    uploadedDate: '2023-11-15'
  }
];

export const dashboardCards = [
  { id: 1, count: 792, label: 'Active', icon: 'CheckCircle2', bgColor: 'bg-teal-400' },
  { id: 2, count: 105, label: 'In Stock', icon: 'Archive', bgColor: 'bg-blue-400' },
  { id: 3, count: 321, label: 'Needs Repair', icon: 'Settings', bgColor: 'bg-slate-500' },
  { id: 4, count: 22, label: 'In Repair', icon: 'Wrench', bgColor: 'bg-red-400' },
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
  { id: 1, ticketId: 'TKT-SARJ-251119-R-001', type: 'Repair', sla: '02h', slaStatus: 'critical', status: 'IN PROGRESS', updated: 'Today', actionTakenBy: 'IT coordinator' },
  { id: 2, ticketId: 'TKT-PUNE-251119-C-002', type: 'Change', sla: '11h', slaStatus: 'normal', status: 'ESCALATED', updated: '12 Jan', actionTakenBy: 'Operation associate' },
  { id: 3, ticketId: 'TKT-HIMA-241119-D-001', type: 'Dispute', sla: '19h', slaStatus: 'normal', status: 'OPEN', updated: '11 Jan', actionTakenBy: 'Teach lead' },
  { id: 4, ticketId: 'TKT-JASH-231119-N-004', type: 'New', sla: '28h', slaStatus: 'normal', status: 'PENDING APPROVAL', updated: '10 Jan', actionTakenBy: 'IT coordinator' },
  { id: 5, ticketId: 'TKT-DANT-221119-R-005', type: 'Repair', sla: '05h', slaStatus: 'warning', status: 'IN PROGRESS', updated: '09 Jan', actionTakenBy: 'Repairing team/company' },
  { id: 6, ticketId: 'TKT-UDAI-201119-C-006', type: 'Change', sla: '15h', slaStatus: 'normal', status: 'OPEN', updated: '08 Jan', actionTakenBy: 'Operation associate' },
  { id: 7, ticketId: 'TKT-RAIP-191119-D-007', type: 'Dispute', sla: '32h', slaStatus: 'normal', status: 'PENDING APPROVAL', updated: '07 Jan', actionTakenBy: 'IT coordinator' },
  { id: 8, ticketId: 'TKT-AMAR-181119-N-008', type: 'New', sla: '01h', slaStatus: 'critical', status: 'ESCALATED', updated: 'Today', actionTakenBy: 'Repairing team/company' },
  { id: 9, ticketId: 'TKT-JABA-171119-R-009', type: 'Repair', sla: '08h', slaStatus: 'warning', status: 'IN PROGRESS', updated: 'Yesterday', actionTakenBy: 'IT coordinator' },
  { id: 10, ticketId: 'TKT-DHAR-161119-C-010', type: 'Change', sla: '24h', slaStatus: 'normal', status: 'OPEN', updated: '05 Jan', actionTakenBy: 'Teach lead' },
];

export const assetsPageData = [
  { id: 1, campus: 'Sarjapura', lws: 45, lis: 12, lr: 8, lnw: 5, lwfhe: 3, lct: 2, laslfh: 0, lsdb: 1, lsjop: 2, lngin: 1, total: 79 },
  { id: 2, campus: 'Pune', lws: 38, lis: 10, lr: 15, lnw: 8, lwfhe: 2, lct: 1, laslfh: 0, lsdb: 0, lsjop: 1, lngin: 1, total: 76 },
  { id: 3, campus: 'Dharamshala', lws: 28, lis: 8, lr: 12, lnw: 6, lwfhe: 1, lct: 1, laslfh: 0, lsdb: 1, lsjop: 0, lngin: 0, total: 57 },
  { id: 4, campus: 'Bangalore', lws: 52, lis: 15, lr: 18, lnw: 10, lwfhe: 4, lct: 2, laslfh: 0, lsdb: 1, lsjop: 1, lngin: 2, total: 105 },
  { id: 5, campus: 'Dantewada', lws: 22, lis: 6, lr: 9, lnw: 4, lwfhe: 1, lct: 1, laslfh: 0, lsdb: 0, lsjop: 0, lngin: 0, total: 43 },
  { id: 6, campus: 'Jashpur', lws: 35, lis: 9, lr: 11, lnw: 7, lwfhe: 2, lct: 1, laslfh: 0, lsdb: 1, lsjop: 1, lngin: 1, total: 68 },
  { id: 7, campus: 'Raipur', lws: 30, lis: 8, lr: 14, lnw: 5, lwfhe: 1, lct: 1, laslfh: 0, lsdb: 0, lsjop: 0, lngin: 0, total: 59 },
  { id: 8, campus: 'Amaravati', lws: 18, lis: 5, lr: 8, lnw: 3, lwfhe: 1, lct: 1, laslfh: 2, lsdb: 0, lsjop: 0, lngin: 0, total: 38 },
  { id: 9, campus: 'Udaipur', lws: 25, lis: 7, lr: 10, lnw: 6, lwfhe: 2, lct: 0, laslfh: 0, lsdb: 0, lsjop: 0, lngin: 1, total: 51 },
  { id: 10, campus: 'Jabalpur', lws: 20, lis: 6, lr: 7, lnw: 4, lwfhe: 1, lct: 0, laslfh: 0, lsdb: 0, lsjop: 0, lngin: 0, total: 38 },
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

 
/**
 * MODAL CONFIGURATIONS
 * Each modal type has a configuration object defining whih fields to display
 * Fields can be toggled on/off by adding/removing from the array
 */

export const allocationModalConfig = {
  id: 'allocation-modal',
  title: '🔧 Allocation Modal',
  subtitle: 'Assign Asset to User',
  fields: [
    {
      id: 'asset_tag',
      type: 'display',
      label: 'Assign Asset',
      displayValue: 'NG-SARJ-L-0210',
      description: 'The asset to be assigned',
    },
    {
      id: 'user_search',
      type: 'search',
      label: 'Select User',
      placeholder: 'Search Student: Suresh Kumar',
      description: 'Search and select the user to assign this asset to',
      required: true,
      minLength: 3,
    },
    {
      id: 'reason',
      type: 'select',
      label: 'Reason',
      options: [
        { value: 'replacement', label: 'Replacement ▼' },
        { value: 'new_allocation', label: 'New Allocation' },
        { value: 'repair', label: 'Repair' },
      ],
      placeholder: 'Select reason',
      required: true,
    },
    {
      id: 'preview',
      type: 'display',
      label: 'Preview',
      displayValue: 'Current Owner: Meena → New Owner: Suresh, Location change: WITH_USER(Meena) → WITH_USER(Suresh)',
      description: 'Review the changes before confirming',
    },
  ],
  actionButtons: [
    { id: 'cancel', label: 'Cancel', variant: 'secondary' },
    { id: 'confirm', label: 'Confirm Assign', variant: 'primary' },
  ],
};

export const componentInstallModalConfig = {
  id: 'component-install-modal',
  title: '⚙️ Component Action Modal — install',
  subtitle: 'Install Component on Device',
  fields: [
    {
      id: 'component_tag',
      type: 'display',
      label: 'Install Component',
      displayValue: 'RAM-SARJ-8GB-2311-01',
      description: 'The component to be installed',
    },
    {
      id: 'device_search',
      type: 'search',
      label: 'Select Device',
      placeholder: 'Search: Lenovo T480 / NG-PUNE-L-0210',
      description: 'Find and select the device to install component on',
      required: true,
      minLength: 3,
    },
    {
      id: 'slot',
      type: 'select',
      label: 'Slot',
      options: [
        { value: 'slot_a', label: 'Slot A ▼' },
        { value: 'slot_b', label: 'Slot B' },
        { value: 'slot_c', label: 'Slot C' },
      ],
      placeholder: 'Select Slot',
      required: true,
    },
    {
      id: 'notes',
      type: 'textarea',
      label: 'Notes',
      placeholder: 'Add any additional notes here...',
      maxLength: 200,
    },
  ],
  actionButtons: [
    { id: 'cancel', label: 'Cancel', variant: 'secondary' },
    { id: 'install', label: 'Install Component', variant: 'primary' },
  ],
};

export const componentStripModalConfig = {
  id: 'component-strip-modal',
  title: '🔌 Component Action Modal — strip from laptop',
  subtitle: 'Remove Component from Device',
  fields: [
    {
      id: 'component_to_remove',
      type: 'display',
      label: 'Remove Component',
      displayValue: 'RAM 8GB from NG-SARJ-L-0315',
      description: 'The component to be removed',
    },
    {
      id: 'removal_reason',
      type: 'select',
      label: 'Reason',
      options: [
        { value: 'reuse', label: 'Reuse' },
        { value: 'replace', label: 'Replace' },
        { value: 'scrap', label: 'Scrap ▼' },
      ],
      placeholder: 'Select reason',
      required: true,
    },
    {
      id: 'new_status',
      type: 'display',
      label: 'New Status After Removal',
      displayValue: 'In Stock',
      description: 'The status of the component after removal',
    },
  ],
  actionButtons: [
    { id: 'confirm_removal', label: 'Confirm Removal', variant: 'danger' },
    { id: 'cancel', label: 'Cancel', variant: 'secondary' },
  ],
};
 
// Component Details Data
// ============================================
// REPORTS DATA
// ============================================

// Allocation Summary Report Data
export const allocationSummaryKPIs = [
  { count: 1486, label: 'Total Assets', icon: 'Package', bgColor: 'bg-blue-400' },
  { count: 792, label: 'Allocated', icon: 'CheckCircle2', bgColor: 'bg-teal-400' },
  { count: 105, label: 'In Stock', icon: 'Archive', bgColor: 'bg-blue-400' },
  { count: 22, label: 'Under Repair', icon: 'Wrench', bgColor: 'bg-yellow-400' },
  { count: 18, label: 'In Courier', icon: 'Truck', bgColor: 'bg-purple-400' },
  { count: '3.2%', label: 'Scrap %', icon: 'Trash2', bgColor: 'bg-red-400' },
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

