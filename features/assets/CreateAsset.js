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
import { toast } from '@/app/utils/toast';

export default function CreateAsset() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToastId = toast.loading('Creating asset...');
    
    try {
      const { assetTypeName, ...rest } = values;
      
      let finalPayload;

      // Handle Non-Digital Asset
      if (values.assetCategory === 'NON_DIGITAL') {
        const subCategory = 
          values.nonDigitalSubCategoryFurniture ||
          values.nonDigitalSubCategorySports ||
          values.nonDigitalSubCategoryStationery ||
          values.nonDigitalSubCategoryKitchen ||
          values.nonDigitalSubCategoryCleaning ||
          (values.nonDigitalCategory === 'BOOKS' ? 'BOOKS' : '');

        finalPayload = {
          assetCategory: 'NON_DIGITAL',
          nonDigitalCategory: values.nonDigitalCategory,
          campusId: values.campusId,
          currentLocationId: values.currentLocationId,
          condition: values.condition,
          sourceType: values.sourceType,
          sourceBy: values.sourceBy,
          status: 'IN_STOCK',
        };

        if (subCategory) finalPayload.nonDigitalSubCategory = subCategory;

        if (values.nonDigitalCategory === 'BOOKS') {
          finalPayload.bookName = values.bookName;
        }
        if (values.nonDigitalBrand) finalPayload.brand = values.nonDigitalBrand;
        if (values.nonDigitalModel) finalPayload.model = values.nonDigitalModel;
        if (values.purchaseDate && values.sourceType !== 'DONATED') finalPayload.purchaseDate = values.purchaseDate;
        if (values.cost !== '' && values.cost !== null) finalPayload.cost = Number(values.cost);
        if (values.notes) finalPayload.notes = values.notes || null;

      } else {
        // Handle Digital Asset
        const assetTypeFieldMap = {
          processor: ["Laptop", "Desktop", "Server", "CPU", "Tablet", "Smartphone"],
          ramSizeGB: ["Laptop", "Desktop", "Server", "RAM", "Tablet", "Smartphone"],
          storageSizeGB: ["Laptop", "Desktop", "Server", "SSD", "HDD", "External Hard Drive", "USB Flash Drive", "Tablet", "Smartphone"],
          charger: ["Laptop", "Tablet", "Smartphone"],
        };

        const rawPayload = {
          ...rest,
          assetCategory: 'DIGITAL',
          status: 'IN_STOCK', // Always set to IN_STOCK for new assets
          ramSizeGB: values.ramSizeGB ? parseInt(values.ramSizeGB, 10) : undefined,
          storageSizeGB: values.storageSizeGB ? parseInt(values.storageSizeGB, 10) : undefined,
          cost: values.cost !== '' && values.cost !== null ? Number(values.cost) : undefined,
        };

        // Remove non-digital specific internal fields
        delete rawPayload.nonDigitalCategory;
        delete rawPayload.nonDigitalSubCategoryFurniture;
        delete rawPayload.nonDigitalSubCategorySports;
        delete rawPayload.nonDigitalSubCategoryStationery;
        delete rawPayload.nonDigitalSubCategoryKitchen;
        delete rawPayload.nonDigitalSubCategoryCleaning;
        delete rawPayload.nonDigitalSubCategoryOther;
        delete rawPayload.nonDigitalSubCategory;
        delete rawPayload.bookName;
        delete rawPayload.nonDigitalBrand;
        delete rawPayload.nonDigitalModel;

        // Remove fields not relevant to the selected asset type
        Object.keys(assetTypeFieldMap).forEach((field) => {
          const allowedTypes = assetTypeFieldMap[field];
          if (!allowedTypes.includes(assetTypeName)) {
            delete rawPayload[field];
          }
        });

        // Remove purchaseDate if sourceType is DONATED
        if (values.sourceType === "DONATED") {
          delete rawPayload.purchaseDate;
        }

        // Remove empty values
        finalPayload = Object.fromEntries(
          Object.entries(rawPayload).filter(([, fieldValue]) => {
            if (fieldValue === '' || fieldValue === undefined || fieldValue === null) return false;
            return true;
          })
        );
      }

      // Make API call to create asset
      const response = await fetch(config.getApiUrl(config.endpoints.assets.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
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
    clearAssetSelections: (value, formik) => {
      formik.setFieldValue('assetTypeId', '');
      formik.setFieldValue('assetId', '');
      formik.setFieldValue('nonDigitalCategory', '');
    },
    clearAssetId: (value, formik) => {
      // Clear assetId when assetType changes
      formik.setFieldValue('assetId', '');
    },
    clearAssetIdNonDigital: (value, formik) => {
      formik.setFieldValue('assetId', '');
    },
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
    onNonDigitalCategoryChange: (value, formik) => {
      formik.setFieldValue("nonDigitalSubCategoryFurniture", "");
      formik.setFieldValue("nonDigitalSubCategorySports", "");
      formik.setFieldValue("nonDigitalSubCategoryStationery", "");
      formik.setFieldValue("nonDigitalSubCategoryKitchen", "");
      formik.setFieldValue("nonDigitalSubCategoryCleaning", "");
      formik.setFieldValue("bookName", "");
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
          <GenericForm
            fields={assetFormFields}
            initialValues={assetInitialValues}
            validationSchema={assetValidationSchema}
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