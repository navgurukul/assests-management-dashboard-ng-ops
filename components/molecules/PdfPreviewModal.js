'use client';

import React, { useRef } from 'react';
import Modal from '@/components/molecules/Modal';
import CustomButton from '@/components/atoms/CustomButton';

export default function PdfPreviewModal({
  isOpen,
  onClose,
  title = 'PDF Preview',
  documentTitle = 'Receipt',
  documentCode,
  date,
  destinationName,
  destinationAddress,
  sourceName,
  sourceAddress,
  toLabel = 'To (Destination)',
  fromLabel = 'From (Source)',
  filename = 'Document.pdf',
}) {
  const pdfRef = useRef(null);

  const handleDownloadPdf = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = pdfRef.current;
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="large">
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div
          ref={pdfRef}
          className="bg-white p-12 rounded border border-gray-200"
          style={{ minHeight: '1000px', backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#1f2937' }}
        >
          {/* Header */}
          <div className="text-center border-b pb-8 mb-12" style={{ borderColor: '#e5e7eb' }}>
            <h1 className="text-4xl font-bold uppercase tracking-wider" style={{ color: '#1f2937' }}>
              {documentTitle}
            </h1>
            <p className="text-xl font-medium mt-4" style={{ color: '#6b7280' }}>
              Code: {documentCode || 'N/A'}
            </p>
            <p className="text-xl font-medium mt-2" style={{ color: '#6b7280' }}>
              Date: {date ? new Date(date).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* Addresses Section */}
          <div className="flex flex-col gap-24 mb-16">
            <div className="p-8 border rounded" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>
                {toLabel}
              </h3>
              <p className="font-semibold text-3xl mb-2" style={{ color: '#1f2937' }}>
                {destinationName}
              </p>
              <p className="text-2xl leading-relaxed whitespace-pre-wrap" style={{ color: '#4b5563' }}>
                {destinationAddress}
              </p>
            </div>
            <div className="p-8 border rounded mt-12" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>
                {fromLabel}
              </h3>
              <p className="font-semibold text-3xl mb-2" style={{ color: '#1f2937' }}>
                {sourceName}
              </p>
              <p className="text-2xl leading-relaxed whitespace-pre-wrap" style={{ color: '#4b5563' }}>
                {sourceAddress}
              </p>
            </div>
          </div>

          <div className="mt-32 text-center pt-8 border-t" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-lg" style={{ color: '#9ca3af' }}>
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <CustomButton text="Cancel" variant="secondary" onClick={onClose} />
        <CustomButton
          text="Print PDF"
          variant="primary"
          onClick={handleDownloadPdf}
          icon={() => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          )}
        />
      </div>
    </Modal>
  );
}
