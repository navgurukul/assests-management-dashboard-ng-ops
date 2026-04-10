import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/molecules/Modal';
import CustomButton from '@/components/atoms/CustomButton';
import usePatch from '@/app/hooks/query/usePatch';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';

export default function BulkConsignmentModal({ isOpen, onClose, consignment }) {
  // Track selected status and feedback text per device in an object:
  // { [assetValue]: { selected: boolean, text: string } }
  const [feedbacks, setFeedbacks] = useState({});

  const queryClient = useQueryClient();
  const { mutateAsync: patchAssetStatus, isPending: isSubmitting } = usePatch();

  const handleClose = () => {
    onClose();
    setFeedbacks({});
  };

  const handleToggleDevice = (assetValue) => {
    setFeedbacks((prev) => {
      const isCurrentlySelected = prev[assetValue]?.selected || false;
      return {
        ...prev,
        [assetValue]: {
          text: !isCurrentlySelected && !prev[assetValue]?.text
            ? 'Device received in good condition'
            : prev[assetValue]?.text || '',
          selected: !isCurrentlySelected,
        },
      };
    });
  };

  const handleFeedbackChange = (assetValue, text) => {
    setFeedbacks((prev) => ({
      ...prev,
      [assetValue]: {
        ...prev[assetValue],
        text,
      },
    }));
  };

  const getLoggableData = () => {
    return Object.entries(feedbacks)
      .filter(([_, data]) => data.selected)
      .map(([id, data]) => ({ assetId: id, feedback: data.text || '' }));
  };

  const handleSubmit = async () => {
    const selectedAssets = getLoggableData();
    const consignmentId = consignment?.id;

    if (!consignmentId) {
      toast.error('Consignment ID is missing.');
      return;
    }

    const body = {
      status: 'PENDING',
      assets: selectedAssets.map((item) => ({
        assetId: item.assetId,
        notes: item.feedback,
      })),
    };

    try {
      await patchAssetStatus({
        endpoint: config.endpoints.consignments.assetsStatus(consignmentId),
        body,
      });
      toast.success('Feedback submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['consignment-details', consignmentId] });
      handleClose();
    } catch (error) {
      toast.error(error?.message || 'Failed to submit feedback. Please try again.');
    }
  };

  const isSubmitDisabled = getLoggableData().length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Consignment Feedback"
      size="large"
    >
      <div className="flex flex-col space-y-4 p-4">
        <p className="text-sm text-gray-600 mb-2">
          Select the devices you are receiving and provide feedback on their condition.
        </p>

        <div className="flex flex-col space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
          {consignment?.assets?.length === 0 && (
            <p className="text-sm text-gray-500 italic">No devices found in this consignment.</p>
          )}
          {consignment?.assets?.map((asset) => {
            const assetObj = asset?.asset || asset || {};
            const specObj = assetObj?.specifications || assetObj;

            const assetLabel =
              assetObj?.assetTag ||
              assetObj?.serialNumber ||
              assetObj?.id ||
              'Unknown Device';
            
            const assetValue = assetObj?.id || assetLabel;

            // Safe fallback for device specifications
            const processor = specObj?.processor || 'Unknown Processor';
            const ram = specObj?.ram || 'Unknown RAM';
            const storage = specObj?.storage || 'Unknown Storage';
            
            let type = assetObj?.assetType || assetObj?.type || 'Device';
            if (typeof type === 'object') {
              type = type?.name || 'Device';
            }

            const isSelected = feedbacks[assetValue]?.selected || false;
            const currentFeedback = feedbacks[assetValue]?.text || '';

            return (
              <div 
                key={assetValue} 
                className={`relative border rounded-xl p-4 transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-400 bg-blue-50/40 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start cursor-pointer group" onClick={() => handleToggleDevice(assetValue)}>
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly // Controlled by onClick on parent div
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  
                  <div className="ml-3 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <span className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {assetLabel}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                        {processor}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        {ram}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                        {storage}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Expandable Feedback Area */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isSelected ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                  }`}
                >
                  <div className="pt-3 border-t border-blue-100">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Condition & Feedback
                    </label>
                    <textarea
                      rows={2}
                      placeholder={`Describe the condition of ${assetLabel}... (e.g. Device received in good condition, no physical damage)`}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-400 shadow-sm transition-shadow"
                      value={currentFeedback}
                      onChange={(e) => handleFeedbackChange(assetValue, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-100">
          <CustomButton
            text="Cancel"
            variant="secondary"
            onClick={handleClose}
          />
          <CustomButton
            text={isSubmitting ? 'Submitting...' : 'Submit'}
            variant="primary"
            disabled={isSubmitDisabled || isSubmitting}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Modal>
  );
}