"use client";
import React from "react";
import { useRouter } from 'next/navigation';
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

function transformRow(item, index) {
  return {
    id: `${item.campus}_${index}`, // Unique ID using campus name and index
    campusId: item.campusId,
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
  const router = useRouter();

  const { data: response, isLoading, isError, error } = useFetch({
    url: config.endpoints.assets.consolidatedByCampus,
    queryKey: ["assets", "consolidated-by-campus"],
  });

  // Fetch asset types to dynamically resolve Laptop's ID
  const { data: assetTypesData } = useFetch({
    url: '/asset-types',
    queryKey: ['asset-types'],
  });

  const laptopTypeId = React.useMemo(() => {
    const types = assetTypesData?.data || [];
    const laptop = types.find((t) => t.name?.toLowerCase() === 'laptop');
    return laptop?.id || null;
  }, [assetTypesData]);

  const tableData = React.useMemo(() => {
    const rows = response?.data || [];
    return rows.map(transformRow);
  }, [response?.data]);

  // Function to handle cell clicks and navigate to assets page with filters
  const handleCellClick = (item, columnKey) => {
    const cellValue = item[columnKey];

    // Don't allow clicks on total row or zero values
    if (item.id === "total-row" || cellValue === 0) return;

    const queryParams = new URLSearchParams();

    if (item.campusId) {
      queryParams.set('campusId', item.campusId);
    }

    // Add ownedBy filter based on the column clicked
    const columnToOwnedByMapping = {
      lws: 'lws',
      lis: 'lis',
      lct: 'lct',
      lr: 'lr',
      lnw: 'lnw',
      lwfhe: 'lwfhe',
      lsdb: 'lsd/b',
    };

    if (columnToOwnedByMapping[columnKey]) {
      queryParams.set('ownedBy', columnToOwnedByMapping[columnKey]);
    }

    // Dashboard consolidated data is Laptop-only — keep assets page filter consistent
    if (laptopTypeId) {
      queryParams.set('type', laptopTypeId);
    }

    // Navigate to assets page with filters
    const queryString = queryParams.toString();
    router.push(`/assets${queryString ? `?${queryString}` : ''}`);
  };

  // Calculate totals across all rows
  const totals = tableData.reduce(
    (acc, row) => {
      acc.lws += row.lws || 0;
      acc.lis += row.lis || 0;
      acc.lct += row.lct || 0;
      acc.lr += row.lr || 0;
      acc.subTotal += row.subTotal || 0;
      acc.lnw += row.lnw || 0;
      acc.lwfhe += row.lwfhe || 0;
      acc.lsdb += row.lsdb || 0;
      acc.grandTotal += row.grandTotal || 0;
      return acc;
    },
    {
      id: "total-row",
      campus: "Total",
      lws: 0,
      lis: 0,
      lct: 0,
      lr: 0,
      subTotal: 0,
      lnw: 0,
      lwfhe: 0,
      lsdb: 0,
      grandTotal: 0,
    }
  );

  // Append totals row at the bottom
  const finalTableData = [...tableData];
  if (tableData.length > 0) {
    finalTableData.push(totals);
  }

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];
    const isTotalRow = item.id === "total-row";

    // Helper to determine if cell should be clickable
    const isClickable = !isTotalRow && cellValue > 0 && laptopTypeId && ['lws', 'lis', 'lct', 'lr', 'lnw', 'lwfhe', 'lsdb'].includes(columnKey);

    if (isTotalRow) {
      if (columnKey === "campus") {
        return <span className="font-extrabold text-blue-800 uppercase">TOTAL</span>;
      }
      return <span className="font-extrabold text-blue-800">{cellValue}</span>;
    }

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
        return (
          <span
            className={`text-gray-700 text-center ${
              isClickable
                ? 'cursor-pointer hover:text-blue-600 hover:underline transition-colors font-medium'
                : ''
            }`}
            onClick={isClickable ? () => handleCellClick(item, columnKey) : undefined}
            title={isClickable ? `Click to view ${columnKey.toUpperCase()} assets in ${item.campus}` : ''}
          >
            {cellValue}
          </span>
        );
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
      data={finalTableData}
      columns={columns}
      title="Consolidated Laptop Data"
      renderCell={renderCell}
      margin="m-0"
      shadow="shadow-none"
      showPagination={false}
      ariaLabel="Consolidated laptop table"
    />
  );
}
