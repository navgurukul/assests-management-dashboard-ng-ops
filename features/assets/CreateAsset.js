'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import ApiAutocomplete from '@/components/atoms/ApiAutocomplete';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import { assetCategoryField } from '@/app/config/formConfigs/assetFormConfig';
import { getCategoryConfig, getNoCategoryConfig } from '@/app/config/formConfigs/categoryFormConfigs';
import { toast } from '@/app/utils/toast';

export default function CreateAsset() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assetCategoryId, setAssetCategoryId] = useState('');
  const [assetCategoryName, setAssetCategoryName] = useState('');

  const currentConfig = getCategoryConfig(assetCategoryName) ?? getNoCategoryConfig();

  const handleFormSubmit = async (values) => {
    if (!assetCategoryId) {
      toast.error('Please select an asset category first.');
      return;
    }

    setIsSubmitting(true);

    // Show loading toast
    const loadingToastId = toast.loading('Creating asset...');

    try {
      // Coerce string fields the API expects as numbers; strip internal form-only fields
      const {
        assetTypeName,
        assetCategoryId: _assetCategoryId,
        assetCategoryName: _assetCategoryName,
        purchaseBills,
        serviceBillDocument,
        amcDocument,
        needsServicing,
        hasAmcInsurance,
        inspectionDate,
        nextInspectionDate,
        inspectionStatus,
        inspectionRemark,
        serviceDate,
        nextServiceDate,
        serviceStatus,
        serviceProvider,
        serviceCost,
        serviceRemark,
        amcStartDate,
        amcExpiryDate,
        healthStatus,
        amcProvider,
        amcCost,
        amcVendor,
        ...rest
      } = values;

      const toDateTime = (dateStr) => {
        if (!dateStr) return undefined;
        return new Date(dateStr).toISOString(); // "2026-06-18" → "2026-06-18T00:00:00.000Z"
      };

      const toNumber = (value) =>
        value !== '' && value !== null && value !== undefined ? Number(value) : undefined;

      const assetTypeFieldMap = {
        processor: ['Laptop', 'Desktop', 'Server', 'CPU', 'Tablet', 'Smartphone'],
        ramSizeGB: ['Laptop', 'Desktop', 'Server', 'RAM', 'Tablet', 'Smartphone'],
        storageSizeGB: ['Laptop', 'Desktop', 'Server', 'SSD', 'HDD', 'External Hard Drive', 'USB Flash Drive', 'Tablet', 'Smartphone'],
        charger: ['Laptop', 'Tablet', 'Smartphone'],
      };

      // Build raw payload with type coercion
      const rawPayload = {
        ...rest,
        status: 'IN_STOCK', // Always set to IN_STOCK for new assets
        ramSizeGB: values.ramSizeGB ? parseInt(values.ramSizeGB, 10) : undefined,
        storageSizeGB: values.storageSizeGB ? parseInt(values.storageSizeGB, 10) : undefined,
        cost: toNumber(values.cost),
        purchaseBillId: values.purchaseBills?.[0]?.id || undefined,
        isMaintanceAndInspection: Boolean(needsServicing),
        isInsurance: Boolean(hasAmcInsurance),
      };

      if (needsServicing) {
        // Service record → maintenance-history (carries cost, provider and bill).
        // Also mirror the date into the top-level serviceDate summary (date-only, per asset schema).
        if (serviceDate) {
          rawPayload.serviceDate = serviceDate;
          rawPayload.maintenanceHistory = {
            serviceDate: toDateTime(serviceDate),
            nextServiceDate: toDateTime(nextServiceDate),
            serviceProvider: serviceProvider || undefined,
            cost: toNumber(serviceCost),
            healthStatus: serviceStatus || undefined,
            notes: serviceRemark || undefined,
            billId: serviceBillDocument?.[0]?.id || undefined,
          };
        }
        // Inspection-history
        if (inspectionDate) {
          rawPayload.inspectionHistory = {
            inspectionDate: toDateTime(inspectionDate),
            nextInspectionDate: toDateTime(nextInspectionDate),
            healthStatus: inspectionStatus || undefined,
            notes: inspectionRemark || undefined,
          };
        }
      }

      if (hasAmcInsurance) {
        rawPayload.insurance = {
          amcStartDate: toDateTime(amcStartDate),
          amcExpiryDate: toDateTime(amcExpiryDate),
          insuranceProvider: amcProvider || undefined,
          insuranceProviderDetails: amcVendor || undefined,
          cost: toNumber(amcCost),
          healthStatus: healthStatus || undefined,
          policyDocumentId: amcDocument?.[0]?.id || undefined,
        };
      }

      // Remove fields not relevant to the selected asset type
      Object.keys(assetTypeFieldMap).forEach((field) => {
        const allowedTypes = assetTypeFieldMap[field];
        if (!allowedTypes.includes(assetTypeName)) {
          delete rawPayload[field];
        }
      });

      // Remove purchaseDate if sourceType is DONATED (since it's not applicable)
      if (values.sourceType === 'DONATED') {
        delete rawPayload.purchaseDate;
      }

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([, fieldValue]) => {
          if (fieldValue === '' || fieldValue === undefined || fieldValue === null) return false;
          return true;
        }),
      );

      // Make API call to create asset using apiService wrapper
      await apiService.post(
        config.endpoints.assets.create,
        payload
      );

      // Show success toast
      toast.success('Asset created successfully!');

      // Navigate back to assets list
      router.push('/assets');

    } catch (error) {
      console.error('Error creating asset:', error);

      const errorMessage = error?.message || 'Failed to create asset. Please try again.';
      const errorDetails = error?.errors ? ` - ${JSON.stringify(error.errors)}` : '';

      // Show error toast
      toast.error(`${errorMessage}${errorDetails}`);
    } finally {
      toast.dismiss(loadingToastId);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/assets');
  };

  const fieldCallbacks = {
    onAssetTypeChange: (value, formik) => {
      // Always clear assetTypeName first; onItemSelect will re-set it if the item is found
      formik.setFieldValue('assetTypeName', '');
      // Reset spec fields when asset type changes so hidden fields don't carry stale values
      formik.setFieldValue('processor', '');
      formik.setFieldValue('ramSizeGB', '');
      formik.setFieldValue('storageSizeGB', '');
      formik.setFieldValue('charger', false);
    },
    onCampusChange: (value, formik) => {
      formik.setFieldValue('currentLocationId', '');
    },
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <CustomButton
            text="Back to Assets"
            icon={ArrowLeft}
            onClick={() => router.push('/assets')}
            variant="secondary"
            size="sm"
            className="mb-6"
          />

          <div className="bg-(--surface) text-foreground rounded-xl shadow-sm border border-(--border) p-6">
            <h1 className="text-xl font-bold mb-2">Register New Asset</h1>
            <p className="text-(--muted)">Fill in the details below to register a new asset in your inventory system</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-(--surface) text-foreground rounded-xl shadow-lg border border-(--border) p-8">
          <div className="mb-6">
            <ApiAutocomplete
              name={assetCategoryField.name}
              label={assetCategoryField.label}
              placeholder={assetCategoryField.placeholder}
              apiUrl={assetCategoryField.apiUrl}
              queryKey={assetCategoryField.queryKey}
              labelKey={assetCategoryField.labelKey}
              valueKey={assetCategoryField.valueKey}
              dataPath={assetCategoryField.dataPath}
              isRequired={assetCategoryField.required}
              filterFn={assetCategoryField.filterFn}
              value={assetCategoryId}
              onChange={(e) => {
                const categoryId = e.target.value;
                setAssetCategoryId(categoryId);
                if (!categoryId) {
                  setAssetCategoryName('');
                }
              }}
              onItemSelect={(item) => {
                if (!item) {
                  setAssetCategoryId('');
                  setAssetCategoryName('');
                  return;
                }
                setAssetCategoryId(item.id);
                setAssetCategoryName(item.name);
              }}
            />
          </div>

          <GenericForm
            key={assetCategoryId}
            fields={currentConfig.fields}
            initialValues={{ ...currentConfig.initialValues, assetCategoryId }}
            validationSchema={currentConfig.validationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Asset"
            isSubmitting={isSubmitting}
            fieldCallbacks={fieldCallbacks}
          />
        </div>
      </div>
    </div>
  );
}
