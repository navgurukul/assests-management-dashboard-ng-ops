"use client";
import { useState, useMemo } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { Plus } from "lucide-react";
import "@/components/atoms/Loader.css";
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
  createButtonText = "Create",
  onCreateClick,
  // Filter props
  filterComponent,
  columnSelectorComponent,
  activeFiltersComponent,
  searchComponent,
  toggleCardsComponent,
  onShowAll,
  showAllButtonText = "Show All",
  // Server-side pagination props
  serverPagination = false,
  paginationData = null,
  onPageChange,
  onPageSizeChange,
  // Loading state
  isLoading = false,
  margin = "m-5",
  shadow = "shadow-md",
  emptyContent,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const totalPages = useMemo(() => {
    if (serverPagination) return paginationData?.totalPages || 1;
    return Math.ceil(data.length / pageSize) || 1;
  }, [serverPagination, paginationData, data.length, pageSize]);

  const paginatedData = useMemo(() => {
    if (serverPagination) return data;
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize, serverPagination]);

  const handlePageChange = (page) => {
    if (serverPagination && onPageChange) onPageChange(page);
    else setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    if (serverPagination && onPageSizeChange) onPageSizeChange(newSize);
    else { setPageSize(newSize); setCurrentPage(1); }
  };

  const displayData = showPagination ? paginatedData : data;

  const tableClassNames = {
    ...classNames,
    wrapper: `shadow-none border-none max-h-[60vh] overflow-y-auto pt-0 ${classNames.wrapper || ""}`,
    base: `min-w-full ${classNames.base || ""}`,
    table: `border-collapse min-w-full ${classNames.table || ""}`,
    thead: `[&>tr]:first:shadow-none ${classNames.thead || ""}`,
    // Header: reduced from 11/12/13/14px → 10/11/12/13px
    th: `bg-[var(--surface-soft)] text-[var(--foreground)] font-semibold text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] h-12 border-b-2 border-[var(--border)] whitespace-nowrap sticky top-0 z-10 ${classNames.th || ""}`,
    // Body cells: reduced from 11/12/13/14px → 10/11/12/13px, row height 14→12
    td: `text-[var(--foreground)] text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] h-12 border-b border-[var(--border)] ${classNames.td || ""}`,
    tr: `hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] data-[hover=true]:bg-[var(--surface-soft)] data-[hover=true]:text-[var(--foreground)] transition-colors ${classNames.tr || ""}`,
  };

  return (
    <div className={`bg-(--surface) p-3 pb-0 sm:p-6 sm:pb-0 rounded-lg ${shadow} ${margin}`}>

      {/* Title – reduced from 2xl/3xl/[32px] → xl/2xl/[28px] */}
      {title && (
        <div className="mb-2">
          <h2 className="text-xl sm:text-2xl md:text-[26px] font-semibold text-gray-800 ml-4 font-(family-name:--font-poppins)">
            {title}
          </h2>
        </div>
      )}

      {/* Search, Filter, Column Selector, and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-4 mb-2">
        <div className="w-full sm:flex-1 sm:max-w-md">
          {searchComponent}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {toggleCardsComponent}
          {onShowAll && (
            <CustomButton
              text={showAllButtonText}
              icon={null}
              onClick={onShowAll}
              variant="secondary"
              size="md"
              className=""
            />
          )}
          {filterComponent}
          {columnSelectorComponent}
          {showCreateButton && (
            <CustomButton
              text={createButtonText}
              icon={Plus}
              onClick={onCreateClick}
              variant="primary"
              size="md"
              className=""
            />
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersComponent && (
        <div className="mb-4">{activeFiltersComponent}</div>
      )}

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-3 px-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="loader"></div>
              {/* Loading text reduced */}
              <p className="text-[11px] text-gray-600">Loading...</p>
            </div>
          </div>
        ) : displayData.length === 0 ? (
          emptyContent || (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-[11px] sm:text-[12px] font-semibold text-gray-700 mb-1">No data found</p>
            </div>
          )
        ) : (
          displayData.map((item) => (
            <div
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={`bg-(--surface) border border-(--border) rounded-lg p-3 ${
                onRowClick ? "cursor-pointer hover:bg-(--surface-soft)" : ""
              } transition-colors`}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-start justify-between gap-2 py-1.5 border-b border-(--border) last:border-b-0"
                >
                  {/* Mobile label: reduced from 10/11px → 9/10px */}
                  <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 w-2/5 shrink-0 pt-0.5">
                    {column.label}
                  </span>
                  {/* Mobile value: reduced from 11/12px → 10/11px */}
                  <span className="text-[10px] sm:text-[11px] text-foreground text-right w-3/5 wrap-break-word">
                    {renderCell ? renderCell(item, column.key) : item[column.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto min-h-[60vh] relative">
        <Table aria-label={ariaLabel} classNames={tableClassNames} isHeaderSticky>
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
          <TableBody
            items={isLoading ? [] : displayData}
            emptyContent={
              isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="loader"></div>
                    <p className="text-[11px] sm:text-[12px] text-gray-600">Loading...</p>
                  </div>
                </div>
              ) : emptyContent || (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <p className="text-[11px] sm:text-[12px] font-semibold text-gray-700 mb-1">No data found</p>
                </div>
              )
            }
          >
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
      </div>

      {/* Pagination – reduced via className overrides passed down */}
      <div className="w-full bg-white z-20 sticky bottom-0 left-0">
        <Pagination
          currentPage={serverPagination ? (paginationData?.page || 1) : currentPage}
          totalPages={serverPagination ? (paginationData?.totalPages || 1) : totalPages}
          totalCount={serverPagination ? (paginationData?.totalCount || 0) : data.length}
          pageSize={serverPagination ? (paginationData?.limit || pageSize) : pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={true}
          showPageInfo={true}
          // Pass size hint so Pagination can render smaller buttons
          size="sm"
          className="text-[10px] sm:text-[11px] md:text-[12px]"
        />
      </div>
    </div>
  );
}