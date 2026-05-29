import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Columns that should not be exported
const EXCLUDE_FROM_EXPORT = ['actions'];

export function useAssetExport() {

  const getExportData = useCallback((assetsData, visibleColumns) => {
    // Filter only visible columns, exclude actions column
    const exportColumns = visibleColumns.filter(
      (col) => !EXCLUDE_FROM_EXPORT.includes(col.key)
    );

    const headers = exportColumns.map((col) => col.label);

    const rows = assetsData.map((asset) =>
      exportColumns.map((col) => {
        const value = asset[col.key];
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        // Handle allocatedTo object - convert to "FirstName LastName (email)"
        if (col.key === 'allocatedTo' && typeof value === 'object') {
          const { firstName, lastName, email } = value;
          return `${firstName} ${lastName} (${email})`;
        }
        return String(value);
      })
    );

    return { headers, rows, exportColumns };
  }, []);

  // PDF Export
  const exportToPDF = useCallback((assetsData, visibleColumns, filename = 'assets') => {
    const { headers, rows } = getExportData(assetsData, visibleColumns);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assets Report', 14, 15);

    // Subtitle — date and total record count
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Total Records: ${rows.length}`,
      14,
      22
    );

    // Add table to PDF
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 28,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color for headers
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Light gray for alternate rows
      },
      margin: { top: 28, left: 14, right: 14 },
    });

    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [getExportData]);

  // Excel Export
  const exportToExcel = useCallback((assetsData, visibleColumns, filename = 'assets') => {
    const { headers, rows } = getExportData(assetsData, visibleColumns);

    // Combine headers with rows
    const worksheetData = [headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-set column widths
    const colWidths = headers.map((header, i) => {
      const maxLen = Math.max(
        header.length,
        ...rows.map((row) => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLen + 2, 40) }; // Max width: 40 characters
    });
    worksheet['!cols'] = colWidths;

    // Make header row bold
    headers.forEach((_, i) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: '3B82F6' } },
        };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

    XLSX.writeFile(
      workbook,
      `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }, [getExportData]);

  return { exportToPDF, exportToExcel };
}