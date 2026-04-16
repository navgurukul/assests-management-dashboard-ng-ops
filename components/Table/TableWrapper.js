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
  columnSelectorComponent, // New prop for column selector
  activeFiltersComponent, // New prop for filter chips
  searchComponent, // New prop for search bar
  toggleCardsComponent, // New prop for toggle summary cards button
  onShowAll, // New prop for Show All button handler
  showAllButtonText = "Show All",
  // Server-side pagination props
  serverPagination = false,
  paginationData = null, // { page, limit, totalCount, totalPages, hasNextPage, hasPreviousPage }
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
  const tableClassNames = {
    ...classNames,
    wrapper: `shadow-none border-none max-h-[60vh] overflow-y-auto pt-0 ${classNames.wrapper || ""}`,
    base: `min-w-full ${classNames.base || ""}`,
    table: `border-collapse min-w-full ${classNames.table || ""}`,
    thead: `[&>tr]:first:shadow-none ${classNames.thead || ""}`,
    th: `bg-[var(--surface-soft)] text-[var(--foreground)] font-semibold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] h-14 border-b-2 border-[var(--border)] whitespace-nowrap sticky top-0 z-10 ${classNames.th || ""}`,
    td: `text-[var(--foreground)] text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] h-14 border-b border-[var(--border)] ${classNames.td || ""}`,
    tr: `hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] data-[hover=true]:bg-[var(--surface-soft)] data-[hover=true]:text-[var(--foreground)] transition-colors ${classNames.tr || ""}`,
  };

  return (
    <div className={`bg-(--surface) p-3 pb-0 sm:p-6 sm:pb-0 rounded-lg ${shadow} ${margin}`}>
      {/* Title/Heading Section */}
      {title && (
        <div className="mb-2">
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-semibold text-gray-800 ml-4 font-[family-name:var(--font-poppins)]">{title}</h2>
        </div>
      )}
      
      {/* Search, Filter, Column Selector, and Create Button Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-4 mb-2">
        {/* Search – full width on mobile */}
        <div className="w-full sm:flex-1 sm:max-w-md">
          {searchComponent}
        </div>
        
        {/* Buttons – wrap on mobile */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {toggleCardsComponent}
          {onShowAll && (
            <CustomButton
              text={showAllButtonText}
              onClick={onShowAll}
              variant="secondary"
              size="md"
              className="px-2! py-0.5! text-xs! sm:px-3! sm:py-1.5! sm:text-sm!"
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
              className="px-2! py-0.5! text-xs! sm:px-3! sm:py-1.5! sm:text-sm!"
            />
          )}
        </div>
      </div>
      
      {/* Active Filters Section */}
      {activeFiltersComponent && (
        <div className="mb-4">
          {activeFiltersComponent}
        </div>
      )}
      
      {/* Mobile Card List – visible only on xs screens */}
      <div className="sm:hidden space-y-3 px-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="loader"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : displayData.length === 0 ? (
          emptyContent ? emptyContent : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-sm sm:text-base font-semibold text-gray-700 mb-1">No data found</p>
            </div>
          )
        ) : (
          displayData.map((item) => (
            <div
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={`bg-(--surface) border border-(--border) rounded-lg p-3 ${
                onRowClick ? 'cursor-pointer hover:bg-(--surface-soft)' : ''
              } transition-colors`}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-start justify-between gap-2 py-1.5 border-b border-(--border) last:border-b-0"
                >
                  <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 w-2/5 shrink-0 pt-0.5">
                    {column.label}
                  </span>
                  <span className="text-[11px] sm:text-[12px] text-foreground text-right w-3/5 wrap-break-word">
                    {renderCell ? renderCell(item, column.key) : item[column.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Table Container – hidden on mobile, visible on sm+ */}
      <div className="hidden sm:block overflow-x-auto">
        <Table 
          aria-label={ariaLabel}
          classNames={tableClassNames}
          isHeaderSticky
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
          <TableBody 
            items={isLoading ? [] : displayData}
            emptyContent={
              isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="loader"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                </div>
              ) : emptyContent ? emptyContent : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <p className="text-sm sm:text-base font-semibold text-gray-700 mb-1">No data found</p>
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
