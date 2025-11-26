"use client";
import { Chip } from "@nextui-org/react";
import TableWrapper from "./TableWrapper";
import { assetsTableData } from '@/dummyJson/dummyJson';

const statusColorMap = {
  Active: "success",
  "In Storage": "primary",
  "Needs Repair": "warning",
  "In Repair": "danger",
};

const columns = [
  { key: "assetId", label: "ASSET ID" },
  { key: "name", label: "NAME" },
  { key: "category", label: "CATEGORY" },
  { key: "status", label: "STATUS" },
  { key: "location", label: "LOCATION" },
  { key: "assignedTo", label: "ASSIGNED TO" },
  { key: "purchaseDate", label: "PURCHASE DATE" },
];

export default function AssetsTable() {
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "assetId":
        return <span className="font-medium">{cellValue}</span>;
      case "status":
        return (
          <Chip 
            color={statusColorMap[cellValue]} 
            variant="flat"
            size="sm"
          >
            {cellValue}
          </Chip>
        );
      default:
        return cellValue;
    }
  };

  return (
    <TableWrapper
      data={assetsTableData}
      columns={columns}
      title="Assets Overview"
      renderCell={renderCell}
      itemsPerPage={10}
      showPagination={true}
      ariaLabel="Assets table"
    />
  );
}
