'use client';

import React, { useState } from 'react';
import { managerListData } from '@/dummyJson/dummyJson';
import TableWrapper from '@/components/Table/TableWrapper';
import { Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

const managerColumns = [
  { key: 'user', label: 'NAME', align: 'start' },
  { key: 'role', label: 'ROLE', align: 'start' },
  { key: 'status', label: 'STATUS', align: 'start' },
];

export default function ManagerListTab() {
  const [managers, setManagers] = useState(managerListData);

  const handleCreateManager = () => {
    console.log('Create Manager Clicked');
  };

  const renderCell = (manager, columnKey) => {
    switch (columnKey) {
      case 'user':
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-(--theme-light) text-(--theme-main) flex items-center justify-center font-bold">
              {manager.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-foreground">{manager.name}</p>
              <span className="text-xs text-(--muted) flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {manager.email}
              </span>
            </div>
          </div>
        );
      case 'role':
        return (
          <span className="flex items-center gap-1.5 text-(--muted)">
            <Shield className="w-3.5 h-3.5" />
            {manager.role}
          </span>
        );
      case 'status':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              manager.status === 'Active'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {manager.status === 'Active' ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {manager.status}
          </span>
        );
      default:
        return manager[columnKey];
    }
  };

  return ( 
      <TableWrapper
        data={managers}
        columns={managerColumns}
        title="Manager List"
        renderCell={renderCell}
        showPagination={false}
        ariaLabel="Manager List table"
        showCreateButton={true}
        onCreateClick={handleCreateManager}
        createButtonText="Create Manager"
        margin="m-0"
        shadow="shadow-none"
      /> 
  );
}
