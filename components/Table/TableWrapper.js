"use client";
import { useState, useMemo } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { Plus } from "lucide-react";
import TableFooter from "./TableFooter";
import Pagination from "@/components/atoms/Pagination";
import CustomButton from "@/components/atoms/CustomButton";

export default function TableWrapper({ 
  data = [],
  columns = [],
  title = "",
  renderCell,
  itemsPerPage = 10,
  showPagination = true,
  classNames = {},
  ariaLabel = "Data table",
  onRowClick,
  showCreateButton = false,
  onCreateClick,
  // Server-side pagination props
  serverPagination = false,
  paginationData = null, // { page, limit, totalCount, totalPages, hasNextPage, hasPreviousPage }
  onPageChange,
  onPageSizeChange,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  // Calculate client-side pagination (when serverPagination is false)
  const totalPages = serverPagination 
    ? (paginationData?.totalPages || 1)
    : Math.ceil(data.length / pageSize);
  
  const paginatedData = useMemo(() => {
    if (serverPagination) return data; // Data is already paginated from server
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize, serverPagination]);

  const handlePageChange = (page) => {
    if (serverPagination && onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (serverPagination && onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setPageSize(newSize);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  const displayData = showPagination ? paginatedData : data;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {showCreateButton && (
            <CustomButton
              text="Create"
              icon={Plus}
              onClick={onCreateClick}
              variant="primary"
              size="md"
            />
          )}
        </div>
      )}
      
      <Table 
        aria-label={ariaLabel}
        classNames={{
          wrapper: "shadow-none border-none",
          base: "overflow-visible",
          table: "border-collapse",
          thead: "[&>tr]:first:shadow-none",
          th: "bg-gray-50 text-gray-700 font-semibold text-sm h-12 border-b-2 border-gray-200",
          td: "text-gray-600 text-sm h-16 border-b border-gray-200",
          tr: "hover:bg-gray-50 transition-colors",
          ...classNames
        }}
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn 
              key={column.key}
              align={column.align || "start"}
              className={column.className || "text-left"}
            >
              {column.label}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody items={displayData}>
          {(item) => (
            <TableRow 
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={onRowClick ? "cursor-pointer" : ""}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {renderCell ? renderCell(item, column.key) : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Use new Pagination component for server-side pagination, or TableFooter for client-side */}
      {serverPagination && showPagination ? (
        <Pagination
          currentPage={paginationData?.page || 1}
          totalPages={paginationData?.totalPages || 1}
          totalCount={paginationData?.totalCount || 0}
          pageSize={paginationData?.limit || pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={true}
          showPageInfo={true}
        />
      ) : (
        <TableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPagination={showPagination}
        />
      )}
    </div>
  );
}
