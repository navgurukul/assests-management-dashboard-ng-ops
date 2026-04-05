"use client";
import { useState } from "react";
import TableWrapper from "./TableWrapper";
import StateHandler from "@/components/atoms/StateHandler";
import useFetch from "@/app/hooks/query/useFetch";
import config from "@/app/config/env.config";

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

function transformRow(item) {
  return {
    id: item.campus,
    campus: item.campus,
    lws: item.LWS ?? 0,
    lis: item.LIS ?? 0,
    lct: item.LCT ?? 0,
    lr: item.LR ?? 0,
    subTotal: item.sub_total ?? 0,
    lnw: item.LNW ?? 0,
    lwfhe: item.LWFHE ?? 0,
    lsdb: item.LSD_B ?? 0,
    grandTotal: item.grand_total ?? 0,
  };
}

export default function AssetsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: response, isLoading, isError, error } = useFetch({
    url: config.endpoints.assets.consolidatedByCampus,
    queryKey: ["assets", "consolidated-by-campus"],
  });

  const tableData = (response?.data ?? []).map(transformRow);
  const totalCount = tableData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = tableData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "campus":
        return <span className="font-semibold text-gray-900">{cellValue}</span>;
      case "subTotal":
      case "grandTotal":
        return <span className="font-bold text-blue-600">{cellValue}</span>;
      default:
        return <span className="text-gray-700 text-center">{cellValue}</span>;
    }
  };

  if (isLoading || isError) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading consolidated data..."
        errorMessage="Failed to load consolidated campus data"
      />
    );
  }

  return (
    <TableWrapper
      data={paginatedData}
      columns={columns}
      title="Consolidated Laptop Data - Navgurukul"
      renderCell={renderCell}
      margin="m-0"
      shadow="shadow-none"
      itemsPerPage={pageSize}
      showPagination={true}
      serverPagination={true}
      paginationData={{
        page: currentPage,
        limit: pageSize,
        totalCount,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      }}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      ariaLabel="Consolidated laptop table"
    />
  );
}
