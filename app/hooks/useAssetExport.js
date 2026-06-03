import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import {
  formatAssetStatus,
  formatCondition,
} from '@/app/utils/dataTransformers';

// Columns that should not be exported
const EXCLUDE_FROM_EXPORT = ['actions'];

const CSV_COLUMN_MAP = {
  status: (row, headersIndexMap) => formatAssetStatus(row[headersIndexMap['status']]),
  condition: (row, headersIndexMap) => formatCondition(row[headersIndexMap['condition']]),
  assetTag: 'assetTag',
  type: 'assetTypeName',
  brand: 'brand',
  model: 'model',
  serialNumber: 'serialNumber',
  campus: 'campusName',
  location: 'locationName',
  allocatedTo: (row, headersIndexMap) => {
    const firstName = row[headersIndexMap['allocationUserFirstName']] || '';
    const lastName = row[headersIndexMap['allocationUserLastName']] || '';
    const email = row[headersIndexMap['allocationUserEmail']] || '';
    if (!firstName && !lastName && !email) return 'N/A';
    return `${firstName} ${lastName} (${email})`.trim();
  }
};

export function useAssetExport() {

  // PDF Export 
  const exportToPDF = useCallback(async (filters = {}, visibleColumns, filename = 'assets') => {
    try {
      const params = new URLSearchParams();
      if (filters.campus) {
        params.append('campusId', filters.campus);
      }
      
      const endpoint = `${config.endpoints.assets.export}?${params.toString()}`;
      
      // Request file as blob (contentType: 'text/csv' instructs get.js fetch client to parse response as Blob)
      const fileBlob = await apiService.get(endpoint, {
        contentType: 'text/csv',
      });
      
      const csvText = await fileBlob.text();
      const parsed = Papa.parse(csvText, { skipEmptyLines: true });
      const csvHeaders = parsed.data[0] || [];
      const csvRows = parsed.data.slice(1);

      const headersIndexMap = csvHeaders.reduce((acc, header, idx) => {
        acc[header] = idx;
        return acc;
      }, {});

      const exportColumns = visibleColumns.filter(
        (col) => !EXCLUDE_FROM_EXPORT.includes(col.key)
      );

      const headers = exportColumns.map((col) => col.label);

      const rows = csvRows.map((row) =>
        exportColumns.map((col) => {
          const mappingRule = CSV_COLUMN_MAP[col.key] || col.key;
          
          let val;
          if (typeof mappingRule === 'function') {
            val = mappingRule(row, headersIndexMap);
          } else {
            const valIndex = headersIndexMap[mappingRule];
            val = valIndex !== undefined ? row[valIndex] : 'N/A';
          }

          if (val === null || val === undefined || val === '') return 'N/A';
          if (val === 'true') return 'Yes';
          if (val === 'false') return 'No';
          return val;
        })
      );

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
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }, []);

  // CSV Export
  const exportToCSV = useCallback(async (filters = {}, campusName = 'all') => {
    try {
      const params = new URLSearchParams();
      if (filters.campus) {
        params.append('campusId', filters.campus);
      }
      
      const endpoint = `${config.endpoints.assets.export}?${params.toString()}`;
      
      // Request file as blob (contentType: 'text/csv' instructs get.js fetch client to parse response as Blob)
      const fileBlob = await apiService.get(endpoint, {
        contentType: 'text/csv',
      });
      
      // Handle browser download
      const downloadUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const dateString = new Date().toISOString().split('T')[0];
      const normalizedCampusName = campusName.toLowerCase().replace(/\s+/g, '-');
      link.setAttribute('download', `assets-${normalizedCampusName}-${dateString}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    }
  }, []);

  return { exportToPDF, exportToCSV };
}