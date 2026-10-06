'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import ApiAutocomplete from '@/components/atoms/ApiAutocomplete';
import StateHandler from '@/components/atoms/StateHandler';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import { assetCategoryField } from '@/app/config/formConfigs/assetFormConfig';
import { getCategoryConfig, getNoCategoryConfig } from '@/app/config/formConfigs/categoryFormConfigs';
import { toast } from '@/app/utils/toast';
import useFetch from '@/app/hooks/query/useFetch';

export default function EditAsset({ assetId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing asset data
  const {
    data: assetResponse,
    isLoading,
    isError,
    error,
  } = useFetch({
    url: config.endpoints.assets.details(assetId),
    queryKey: ['asset-edit', assetId],
  });

  const assetData = assetResponse?.data;

  // Derive category name from fetched asset
  const assetCategoryName = assetData?.assetType?.assetCategory?.name || '';
  const assetCategoryId = assetData?.assetType?.assetCategory?.id || '';

  const currentConfig = useMemo(
    () => getCategoryConfig(assetCategoryName) ?? getNoCategoryConfig(),
    [assetCategoryName],
  );

  // Processor values from API may be short-form (e.g. "i5") — map them to
  // the full option values used in the form (e.g. "Intel Core i5")
  const PROCESSOR_API_TO_FORM = {
    'i3': 'Intel Core i3',
    'i5': 'Intel Core i5',
    'i7': 'Intel Core i7',
    'i9': 'Intel Core i9',
    'pentium': 'Intel Pentium',
    'celeron': 'Intel Celeron',
    'xeon': 'Intel Xeon',
    'ryzen 3': 'AMD Ryzen 3',
    'ryzen 5': 'AMD Ryzen 5',
    'ryzen 7': 'AMD Ryzen 7',
    'ryzen 9': 'AMD Ryzen 9',
    'm1': 'Apple M1',
    'm2': 'Apple M2',
    'm3': 'Apple M3',
  };

  const normalizeProcessor = (raw) => {
    if (!raw) return '';
    const lower = raw.toLowerCase().trim();
    // If it already matches a form option exactly, keep it
    const FORM_OPTION_VALUES = [
      'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9',
      'Intel Pentium', 'Intel Celeron', 'Intel Xeon',
      'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
      'Apple M1', 'Apple M2', 'Apple M3', 'Other',
    ];
    if (FORM_OPTION_VALUES.includes(raw)) return raw;
    // Try mapping
    return PROCESSOR_API_TO_FORM[lower] || raw;
  };

  // Build prefilled initial values from existing asset data
  const prefillValues = useMemo(() => {
    if (!assetData) return null;

    return {
      // Base
      assetTypeId: assetData.assetType?.id || '',
      assetTypeName: assetData.assetType?.name || '',
      assetCategoryId: assetData.assetType?.assetCategory?.id || '',
      assetCategoryName: assetData.assetType?.assetCategory?.name || '',

      brand: assetData.brand || '',
      model: assetData.model || '',

      // Common fields
      campusId: assetData.campus?.id || '',
      currentLocationId: assetData.location?.id || '',
      status: assetData.status || 'IN_STOCK',
      condition: assetData.condition || 'WORKING',
      sourceType: assetData.sourceType || 'PURCHASED',
      sourceBy: assetData.sourceBy || '',
      purchaseDate: assetData.purchaseDate
        ? assetData.purchaseDate.split('T')[0]
        : '',
      cost: assetData.cost ?? '',
      notes: assetData.notes || '',
      charger: assetData.charger ?? false,
      purchaseBills: assetData.purchaseBillDetails
        ? [assetData.purchaseBillDetails]
        : [],

      // IT & Electronics category-specific
      serialNumber: assetData.serialNumber || '',
      // Normalize processor: API may store short-form values like "i5"
      processor: normalizeProcessor(assetData.processor),
      ramSizeGB: assetData.ramSizeGB ? String(assetData.ramSizeGB) : '',
      storageSizeGB: assetData.storageSizeGB ? String(assetData.storageSizeGB) : '',
      specLabel: assetData.specLabel || '',

      // Furniture & Fixtures
      material: assetData.material || '',
      dimensions: assetData.dimensions || '',

      // Appliances & Equipment
      powerRating: assetData.powerRating || '',

      // Vehicles & Mobility
      vehicleNumber: assetData.vehicleNumber || '',

      // Learning & Recreation
      name: assetData.name || '',
      isbn: assetData.isbn || '',

      // Kitchen & Housekeeping
      capacity: assetData.capacity || '',

      // Infrastructure Assets
      installationDate: assetData.installationDate
        ? assetData.installationDate.split('T')[0]
        : '',
      contractorVendor: assetData.contractorVendor || '',

      // Service / maintenance — not prefilled (edit of history via separate logs)
      needsServicing: false,
      inspectionDate: '',
      nextInspectionDate: '',
      inspectionStatus: '',
      inspectionCost: '',
      inspectionRemark: '',
      serviceDate: '',
      nextServiceDate: '',
      serviceStatus: '',
      serviceProvider: '',
      serviceCost: '',
      serviceRemark: '',
      serviceBillDocument: [],

      // AMC / Insurance — not prefilled
      hasAmcInsurance: false,
      amcStartDate: '',
      amcExpiryDate: '',
      healthStatus: '',
      amcProvider: '',
      amcCost: '',
      amcProviderDetails: '',
      amcRemark: '',
      amcDocument: [],
    };
  }, [assetData]);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Updating asset...');

    try {
      const {
        assetTypeName,
        assetCategoryId: _catId,
        assetCategoryName: _catName,
        purchaseBills,
        // Strip servicing/AMC fields — those are managed via separate log actions
        needsServicing,
        hasAmcInsurance,
        inspectionDate,
        nextInspectionDate,
        inspectionStatus,
        inspectionCost,
        inspectionRemark,
        serviceDate,
        nextServiceDate,
        serviceStatus,
        serviceProvider,
        serviceCost,
        serviceRemark,
        serviceBillDocument,
        amcStartDate,
        amcExpiryDate,
        healthStatus,
        amcProvider,
        amcCost,
        amcProviderDetails,
        amcRemark,
        amcDocument,
        ...rest
      } = values;

      const toNumber = (value) =>
        value !== '' && value !== null && value !== undefined
          ? Number(value)
          : undefined;

      const payload = {
        ...rest,
        assetTypeId: values.assetTypeId || undefined,
        campusId: values.campusId || undefined,
        currentLocationId: values.currentLocationId || undefined,
        ramSizeGB: values.ramSizeGB ? parseInt(values.ramSizeGB, 10) : undefined,
        storageSizeGB: values.storageSizeGB
          ? parseInt(values.storageSizeGB, 10)
          : undefined,
        cost: toNumber(values.cost),
        purchaseBillId: purchaseBills?.[0]?.id || undefined,
      };

      const assetTypeFieldMap = {
        // processor: ['Laptop', 'Desktop', 'Server', 'CPU', 'Tablet', 'Smartphone'],
        // ramSizeGB: ['Laptop', 'Desktop', 'Server', 'RAM', 'Tablet', 'Smartphone'],
        // storageSizeGB: ['Laptop', 'Desktop', 'Server', 'SSD', 'HDD', 'External Hard Drive', 'USB Flash Drive', 'Tablet', 'Smartphone'],
        charger: ['Laptop', 'Tablet', 'Smartphone'],
      };

      Object.keys(assetTypeFieldMap).forEach((field) => {
        const allowedTypes = assetTypeFieldMap[field];
        if (!allowedTypes.includes(assetTypeName)) {
          delete payload[field];
        }
      });

      // Remove empty / null / undefined keys before sending
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== '' && v !== undefined && v !== null),
      );

      await apiService.put(
        config.endpoints.assets.updateDetails(assetId),
        cleanPayload,
      );

      toast.success('Asset updated successfully!');
      router.replace('/assets');
    } catch (err) {
      console.error('Error updating asset:', err);
      const msg = err?.message || 'Failed to update asset. Please try again.';
      const details = err?.errors ? ` — ${JSON.stringify(err.errors)}` : '';
      toast.error(`${msg}${details}`);
    } finally {
      toast.dismiss(loadingToastId);
      setIsSubmitting(false);
    }
  };

  const fieldCallbacks = {
    onAssetTypeChange: (value, formik) => {
      formik.setFieldValue('assetTypeName', '');
      formik.setFieldValue('processor', '');
      formik.setFieldValue('ramSizeGB', '');
      formik.setFieldValue('storageSizeGB', '');
      formik.setFieldValue('charger', false);
    },
    onCampusChange: (value, formik) => {
      formik.setFieldValue('currentLocationId', '');
    },
  };

  if (isLoading || isError || !assetData) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading asset details..."
        errorMessage="Failed to load asset"
      />
    );
  }

  // Merge config initial values with prefilled asset data
  const mergedInitialValues = {
    ...currentConfig.initialValues,
    ...prefillValues,
    assetCategoryId,
  };

  // Fields that are NOT in the PUT /assets/details/{id} payload —
  // service, inspection, AMC are managed via separate log endpoints.
  // Remove them so the edit form stays clean and matches exactly what the API accepts.
  const EDIT_EXCLUDED_FIELDS = new Set([
    'needsServicing',
    'inspectionHeader', 'inspectionDate', 'nextInspectionDate', 'inspectionStatus',
    'inspectionCost', 'inspectionRemark',
    'serviceHeader', 'serviceDate', 'nextServiceDate', 'serviceStatus',
    'serviceProvider', 'serviceCost', 'serviceRemark', 'serviceBillDocument',
    'hasAmcInsurance',
    'amcStartDate', 'amcExpiryDate', 'healthStatus', 'amcProvider',
    'amcCost', 'amcProviderDetails', 'amcRemark', 'amcDocument',
  ]);

  // For edit, status and condition dropdowns should be enabled.
  const editFields = currentConfig.fields
    .filter((field) => !EDIT_EXCLUDED_FIELDS.has(field.name))
    .map((field) => {
      if (field.name === 'status' || field.name === 'condition') {
        return { ...field, disabled: false };
      }
      return field;
    });

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <CustomButton
            text="Back to Assets"
            icon={ArrowLeft}
            onClick={() => router.replace('/assets')}
            variant="secondary"
            size="sm"
            className="mb-6"
          />

          <div className="bg-(--surface) text-foreground rounded-xl shadow-sm border border-(--border) p-6">
            <h1 className="text-xl font-bold mb-2">
              Edit Asset — {assetData.assetTag}
            </h1>
            <p className="text-(--muted)">
              Update the details for this asset. Changes will be saved immediately.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-(--surface) text-foreground rounded-xl shadow-lg border border-(--border) p-8">
          {/* Category field — read-only display, not changeable on edit */}
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
              disabled={true}
              onChange={() => {}}
              onItemSelect={() => {}}
            />
          </div>

          <GenericForm
            key={assetCategoryId}
            fields={editFields}
            initialValues={mergedInitialValues}
            validationSchema={currentConfig.validationSchema}
            onSubmit={handleFormSubmit}
            onCancel={() => router.replace('/assets')}
            submitButtonText="Save Changes"
            isSubmitting={isSubmitting}
            fieldCallbacks={fieldCallbacks}
          />
        </div>
      </div>
    </div>
  );
}
