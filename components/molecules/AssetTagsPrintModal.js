'use client';

import React, { useRef } from 'react';
import Modal from '@/components/molecules/Modal';
import CustomButton from '@/components/atoms/CustomButton';

export default function AssetTagsPrintModal({
  isOpen,
  onClose,
  consignmentCode,
  assets = [],
}) {
  const printRef = useRef(null);

  const handleDownloadPdf = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = printRef.current;
      const opt = {
        margin: 10,
        filename: `AssetTags_${consignmentCode || 'Consignment'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      };
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating tags PDF:', error);
    }
  };

  const normalizedAssets = assets.map((item) => item?.asset || item);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Asset Tags" size="large">
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div ref={printRef} style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '8px' }}>

          {/* Consignment code — once at the top */}
          <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>Consignment</p>
            <p style={{ fontSize: '17px', fontWeight: '700', color: '#1f2937', margin: '2px 0 0 0' }}>
              {consignmentCode || 'N/A'}
            </p>
          </div>

          {/* Tags grid — 4 per asset, 4 columns (1 row) */}
          {normalizedAssets.map((asset, assetIndex) => (
            <div
              key={asset?.id || assetIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '10px',
                marginBottom: '16px',
                pageBreakInside: 'avoid',
              }}
            >
              {[1, 2, 3, 4].map((copy) => (
                <div
                  key={copy}
                  style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    padding: '2px 6px 18px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#1f2937',
                      lineHeight: '18px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {asset?.assetTag || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <CustomButton text="Cancel" variant="secondary" onClick={onClose} />
        <CustomButton
          text="Download Tags PDF"
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
