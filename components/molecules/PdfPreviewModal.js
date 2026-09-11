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
  sourceCampusName = null,
  sourceAddress,
  sourceState = null,
  organizationName = null,
  sourceCreatedBy = null,
  toLabel = 'To (Destination)',
  fromLabel = 'From (Source)',
  filename = 'Document.pdf',
  destinationUser = null,
  assets = null,
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
          className="bg-white p-6"
          style={{ minHeight: '800px', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.5' }}
        >
          {/* Header */}
          <div className="text-center border-b pb-6 mb-8" style={{ borderColor: '#e5e7eb' }}>
            <h1 className="text-2xl font-bold uppercase tracking-wider" style={{ color: '#1f2937' }}>
              {documentTitle}
            </h1>
            <p className="text-base font-medium mt-2" style={{ color: '#6b7280' }}>
              Code: {documentCode || 'N/A'}
            </p>
            <p className="text-base font-medium mt-1" style={{ color: '#6b7280' }}>
              Date: {date ? new Date(date).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* Addresses Section */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            {/* Destination - Left Side */}
            <div className="p-5 border rounded" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <h3 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>
                {toLabel}
              </h3>
              
              {/* User Details */}
              {destinationUser && (
                <div className="mb-3 space-y-1">
                  {(destinationUser.firstName || destinationUser.lastName) && (
                    <p className="text-base font-medium" style={{ color: '#1f2937' }}>
                      {`${destinationUser.firstName || ''} ${destinationUser.lastName || ''}`.trim()}
                    </p>
                  )}
                  {destinationUser.phone && (
                    <p className="text-sm" style={{ color: '#4b5563' }}>
                      Phone: {destinationUser.phone}
                    </p>
                  )}
                </div>
              )}
              
              {/* Address */}
              {destinationAddress && destinationAddress !== 'N/A' && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#4b5563' }}>
                  {destinationAddress}
                </div>
              )}
            </div>

            {/* Source - Right Side */}
            <div className="p-5 border rounded" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <h3 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>
                {fromLabel}
              </h3>
              
              {/* Organization Name */}
              {organizationName && (
                <p className="font-semibold text-base mb-2" style={{ color: '#1f2937' }}>
                  {organizationName}
                </p>
              )}
              
              {/* Created By User Name */}
              {sourceCreatedBy && (sourceCreatedBy.firstName || sourceCreatedBy.lastName) && (
                <p className="text-base font-medium mb-1" style={{ color: '#1f2937' }}>
                  {`${sourceCreatedBy.firstName || ''} ${sourceCreatedBy.lastName || ''}`.trim()}
                </p>
              )}
              
              {/* Campus Name and State */}
              {(sourceCampusName || (sourceState && sourceState !== 'N/A')) && (
                <p className="text-base font-medium mb-2" style={{ color: '#1f2937' }}>
                  {sourceCampusName}
                  {sourceCampusName && sourceState && sourceState !== 'N/A' && ', '}
                  {sourceState && sourceState !== 'N/A' && sourceState}
                </p>
              )}
              
              {/* Campus Address */}
              {sourceAddress && sourceAddress !== 'N/A' && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap mb-2" style={{ color: '#4b5563' }}>
                  {sourceAddress}
                </div>
              )}
              
              {/* Created By Phone */}
              {sourceCreatedBy && sourceCreatedBy.phone && (
                <p className="text-sm" style={{ color: '#4b5563' }}>
                  Phone: {sourceCreatedBy.phone}
                </p>
              )}
            </div>
          </div>

          {/* Assets Table Section */}
          {assets && assets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: '#1f2937' }}>
                Assets in Consignment
              </h2>
              <div className="overflow-hidden border rounded" style={{ borderColor: '#e5e7eb' }}>
                <table className="w-full border-collapse" style={{ fontSize: '12px' }}>
                  <thead style={{ backgroundColor: '#f3f4f6' }}>
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#374151', borderRight: '1px solid #e5e7eb', width: '6%' }}>
                        S.No.
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374151', borderRight: '1px solid #e5e7eb', width: '18%' }}>
                        Asset Tag
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374151', borderRight: '1px solid #e5e7eb', width: '12%' }}>
                        Asset Type
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374151', borderRight: '1px solid #e5e7eb', width: '12%' }}>
                        Brand
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374151', borderRight: '1px solid #e5e7eb', width: '12%' }}>
                        Model
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374151', borderRight: '1px solid #e5e7eb', width: '15%' }}>
                        Serial Number
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider leading-tight" style={{ color: '#374151', borderRight: '1px solid #e5e7eb', width: '12.5%' }}>
                        Checked at Source
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider leading-tight" style={{ color: '#374151', width: '12.5%' }}>
                        Checked at Destination
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((assetItem, index) => {
                      const asset = assetItem?.asset || assetItem;
                      const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                      return (
                        <tr key={asset?.id || index} style={{ backgroundColor: rowBg }}>
                          <td className="px-3 py-3 text-center font-semibold" style={{ color: '#1f2937', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                            {index + 1}
                          </td>
                          <td className="px-3 py-3 font-bold" style={{ color: '#1f2937', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                            {asset?.assetTag || 'N/A'}
                          </td>
                          <td className="px-3 py-3" style={{ color: '#1f2937', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                            {asset?.assetType?.name || 'N/A'}
                          </td>
                          <td className="px-3 py-3" style={{ color: '#1f2937', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                            {asset?.brand || 'N/A'}
                          </td>
                          <td className="px-3 py-3" style={{ color: '#1f2937', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                            {asset?.model || 'N/A'}
                          </td>
                          <td className="px-3 py-3" style={{ color: '#1f2937', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                            {asset?.serialNumber || 'N/A'}
                          </td>
                          <td className="px-2 py-3 text-center" style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                            
                          </td>
                          <td className="px-2 py-3 text-center" style={{ borderBottom: '1px solid #e5e7eb' }}>
                            
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-12 text-center pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-base" style={{ color: '#9ca3af' }}>
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
