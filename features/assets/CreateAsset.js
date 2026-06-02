'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GenericForm from '@/components/molecules/GenericForm';
import CustomButton from '@/components/atoms/CustomButton';
import config from '@/app/config/env.config';
import {
  assetFormFields,
  assetValidationSchema,
  assetInitialValues,
} from '@/app/config/formConfigs/assetFormConfig';
import { getCategoryConfig } from '@/app/config/formConfigs/categoryFormConfigs';
import { toast } from '@/app/utils/toast';

export default function CreateAsset() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assetCategory, setAssetCategory] = useState("IT & Electronics");

  const categories = [
    "IT & Electronics",
    "Furniture & Fixtures",
    "Appliances & Equipment",
    "Vehicles & Mobility",
    "Learning & Recreation",
    "Kitchen & Housekeeping",
    "Infrastructure Assets"
  ];
  
  const currentConfig = assetCategory === "IT & Electronics" 
    ? { fields: assetFormFields, validationSchema: assetValidationSchema, initialValues: assetInitialValues }
    : getCategoryConfig(assetCategory);


  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToastId = toast.loading('Creating asset...');
    
    try {
      // Coerce string fields the API expects as numbers; strip internal form-only fields
      const { assetTypeName, ...rest } = values;
      
      // Define which fields are relevant for each asset type
      const assetTypeFieldMap = {
        processor: ["Laptop", "Desktop", "Server", "CPU", "Tablet", "Smartphone"],
        ramSizeGB: ["Laptop", "Desktop", "Server", "RAM", "Tablet", "Smartphone"],
        storageSizeGB: ["Laptop", "Desktop", "Server", "SSD", "HDD", "External Hard Drive", "USB Flash Drive", "Tablet", "Smartphone"],
        charger: ["Laptop", "Tablet", "Smartphone"],
      };

      // Build raw payload with type coercion
      const rawPayload = {
        ...rest,
        status: 'IN_STOCK', // Always set to IN_STOCK for new assets
        ramSizeGB: values.ramSizeGB ? parseInt(values.ramSizeGB, 10) : undefined,
        storageSizeGB: values.storageSizeGB ? parseInt(values.storageSizeGB, 10) : undefined,
        cost: values.cost !== '' && values.cost !== null ? Number(values.cost) : undefined,
      };

      // Remove fields not relevant to the selected asset type
      Object.keys(assetTypeFieldMap).forEach((field) => {
        const allowedTypes = assetTypeFieldMap[field];
        if (!allowedTypes.includes(assetTypeName)) {
          delete rawPayload[field];
        }
      });

      // Remove purchaseDate if sourceType is DONATED (since it's not applicable)
      if (values.sourceType === "DONATED") {
        delete rawPayload.purchaseDate;
      }

      // Remove empty values
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([, fieldValue]) => {
          if (fieldValue === '' || fieldValue === undefined || fieldValue === null) return false;
          return true;
        })
      );

      // Make API call to create asset
      const response = await fetch(config.getApiUrl(config.endpoints.assets.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.message || `Failed to create asset (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Show success toast
      toast.success('Asset created successfully!');
      
      // Navigate back to assets list
      router.push('/assets');
      
    } catch (error) {
      console.error('Error creating asset:', error);
      
      // Show error toast
      toast.error(error?.message || 'Failed to create asset. Please try again.');
    } finally {
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
            <label className="block text-sm font-medium mb-1">Asset Category</label>
            <select
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value)}
              className="w-full bg-(--surface) border border-(--border) rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-shadow"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <GenericForm
            key={assetCategory}
            fields={currentConfig.fields}
            initialValues={currentConfig.initialValues}
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