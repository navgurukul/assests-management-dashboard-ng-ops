"use client";

import React from 'react';
import SelectableTable from '@/components/molecules/SelectableTable';

const ASSIGNEE_COLUMNS = [
  { key: 'name',     label: 'Name',     cellClassName: 'text-gray-800' },
  { key: 'email',    label: 'Email' },
  { key: 'position', label: 'Position' },
  { key: 'campus',   label: 'Campus' },
];

export default function AssigneeSelector({
  selectedAssignee,
  setSelectedAssignee,
  showAssignTable,
  setShowAssignTable,
  assigneeRows,
  campusInchargeLoading,
}) {
  return (
    <SelectableTable
      label="Assign To"
      columns={ASSIGNEE_COLUMNS}
      rows={assigneeRows}
      rowKey="email"
      selectedRow={selectedAssignee}
      onSelectRow={setSelectedAssignee}
      getSelectedLabel={(row) => `${row.name} (${row.email})`}
      isLoading={campusInchargeLoading}
      emptyMessage="No coordinators available."
      showTable={showAssignTable}
      onToggleTable={() => setShowAssignTable((prev) => !prev)}
    />
  );
}
