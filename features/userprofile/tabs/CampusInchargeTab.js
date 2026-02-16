'use client';

import { Building2, Edit, Trash2, Plus, Mail, Phone } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';

// Sample data - this should eventually come from an API
const campusInchargeData = [
  {
    id: 1,
    campus: 'PUNE',
    itCoordinator: {
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@navgurukul.org',
      phone: '+91 98765 43210'
    },
    operation: {
      name: 'Priya Deshmukh',
      email: 'priya.d@navgurukul.org',
      phone: '+91 98765 43211'
    },
    itLead: {
      name: 'Amit Patil',
      email: 'amit.patil@navgurukul.org',
      phone: '+91 98765 43212'
    }
  },
  {
    id: 2,
    campus: 'DELHI',
    itCoordinator: {
      name: 'Vikram Singh',
      email: 'vikram.singh@navgurukul.org',
      phone: '+91 98765 43213'
    },
    operation: {
      name: 'Anjali Kumar',
      email: 'anjali.k@navgurukul.org',
      phone: '+91 98765 43214'
    },
    itLead: {
      name: 'Rahul Verma',
      email: 'rahul.verma@navgurukul.org',
      phone: '+91 98765 43215'
    }
  }
];

// Define columns configuration
const columns = [
  { key: 'campus', label: 'CAMPUS', align: 'start' },
  { key: 'itCoordinator', label: 'IT COORDINATOR', align: 'start' },
  { key: 'operation', label: 'OPERATION', align: 'start' },
  { key: 'itLead', label: 'IT LEAD', align: 'start' },
  { key: 'actions', label: 'ACTION', align: 'center' },
];

export default function CampusInchargeTab() {
  // Render person details (Name, Email, Phone)
  const renderPersonDetails = (person) => (
    <div className="space-y-1.5">
      <div className="font-semibold text-gray-900">{person.name}</div>
      <div className="text-gray-600 flex items-center gap-1.5 text-xs">
        <Mail className="w-3.5 h-3.5" />
        {person.email}
      </div>
      <div className="text-gray-600 flex items-center gap-1.5 text-xs">
        <Phone className="w-3.5 h-3.5" />
        {person.phone}
      </div>
    </div>
  );

  // Handle cell rendering
  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case 'campus':
        return <span className="font-bold text-gray-900 uppercase">{item.campus}</span>;
      case 'itCoordinator':
        return renderPersonDetails(item.itCoordinator);
      case 'operation':
        return renderPersonDetails(item.operation);
      case 'itLead':
        return renderPersonDetails(item.itLead);
      case 'actions':
        return (
          <div className="flex justify-center gap-3">
            <button
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-150 hover:scale-110"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit
              }}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-150 hover:scale-110"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      default:
        return item[columnKey];
    }
  };

  const handleCreateClick = () => {
    // Handle create campus
    console.log('Create new campus');
  };

  return (
    <div>
      <TableWrapper
        data={campusInchargeData}
        columns={columns}
        title="Campus Incharge"
        renderCell={renderCell}
        showPagination={false}
        ariaLabel="Campus Incharge table"
        showCreateButton={true}
        onCreateClick={handleCreateClick}
      />
       
    </div>
  );
}
