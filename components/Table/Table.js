"use client";
import { Chip } from "@nextui-org/react";
import TableWrapper from "./TableWrapper";
import { assetsPageData } from '@/dummyJson/dummyJson';

const statusColorMap = {
  Active: "success",
  "In Storage": "primary",
  "Needs Repair": "warning",
  "In Repair": "danger",
};

const columns = [
  { key: "campus", label: "Campus" },
  { key: "lws", label: "LWS" },
  { key: "lis", label: "LIS" },
  { key: "lct", label: "LCT" },
  { key: "lr", label: "LR" },
  { key: "subTotal", label: "Sub Total" },
  { key: "lnw", label: "LNW" },
  { key: "lwfhe", label: "LWFHE" },
  { key: "lsdb", label: "LSD/B" },
  { key: "grandTotal", label: "Grand Total" },
];

export default function AssetsTable() {
  const tableData = assetsPageData.map((item) => {
    const subTotal = (item.lws || 0) + (item.lis || 0) + (item.lct || 0) + (item.lr || 0);
    const grandTotal = subTotal + (item.lnw || 0) + (item.lwfhe || 0) + (item.lsdb || 0);

    return {
      ...item,
      subTotal,
      grandTotal,
    };
  });

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "campus":
        return <span className="font-semibold text-gray-900">{cellValue}</span>;
      case "subTotal":
      case "grandTotal":
        return <span className="font-bold text-blue-600">{cellValue}</span>;
      case "lws":
      case "lis":
      case "lct":
      case "lr":
      case "lnw":
      case "lwfhe":
      case "lsdb":
        return <span className="text-gray-700 text-center">{cellValue}</span>;
      default:
        return cellValue;
    }
  };

  return (
    <TableWrapper
      data={tableData}
      columns={columns}
      title="Consolidated laptop Data - Navgurukul"
      renderCell={renderCell}
      itemsPerPage={10}
      showPagination={true}
      ariaLabel="Consolidated laptop table"
    />
  );
}
