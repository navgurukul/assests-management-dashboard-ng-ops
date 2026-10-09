'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import StateHandler from '@/components/atoms/StateHandler';
import MovementTimeline from '@/components/molecules/MovementTimeline';
import MaintenanceHistoryTimeline from '@/components/molecules/MaintenanceHistoryTimeline';
import apiService from '@/app/utils/apiService';
import { toast } from '@/app/utils/toast';
import config from '@/app/config/env.config';
import usePut from '@/app/hooks/query/usePut';
import useFetch from '@/app/hooks/query/useFetch';
import usePost from '@/app/hooks/query/usePost';
import {
  changeLocationFields,
  changeLocationValidationSchema,
  inspectionLogFields,
  inspectionLogValidationSchema,
  serviceLogFields,
  serviceLogValidationSchema,
  amcRenewalFields,
  amcRenewalValidationSchema,
} from '@/app/config/formConfigs/assetFormConfig';
import {
  getReturnAssetFields,
  returnAssetValidationSchema,
} from '@/app/config/formConfigs/returnAssetModalConfig';
import { buildSpecLabel } from '@/app/utils/dataTransformers';
import {   
  getCategoryDisplayItems,
} from '@/app/config/formConfigs/categoryFormConfigs';
import { useAppSelector } from '@/app/store/hooks';
import { selectUserRole } from '@/app/store/slices/appSlice';

export default function AssetDetails({ assetId, assetData, isLoading, isError, error, onBack, refetch }) {
  const [modalAction, setModalAction] = useState(null); // 'REPAIR' | 'SCRAP' | 'IN_STOCK' | 'CHANGE_LOCATION' | 'DISPOSE' | 'INITIATE_RETURN' | null
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinatorCampusId, setCoordinatorCampusId] = useState(null);
  const [coordinatorUpdateTick, setCoordinatorUpdateTick] = useState(0);
  const [localFormState, setLocalFormState] = useState({});
  const formStateRef = useRef({});
  const hasToastedRef = useRef(null);

  const userRole = useAppSelector(selectUserRole);
  const isCampusManager = userRole === 'CAMPUS_MANAGER';
  const isAdmin = userRole === 'ADMIN';

  const { mutateAsync: postMutation, isPending: isReturnSubmitting } = usePost();

  // Fetch campuses list for return modal (to auto-fill address on campus select)
  const { data: campusesResponse } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
    enabled: modalAction === 'INITIATE_RETURN',
  });

  // Fetch logged-in user's manager for auto-filling managerEmail (same as ticket form)
  const { data: myManagerData } = useFetch({
    url: config.endpoints.user.myManager,
    queryKey: ['myManager'],
    enabled: modalAction === 'INITIATE_RETURN',
  });

  const managerEmail = useMemo(() => {
    const mgr = myManagerData?.data?.manager || myManagerData?.data || myManagerData?.manager;
    return mgr?.email || '';
  }, [myManagerData]);

  // Fetch campus IT coordinator when campus is selected in return modal
  const { data: coordinatorResponse, error: coordinatorError, failureCount } = useFetch({
    url: `/campus-incharge/campus/${coordinatorCampusId}`,
    queryKey: ['campus-incharge', coordinatorCampusId],
    enabled: !!coordinatorCampusId,
  });

  const campusesData = useMemo(() => {
    const raw = campusesResponse?.data?.data || campusesResponse?.data || campusesResponse || [];
    return Array.isArray(raw) ? raw : [];
  }, [campusesResponse]);

  const getCampusAddressById = (campusId) => {
    if (!campusId) return '';
    const campus = campusesData.find((c) => c.id === campusId);
    return campus?.address || campus?.campus?.address || '';
  };

  const getSourcedCampusAddress = () => {
    const campusId = assetData?.campus?.id || assetData?.campusId || assetData?.sourceCampusId;
    return assetData?.campus?.address || getCampusAddressById(campusId) || '';
  };

  const coordinatorEmail = useMemo(() => {
    if (!coordinatorResponse) return '';
    const data = coordinatorResponse?.data || coordinatorResponse;
    if (data?.success === false) return '';
    return data?.data?.itCoordinator?.email || data?.itCoordinator?.email || '';
  }, [coordinatorResponse]);

  const coordinatorData = coordinatorResponse?.data || coordinatorResponse;
  const isCoordinatorError = coordinatorError || coordinatorData?.success === false || failureCount > 0;

  // Sync localFormState when coordinator tick change
  useEffect(() => {
    setLocalFormState({ ...formStateRef.current });
  }, [coordinatorUpdateTick]);

  // When coordinator email resolves, inject it into formStateRef and trigger re-render
  useEffect(() => {
    if (!coordinatorCampusId) {
      hasToastedRef.current = null;
      return;
    }
    if (isCoordinatorError) {
      if (hasToastedRef.current !== coordinatorCampusId) {
        toast.error('This campus does not have an IT coordinator at present.');
        formStateRef.current.campusItCoordinator = '';
        setTimeout(() => setCoordinatorUpdateTick((t) => t + 1), 0);
        hasToastedRef.current = coordinatorCampusId;
      }
    } else if (coordinatorEmail) {
      if (hasToastedRef.current !== coordinatorCampusId) {
        formStateRef.current.campusItCoordinator = coordinatorEmail;
        setTimeout(() => setCoordinatorUpdateTick((t) => t + 1), 0);
        hasToastedRef.current = coordinatorCampusId;
      }
    }
  }, [coordinatorEmail, isCoordinatorError, coordinatorCampusId]);

  // When manager email resolves, inject into formStateRef
  useEffect(() => {
    if (managerEmail && formStateRef.current.managerEmail !== managerEmail) {
      formStateRef.current.managerEmail = managerEmail;
      setTimeout(() => setCoordinatorUpdateTick((t) => t + 1), 0);
    }
  }, [managerEmail]);

  // Fill sourced-campus address once /campuses loads (asset details campus has no address)
  useEffect(() => {
    if (formStateRef.current.returnMode !== 'SOURCED_CAMPUS') return;
    const sourcedAddress = getSourcedCampusAddress();
    if (!sourcedAddress || formStateRef.current.exactAddress === sourcedAddress) return;
    formStateRef.current = { ...formStateRef.current, exactAddress: sourcedAddress };
    setCoordinatorUpdateTick((t) => t + 1);
  }, [campusesData, assetData]);

  const { mutateAsync: moveToStock, isPending: isMovingToStock } = usePut({
    onSuccess: () => {
      toast.success('Asset moved to In Stock successfully.');
      setModalAction(null);
      if (refetch) {
        refetch();
      }
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to move asset to In Stock. Please try again.');
    },
  });
  const toDateTime = (dateStr) => {
    if (!dateStr) return undefined;
    return new Date(dateStr).toISOString();
  };

  const handleStatusUpdate = async (formData) => {
    const id = assetId || assetData?.id;
    setIsSubmitting(true);
    try {
      if (modalAction === 'IN_STOCK') {
        await moveToStock({
          endpoint: config.endpoints.assets.update(id),
          body: {
            status: 'IN_STOCK',
            condition: 'WORKING',
            notes: formData.description,
          },
        });
        return;
      } else if (modalAction === 'REPAIR') {
        await apiService.post(config.endpoints.assets.repair(id), {
          reasonForRepair: formData.description,
        });
        toast.success('Asset moved to repair successfully.');
      } else if (modalAction === 'SCRAP') {
        await apiService.post(config.endpoints.assets.scrap(id), {
          reasonForScrapping: formData.description,
        });
        toast.success('Asset marked as not working (scrap) successfully.');
      } else if (modalAction === 'DISPOSE') {
        await apiService.put(config.endpoints.assets.dispose(id), {
          reasonForDisposal: formData.description,
        });
        toast.success('Asset marked as disposed successfully.');
      } else if (modalAction === 'CHANGE_LOCATION') {
        await apiService.put(config.endpoints.assets.update(id), {
          currentLocationId: formData.locationId,
        });
        toast.success('Asset location changed successfully.');
      } else if (modalAction === 'INSPECTION_LOG') {
        const { cost, inspectionDate, nextInspectionDate, ...rest } = formData;
        await apiService.post(config.endpoints.inspectionHistory.create, {
          assetId: id,
          ...rest,
          inspectionDate: toDateTime(inspectionDate),
          nextInspectionDate: toDateTime(nextInspectionDate),
          cost: cost !== '' && cost !== null && cost !== undefined ? Number(cost) : undefined,
        });
        toast.success('Inspection logged successfully.');
      } else if (modalAction === 'SERVICE_LOG') {
        const { cost, billDocument, serviceDate, nextServiceDate, ...rest } = formData;
        await apiService.post(config.endpoints.maintenanceHistory.create, {
          assetId: id,
          ...rest,
          serviceDate: toDateTime(serviceDate),
          nextServiceDate: toDateTime(nextServiceDate),
          cost: cost !== '' && cost !== null && cost !== undefined ? Number(cost) : undefined,
          billId: billDocument?.[0]?.id || undefined,
        });
        toast.success('Service logged successfully.');
      } else if (modalAction === 'AMC_RENEWAL') {
        const { cost, policyDocument, amcStartDate, amcExpiryDate, providerDetails, ...rest } = formData;
        await apiService.post(config.endpoints.insurance.create, {
          assetId: id,
          ...rest,
          insuranceProviderDetails: providerDetails,
          amcStartDate: toDateTime(amcStartDate),
          amcExpiryDate: toDateTime(amcExpiryDate),
          cost: cost !== '' && cost !== null && cost !== undefined ? Number(cost) : undefined,
          policyDocumentId: policyDocument?.[0]?.id || undefined,
        });
        toast.success('AMC / Insurance renewal logged successfully.');
      }
      setModalAction(null);
      if (refetch) {
        refetch(); // Refresh asset details after status update
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Admin-initiated return handler ───

  const handleReturnFormChange = (updatedData, fieldChanged) => {
    let nextData = updatedData;

    if (fieldChanged) {
      const { name } = fieldChanged;
      const { returnMode, destinationCampusId: campusId } = updatedData;
      const isOtherOrVisit = returnMode === 'OTHER_CAMPUS' || returnMode === 'VISIT_CAMPUS';

      switch (name) {
        case 'returnMode':
          if (isOtherOrVisit) {
            setTimeout(() => setCoordinatorCampusId(null), 0);
            nextData = {
              ...updatedData,
              exactAddress: '',
              destinationCampusId: '',
              campusItCoordinator: '',
              managerEmail: formStateRef.current.managerEmail || updatedData.managerEmail || '',
              expectedDeliveryDate: '',
              vendorName: '',
              vendorReceipt: null,
            };
          } else if (returnMode === 'SOURCED_CAMPUS') {
            const sourceId = assetData?.campus?.id || assetData?.campusId || assetData?.sourceCampusId;
            if (sourceId) {
              setTimeout(() => setCoordinatorCampusId(sourceId), 0);
            }
            nextData = {
              ...updatedData,
              exactAddress: getSourcedCampusAddress(),
              destinationCampusId: '',
              managerEmail: formStateRef.current.managerEmail || updatedData.managerEmail || '',
              expectedDeliveryDate: '',
              vendorName: '',
              vendorReceipt: null,
            };
          }
          break;

        case 'destinationCampusId':
          if (isOtherOrVisit) {
            if (campusId) {
              setTimeout(() => setCoordinatorCampusId(campusId), 0);
              const selectedCampus = campusesData.find((c) => c.id === campusId);
              if (selectedCampus?.address) {
                nextData = { ...updatedData, exactAddress: selectedCampus.address };
              }
            } else {
              setTimeout(() => setCoordinatorCampusId(null), 0);
              nextData = { ...updatedData, exactAddress: '', campusItCoordinator: '' };
            }
          }
          break;

        default:
          break;
      }
    }

    formStateRef.current = nextData;
    return nextData;
  };

  // ─── Return form fields — inject localFormState values (coordinator email etc.) ──

  const returnFormFields = useMemo(() => {
    const base = getReturnAssetFields(
      assetData,
      assetData?.campus?.campusName || assetData?.campus?.name || '',
      getSourcedCampusAddress()
    );
    return (base || []).map((f) => {
      const newField = { ...f };
      if (newField.name === 'destinationCampusId') {
        newField.dependsOn = null;
        newField.staticItems = campusesData;
      }
      // Auto-fill managerEmail from logged-in user's manager (disabled, cannot edit)
      if (newField.name === 'managerEmail' && managerEmail) {
        newField.defaultValue = managerEmail;
        newField.helpText = `This return will loop in your manager (${managerEmail}).`;
      }
      if (localFormState[newField.name] !== undefined) {
        newField.defaultValue = localFormState[newField.name];
      }
      return newField;
    });
  }, [assetData, campusesData, localFormState, managerEmail]);

  // ─── End admin-initiated return ─────────────────────────────────────────────

  const handleReturnSubmit = async (formData) => {
    const id = assetId || assetData?.id;
    setIsSubmitting(true);
    try {
      const consignmentId = assetData?.consignments?.[0]?.id || assetData?.consignmentId || assetData?.consignment?.id;

      let sourceCampusIdValue = '';
      let returnTypeValue = '';

      if (formData.returnMode === 'VISIT_CAMPUS') {
        sourceCampusIdValue = formData.destinationCampusId || formData.sourceCampusId;
        returnTypeValue = 'RETURN_PHYSICALLY';
      } else if (formData.returnMode === 'OTHER_CAMPUS') {
        sourceCampusIdValue = formData.destinationCampusId || formData.sourceCampusId;
        returnTypeValue = 'RETURN_TO_OTHER_CAMPUS';
      } else if (formData.returnMode === 'SOURCED_CAMPUS') {
        sourceCampusIdValue = assetData?.sourceCampusId || assetData?.campusId || assetData?.campus?.id || '';
        returnTypeValue = 'RETURN_TO_SOURCE_CAMPUS';
      }

      const expDate = formData.expectedDeliveryDate;
      const formattedDate = expDate instanceof Date
        ? expDate.toISOString().split('T')[0]
        : (typeof expDate === 'string' ? expDate : '');

      const campusITCoordinatorEmail =
        formData.campusItCoordinator ||
        coordinatorEmail ||
        formStateRef.current?.campusItCoordinator ||
        '';

      const exactAddress =
        formData.exactAddress ||
        formStateRef.current?.exactAddress ||
        '';

      const fields = {
        ...(consignmentId ? { consignmentId } : {}),
        assetId: id,
        returnType: returnTypeValue,
        sourceCampusId: sourceCampusIdValue,
        campusITCoordinatorEmail,
        exactAddress,
        vendorName: formData.returnMode === 'VISIT_CAMPUS' ? 'NA' : (formData.vendorName || ''),
        managerEmail: formData.managerEmail || '',
        expectedDeliveryDate: formattedDate,
      };

      // trackingNumber only for SOURCED_CAMPUS and OTHER_CAMPUS (not applicable for VISIT_CAMPUS)
      if (formData.returnMode !== 'VISIT_CAMPUS') {
        fields.trackingNumber = formData.trackingId || '';
      }

      const payload = new FormData();
      Object.entries(fields).forEach(([key, value]) => payload.append(key, value));

      const vendorReceipts = Array.from(formData.vendorReceipt || []);
      if (vendorReceipts.length > 0) {
        vendorReceipts.forEach((file) => payload.append('vendorReceipt', file));
      } else if (formData.returnMode === 'VISIT_CAMPUS') {
        payload.append('vendorReceipt', new File(['dummy'], 'NA.pdf', { type: 'application/pdf' }));
      }

      await postMutation({
        endpoint: '/consignment/assets/return',
        body: payload,
      });

      toast.success('Return initiated successfully. Asset return has been logged.');
      setModalAction(null);
      setCoordinatorCampusId(null);
      formStateRef.current = {};
      setLocalFormState({});
      hasToastedRef.current = null;
      if (refetch) refetch();
    } catch (err) {
      toast.error(err?.message || 'Failed to initiate return. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const repairFields = [
    {
      name: 'description',
      label: 'Reason for Repair',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the issue or reason this asset needs repair...',
    },
  ];

  const scrapFields = [
    {
      name: 'description',
      label: 'Reason for Scrapping',
      type: 'textarea',
      required: true,
      placeholder: 'Describe why this asset is being not working (scrapped)...',
    },
  ];

  const disposeFields = [
    {
      name: 'description',
      label: 'Reason for Disposal',
      type: 'textarea',
      required: true,
      placeholder: 'Describe why this asset is being disposed...',
    },
  ];

  const inStockFields = [
    {
      name: 'description',
      label: 'Notes',
      type: 'textarea',
      required: true,
      placeholder: 'Add any notes about moving this asset back to stock...',
    },
  ];

  // If no asset data is available, show loading/error state
  if (isLoading || isError || !assetData) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading asset details..."
        errorMessage="Failed to load asset details"
      />
    );
  }

  const assetDetails = assetData;

  // Fields for changing asset location (same campus, different location)
  // Must be defined AFTER assetDetails is created
  const getChangeLocationFields = () => {
    return changeLocationFields.map((field) => {
      if (field.name === 'locationId') {
        return {
          ...field,
          apiUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/locations/campus/${assetDetails.campus?.id}`,
          queryKey: ['locations', assetDetails.campus?.id],
        };
      }
      return field;
    });
  };

  // Map API status to display format
  const formatStatus = (status) => {
    const statusMap = {
      'IN_STOCK': 'In Stock',
      'ALLOCATED': 'Allocated',
      'REPAIR': 'Under Repair',
      'SCRAP': 'Scrap',
      'PARTED_OUT': 'Parted Out',
      'DISPOSED': 'Disposed',
    };
    return statusMap[status] || status;
  };

  // Map condition to display format
  const formatCondition = (condition) => {
    const conditionMap = {
      'WORKING': 'Working',
      'MINOR_ISSUES': 'Minor Issues',
      'NOT_WORKING': 'Not Working',
    };
    return conditionMap[condition] || condition;
  };

  // Format source type
  const formatSourceType = (sourceType) => {
    const sourceTypeMap = {
      'PURCHASED': 'Purchased',
      'DONATED': 'Donated',
      'LEASED': 'Leased',
    };
    return sourceTypeMap[sourceType] || sourceType;
  };

  const displayStatus = formatStatus(assetDetails.status);
  const computedSpecLabel = assetDetails.specLabel || buildSpecLabel(assetDetails);

  const getStatusColor = () => {
    switch (assetDetails.status) {
      case 'REPAIR':
        return 'text-red-600';
      case 'ALLOCATED':
        return 'text-green-600';
      case 'IN_STOCK':
        return 'text-blue-600';
      case 'SCRAP':
        return 'text-gray-600';
      case 'PARTED_OUT':
        return 'text-orange-600';
      case 'DISPOSED':
        return 'text-purple-600';
      default:
        return 'text-gray-900';
    }
  };

  const getConditionColor = () => {
    switch (assetDetails.condition) {
      case 'WORKING':
        return 'text-green-600';
      case 'MINOR_ISSUES':
        return 'text-yellow-600';
      case 'NOT_WORKING':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  // Left column sections (30%) - Multiple smaller information cards 
  const leftSections = [
    {
      title: 'Quick Info',
      color: 'theme',
      itemsGrid: true, // 2 column grid
      items: [
        { label: 'Status', value: displayStatus, className: `font-semibold ${getStatusColor()}` },
        { label: 'Condition', value: formatCondition(assetDetails.condition), className: `font-semibold ${getConditionColor()}` },
        { label: 'Asset Type', value: assetDetails.assetType?.name || 'N/A' },
        { label: 'Campus', value: assetDetails.campus?.name || 'N/A' },
        { label: 'Location', value: assetDetails.location?.name || 'N/A' },
      ],
    },
    // {
    //   title: 'Accessories',
    //   color: 'theme',
    //   itemsGrid: true,
    //   items: [
    //     { label: 'Charger', value: assetDetails.charger ? 'Yes' : 'No', className: assetDetails.charger ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold' },
    //   ],
    // },
    // {
    //   title: 'Notes & Additional Information',
    //   color: 'theme',
    //   items: [
    //     { label: 'Notes', value: assetDetails.notes || 'No notes available' },
    //   ],
    // },
    {
      title: 'MOVEMENT HISTORY',
      color: 'theme',
      content: <MovementTimeline movements={assetDetails.assetMovements || []} />,
    },
    {
      title: 'MAINTENANCE HISTORY',
      color: 'theme',
      content: (
        <MaintenanceHistoryTimeline
          maintenanceHistory={assetDetails.maintenanceHistory || []}
          inspectionHistory={assetDetails.inspectionHistory || []}
          insurance={assetDetails.insurance || []}
        />
      ),
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'Asset Information',
      color: 'theme',
      itemsGrid: true, // Enable 2-column grid layout
      items: (() => {
        const categoryName = assetDetails.assetType?.assetCategory?.name;
        const assetTypeName = assetDetails.assetType?.name;

        // Asset Type & Category — basic identification fields
        const typeItems = [
          { label: 'Asset Type', value: assetTypeName || 'N/A' },
          { label: 'Asset Category', value: categoryName || 'N/A' },
        ];

        // Brand & Model — show for all categories
        const brandModelItems = [
          { label: 'Brand', value: assetDetails.brand || 'N/A' },
          { label: 'Model', value: assetDetails.model || 'N/A' },
        ];

        // Get category-specific fields based on asset category
        const categoryItems = getCategoryDisplayItems(categoryName, assetTypeName, assetDetails);

        // Show Spec Label only if available (IT & Electronics assets)
        const specItems = computedSpecLabel && computedSpecLabel !== 'N/A'
          ? [{ label: 'Spec Label', value: computedSpecLabel, className: 'col-span-2' }]
          : [];

        // Charger — only show if backend sends a non-null value
        const accessoryItems = assetDetails.charger !== null && assetDetails.charger !== undefined
          ? [{ 
            label: 'Charger', 
            value: assetDetails.charger ? 'Yes' : 'No', 
            className: assetDetails.charger ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold',
          }]
        : [];
        
        // Notes — full width at the bottom
        const notesItems = [
          { label: 'Notes', value: assetDetails.notes || 'No notes available', className: 'col-span-2' },
        ];

        return [...typeItems, ...brandModelItems, ...categoryItems, ...specItems, ...accessoryItems, ...notesItems];
      })(),
    },
    {
      title: 'Purchase Info',
      color: 'theme',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Source Type', value: formatSourceType(assetDetails.sourceType) || 'N/A' },
        { label: 'Owned By', value: assetDetails.ownedBy?.toUpperCase() || 'N/A' },
        { label: 'Source By', value: assetDetails.sourceBy || 'N/A' },
        { label: 'Purchase Date', value: assetDetails.purchaseDate ? new Date(assetDetails.purchaseDate).toLocaleDateString() : 'N/A' },
        { label: 'Cost', value: assetDetails.cost ? `₹${assetDetails.cost.toLocaleString()}` : 'N/A' },
        { label: 'Purchase Bill', value: assetDetails.purchaseBillDetails?.url ? <a href={assetDetails.purchaseBillDetails.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{assetDetails.purchaseBillDetails.name}</a> : 'N/A' },
        { label: 'Bill Uploaded By', value: assetDetails.purchaseBillDetails?.uploadedBy ? `${assetDetails.purchaseBillDetails.uploadedBy.firstName} ${assetDetails.purchaseBillDetails.uploadedBy.lastName} (${assetDetails.purchaseBillDetails.uploadedBy.email})` : 'N/A' },
      ],
    },
    {
      title: 'System Information',
      color: 'theme',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Asset Category', value: assetDetails.assetType?.assetCategory?.name || assetDetails.assetType?.category || 'N/A' },
        { label: 'Campus Code', value: assetDetails.campus?.code || 'N/A' },
        { label: 'Created At', value: assetDetails.createdAt ? new Date(assetDetails.createdAt).toLocaleString() : 'N/A' },
        { label: 'Updated At', value: assetDetails.updatedAt ? new Date(assetDetails.updatedAt).toLocaleString() : 'N/A' },
      ],
    },
  ];

  return (
    <>
      {/* Admin-initiated return modal — only shown for ALLOCATED assets */}
      <FormModal
        isOpen={modalAction === 'INITIATE_RETURN'}
        onClose={() => { setModalAction(null); setCoordinatorCampusId(null); formStateRef.current = {}; setLocalFormState({}); hasToastedRef.current = null; }}
        componentName={`Initiate Return — ${assetDetails.assetTag}`}
        actionType="Initiate Return on Behalf of User"
        fields={returnFormFields}
        validationSchema={returnAssetValidationSchema}
        onSubmit={handleReturnSubmit}
        onFormDataChange={handleReturnFormChange}
        isSubmitting={isSubmitting || isReturnSubmitting}
        helpText={(() => {
          const allocation = assetDetails.allocations?.[0];
          const userName = allocation
            ? `${allocation.userFirstName || ''} ${allocation.userLastName || ''}`.trim() || allocation.userName || allocation.userId
            : 'unknown user';
          return `Admin-initiated return for asset ${assetDetails.assetTag}. Currently allocated to: ${userName}. Fill in the return details on behalf of the student.`;
        })()}
        size="medium"
      />
      <FormModal
        isOpen={modalAction === 'CHANGE_LOCATION'}
        onClose={() => setModalAction(null)}
        componentName={assetDetails.assetTag}
        actionType="CHANGE_LOCATION"
        fields={getChangeLocationFields()}
        validationSchema={changeLocationValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        helpText={`Current location: ${assetDetails.location?.name || 'N/A'} (${assetDetails.campus?.name || 'N/A'}) — Select a new location within the same campus.`}
        size="medium"
      />
      <FormModal
        isOpen={modalAction !== null && modalAction !== 'CHANGE_LOCATION' && modalAction !== 'INITIATE_RETURN' && modalAction !== 'INSPECTION_LOG' && modalAction !== 'SERVICE_LOG' && modalAction !== 'AMC_RENEWAL'}
        onClose={() => setModalAction(null)}
        componentName={assetDetails.assetTag}
        actionType={modalAction === 'IN_STOCK' ? 'Move to In Stock' : modalAction === 'REPAIR' ? 'Put in Repair' : modalAction === 'DISPOSE' ? 'Mark as Disposed' : 'Scrap this Device'}
        fields={modalAction === 'IN_STOCK' ? inStockFields : modalAction === 'REPAIR' ? repairFields : modalAction === 'DISPOSE' ? disposeFields : scrapFields}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting || isMovingToStock}
        helpText={
          modalAction === 'IN_STOCK'
            ? 'Add notes for moving this asset back to In Stock. The status and condition will be updated.'
            : modalAction === 'REPAIR'
            ? 'Provide details about the issue. The asset status will be updated to Under Repair.'
            : modalAction === 'DISPOSE'
            ? 'Provide a reason for disposal. This will mark the asset as disposed and no longer in service.'
            : 'Provide a reason for scrapping. This will mark the asset as no longer in service.'
        }
      />
      <FormModal
        isOpen={modalAction === 'INSPECTION_LOG'}
        onClose={() => setModalAction(null)}
        componentName={`Log Inspection — ${assetDetails.assetTag}`}
        actionType="Log Inspection"
        fields={inspectionLogFields}
        validationSchema={inspectionLogValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        size="medium"
      />
      <FormModal
        isOpen={modalAction === 'SERVICE_LOG'}
        onClose={() => setModalAction(null)}
        componentName={`Log Service — ${assetDetails.assetTag}`}
        actionType="Log Service"
        fields={serviceLogFields}
        validationSchema={serviceLogValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        size="medium"
      />
      <FormModal
        isOpen={modalAction === 'AMC_RENEWAL'}
        onClose={() => setModalAction(null)}
        componentName={`Log AMC Renewal — ${assetDetails.assetTag}`}
        actionType="Log AMC Renewal"
        fields={amcRenewalFields}
        validationSchema={amcRenewalValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        size="medium"
      />
      <DetailsPage
        title={`ASSET: ${assetDetails.assetTag}`}
        subtitle={`Status: ${displayStatus} | Condition: ${formatCondition(assetDetails.condition)}`}
        subtitleColor={getStatusColor()}
        leftSections={leftSections}
        rightSections={rightSections}
        showTimeline={false}
        onBack={onBack}
        headerActions={
          isCampusManager ? null : (
          <>
            {isAdmin && assetDetails.status === 'ALLOCATED' && assetDetails.consignments?.[0]?.status === 'DELIVERED' && assetDetails.consignmentReturnAssetStatus !== 'PENDING' && (
              <CustomButton
                text="Initiate Return"
                variant="warning"
                onClick={() => setModalAction('INITIATE_RETURN')}
              />
            )}
            <CustomButton
              text="Change Location"
              variant="secondary"
              onClick={() => setModalAction('CHANGE_LOCATION')}
            />
            <CustomButton
              text={assetDetails.status === 'REPAIR' ? 'Move to in Stock' : 'Moved to Repair'}
              variant="warning"
              onClick={() => {
                if (assetDetails.status === 'REPAIR') {
                  setModalAction('IN_STOCK');
                } else {
                  setModalAction('REPAIR');
                }
              }}
            />
            <CustomButton
              text="Mark as Disposed"
              variant="danger"
              onClick={() => setModalAction('DISPOSE')}
            />
            <CustomButton
              text="Mark as Not Working"
              disabled={assetDetails?.ownedBy === 'lnw'}
              variant="secondary"
              onClick={() => setModalAction('SCRAP')}
            />
            <CustomButton
              text="Inspection Log"
              variant="info"
              onClick={() => setModalAction('INSPECTION_LOG')}
            />
            <CustomButton
              text="Service Log"
              variant="purple"
              onClick={() => setModalAction('SERVICE_LOG')}
            />
            <CustomButton
              text="AMC Renew"
              variant="success"
              onClick={() => setModalAction('AMC_RENEWAL')}
            />
          </>
          )
        }
      />
    </>
  );
}
