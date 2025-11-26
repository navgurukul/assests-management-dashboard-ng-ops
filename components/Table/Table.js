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
  { key: "lr", label: "LR" },
  { key: "lnw", label: "LNW" },
  { key: "lwfhe", label: "LWFHE" },
  { key: "lct", label: "LCT" },
  { key: "laslfh", label: "LASLFH" },
  { key: "lsdb", label: "LSD/B" },
  { key: "lsjop", label: "LSJOP" },
  { key: "lngin", label: "LNGIN" },
  { key: "total", label: "Total" },
];

export default function AssetsTable() {
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "campus":
        return <span className="font-semibold text-gray-900">{cellValue}</span>;
      case "total":
        return <span className="font-bold text-blue-600">{cellValue}</span>;
      case "lws":
      case "lis":
      case "lr":
      case "lnw":
      case "lwfhe":
      case "lct":
      case "laslfh":
      case "lsdb":
      case "lsjop":
      case "lngin":
        return <span className="text-gray-700 text-center">{cellValue}</span>;
      default:
        return cellValue;
    }
  };

  return (
    <TableWrapper
      data={assetsPageData}
      columns={columns}
      title="Consolidated laptop Data - Navgurukul"
      renderCell={renderCell}
      itemsPerPage={10}
      showPagination={true}
      ariaLabel="Consolidated laptop table"
    />
  );
}
