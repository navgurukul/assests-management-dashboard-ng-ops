/**
 * Data Transformation Utilities
 * 
 * This file contains reusable functions for transforming API data
 * into table-friendly formats used across Assets, Components, and Allocations.
 */

/**
 * Format asset status codes to readable text
 * @param {string} status - Status code from API
 * @returns {string} Readable status text
 */
export const formatAssetStatus = (status) => {
  const statusMap = {
    'IN_STOCK': 'In Stock',
    'ALLOCATED': 'Allocated',
    'REPAIR': 'Under Repair',
    'SCRAP': 'Scrap',
    'PARTED_OUT': 'Parted Out',
  };
  return statusMap[status] || status || 'N/A';
};

/**
 * Format component status codes to readable text
 * @param {string} status - Status code from API
 * @returns {string} Readable status text
 */
export const formatComponentStatus = (status) => {
  const statusMap = {
    'IN_STOCK': 'In Stock',
    'INSTALLED': 'Installed',
    'SCRAP': 'Scrap',
  };
  return statusMap[status] || status || 'N/A';
};

/**
 * Format condition codes to readable text
 * @param {string} condition - Condition code from API
 * @returns {string} Readable condition text
 */
export const formatCondition = (condition) => {
  const conditionMap = {
    'NEW': 'New',
    'WORKING': 'Working',
    'DAMAGED': 'Damaged',
    'FAULTY': 'Faulty',
  };
  return conditionMap[condition] || condition || 'N/A';
};

/**
 * Format source type codes to readable text
 * @param {string} sourceType - Source type code from API
 * @returns {string} Readable source type text
 */
export const formatSourceType = (sourceType) => {
  const sourceTypeMap = {
    'PURCHASED': 'Purchased',
    'DONATED': 'Donated',
    'LEASED': 'Leased',
    'NEW_PURCHASE': 'New Purchase',
    'EXTRACTED': 'Extracted',
  };
  return sourceTypeMap[sourceType] || sourceType || 'N/A';
};


export const formatAllocationReason = (reason) => {
  const reasonMap = {
    'JOINER': 'Joiner',
    'REPAIR': 'Repair',
    'REPLACEMENT': 'Replacement',
    'LOANER': 'Loaner',
  };
  return reasonMap[reason] || reason || 'N/A';
};

/**
 * Format date string to locale date string
 * @param {string} dateString - ISO date string from API
 * @returns {string} Formatted date string or 'N/A'
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Format currency value with rupee symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string or 'N/A'
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return `₹${amount.toLocaleString()}`;
};

/**
 * Format storage size with GB unit
 * @param {number} sizeGB - Size in GB
 * @returns {string} Formatted size string or 'N/A'
 */
export const formatStorageSize = (sizeGB) => {
  if (!sizeGB) return 'N/A';
  return `${sizeGB} GB`;
};


export const getNestedValue = (obj, path, fallback = 'N/A') => {
  if (!obj || !path) return fallback;
  
  const value = path.split('.').reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : null;
  }, obj);
  
  return value || fallback;
};

/**
 * Transform asset data for table display
 * @param {object} asset - Raw asset data from API
 * @returns {object} Transformed asset data
 */
export const transformAssetForTable = (asset) => {
  return {
    id: asset.id,
    assetTag: asset.assetTag,
    type: getNestedValue(asset, 'assetType.name', 'Unknown'),
    brand: asset.brand || 'N/A',
    model: asset.model || 'N/A',
    campus: getNestedValue(asset, 'campus.name'),
    status: formatAssetStatus(asset.status),
    location: getNestedValue(asset, 'location.name'),
    processor: asset.processor || 'N/A',
    ramSizeGB: formatStorageSize(asset.ramSizeGB),
    storageSizeGB: formatStorageSize(asset.storageSizeGB),
    serialNumber: asset.serialNumber || 'N/A',
    condition: formatCondition(asset.condition),
    sourceType: formatSourceType(asset.sourceType),
    ownedBy: asset.ownedBy || 'N/A',
    purchaseDate: formatDate(asset.purchaseDate),
    cost: formatCurrency(asset.cost),
    charger: asset.charger,
    bag: asset.bag,
    specLabel: asset.specLabel || 'N/A',
    sourceBy: asset.sourceBy || 'N/A',
    notes: asset.notes || 'N/A',
    createdAt: formatDate(asset.createdAt),
    updatedAt: formatDate(asset.updatedAt),
    // Store full asset data for details page
    assetData: asset,
  };
};

/**
 * Transform component data for table display
 * @param {object} component - Raw component data from API
 * @returns {object} Transformed component data
 */
export const transformComponentForTable = (component) => {
  return {
    id: component.id,
    componentTag: component.componentTag || 'N/A',
    type: getNestedValue(component, 'componentType.name'),
    brand: component.brand || 'N/A',
    model: component.model || 'N/A',
    specifications: component.specifications || 'N/A',
    serialNumber: component.serialNumber || 'N/A',
    source: formatSourceType(component.source),
    status: formatComponentStatus(component.status),
    condition: formatCondition(component.condition),
    campus: getNestedValue(component, 'campus.campusName') || getNestedValue(component, 'campus.name'),
    location: getNestedValue(component, 'location.name'),
    storage: component.storageId || getNestedValue(component, 'storage.name'),
    shelfNumber: component.shelfNumber || 'N/A',
    purchaseDate: formatDate(getNestedValue(component, 'purchaseDetails.purchaseDate', null)),
    purchasePrice: formatCurrency(getNestedValue(component, 'purchaseDetails.purchasePrice', null)),
    warrantyExpiryDate: formatDate(getNestedValue(component, 'purchaseDetails.warrantyExpiryDate', null)),
    vendorName: getNestedValue(component, 'purchaseDetails.vendorName'),
    ownedBy: component.ownedBy || 'N/A',
    notes: component.notes || 'N/A',
    conditionNotes: component.conditionNotes || 'N/A',
    createdAt: formatDate(component.createdAt),
    updatedAt: formatDate(component.updatedAt),
    // Store full component data for details page
    componentData: component,
  };
};


export const transformAllocationForTable = (allocation) => {
  // Try multiple possible field paths for user name
  const userName = getNestedValue(allocation, 'user.name') || 
                   getNestedValue(allocation, 'user.userName') ||
                   getNestedValue(allocation, 'user.fullName') ||
                   getNestedValue(allocation, 'user.email') ||
                   allocation.userName ||
                   allocation.userId || 
                   'N/A';
  
  // Handle asset display - supports both single asset and multiple assets
  let assetDisplay = 'N/A';
  if (allocation.assetIds && Array.isArray(allocation.assetIds) && allocation.assetIds.length > 0) {
    // Multiple assets or bulk allocation
    assetDisplay = allocation.assetIds.length === 1 
      ? allocation.assetIds[0] 
      : `${allocation.assetIds.length} Assets`;
  } else if (getNestedValue(allocation, 'asset.assetTag')) {
    assetDisplay = allocation.asset.assetTag;
  } else if (allocation.assetId) {
    assetDisplay = allocation.assetId;
  }
  
  // Format campus display — prefer nested object name, fallback to ID
  const sourceCampus = getNestedValue(allocation, 'sourceCampus.campusName', null) ||
                       getNestedValue(allocation, 'sourceCampus.name', null) ||
                       allocation.sourceCampusId || 'N/A';

  const destinationCampus = getNestedValue(allocation, 'destinationCampus.campusName', null) ||
                             getNestedValue(allocation, 'destinationCampus.name', null) ||
                             allocation.destinationCampusId || 'N/A';

  return {
    id: allocation.id,
    allocationId: allocation.id || 'N/A',
    assetTag: assetDisplay,
    allocationType: allocation.allocationType || 'N/A',
    userName: userName,
    startDate: formatDate(allocation.createdAt || allocation.startDate),
    endDate: allocation.status === 'ACTIVE' ? 'Active' : formatDate(allocation.updatedAt || allocation.endDate),
    reason: formatAllocationReason(allocation.allocationReason),
    status: allocation.status === 'ACTIVE' ? 'Active' : 'Returned',
    isActive: allocation.status === 'ACTIVE',
    assetCount: allocation.assetIds?.length || 1,
    assetIds: allocation.assetIds || [],
    deviceSelectionMode: allocation.deviceSelectionMode || 'N/A',
    sourceCampus,
    destinationCampus,
    isTemporary: allocation.isTemporary ? 'Yes' : 'No',
    expectedReturnDate: allocation.expectedReturnDate ? formatDate(allocation.expectedReturnDate) : 'N/A',
    ticketId: allocation.ticketId || 'N/A',
    notes: allocation.notes || 'N/A',
    createdAt: formatDate(allocation.createdAt),
    // Store full allocation data
    allocationData: allocation,
  };
};

/**
 * Format consignment status codes to readable text
 * Supported statuses: draft, dispatched, delivered
 * @param {string} status - Status code from API
 * @returns {string} Readable status text
 */
export const formatConsignmentStatus = (status) => {
  const statusMap = {
    'DRAFT': 'Draft',
    'draft': 'Draft',
    'DISPATCHED': 'Dispatched',
    'dispatched': 'Dispatched',
    'DELIVERED': 'Delivered',
    'delivered': 'Delivered',
  };
  return statusMap[status] || status || 'N/A';
};

/**
 * Transform consignment data for table display
 * @param {object} consignment - Raw consignment data from API
 * @returns {object} Transformed consignment data
 */
export const transformConsignmentForTable = (consignment) => {
  const allocationUser = getNestedValue(consignment, 'allocation.user', null);
  const normalizedAllocatedTo = (() => {
    if (allocationUser && typeof allocationUser === 'object') {
      const fullName = `${allocationUser.firstName || ''} ${allocationUser.lastName || ''}`.trim();
      return {
        name:
          allocationUser.name ||
          fullName ||
          allocationUser.username ||
          allocationUser.email ||
          allocationUser.id ||
          '-',
        email: allocationUser.email || '',
      };
    }

    if (consignment.allocatedTo && typeof consignment.allocatedTo === 'object') {
      return consignment.allocatedTo;
    }

    if (consignment.assignedTo && typeof consignment.assignedTo === 'object') {
      return consignment.assignedTo;
    }

    if (typeof consignment.allocatedTo === 'string' && consignment.allocatedTo.trim()) {
      return { name: consignment.allocatedTo.trim(), email: '' };
    }

    if (typeof consignment.assignedTo === 'string' && consignment.assignedTo.trim()) {
      return { name: consignment.assignedTo.trim(), email: '' };
    }

    return null;
  })();

  return {
    id: consignment.id,
    consignmentCode: consignment.consignmentCode || consignment.code || `CON-${consignment.id}`,
    status: formatConsignmentStatus(consignment.status),
    allocationCode: getNestedValue(consignment, 'allocation.allocationCode') || consignment.allocationCode || 'N/A',
    courierService:
      consignment.courierPartnerName ||
      consignment.courierName ||
      getNestedValue(consignment, 'courierService.name') ||
      consignment.courierServiceName ||
      'N/A',
    source: consignment.source || getNestedValue(consignment, 'allocation.sourceCampus.name') || 'N/A',
    destination: consignment.destination || getNestedValue(consignment, 'allocation.destinationCampus.name') || 'N/A',
    shippedAt: formatDate(consignment.shippedAt),
    estimatedDeliveryDate: formatDate(consignment.estimatedDeliveryDate),
    deliveredAt: consignment.deliveredAt ? formatDate(consignment.deliveredAt) : 'Not delivered',
    trackingId: consignment.trackingNumber || consignment.trackingId || 'N/A',
    assetCount: consignment.assets?.length || consignment.assetCount || 0,
    allocatedTo: normalizedAllocatedTo,
    createdBy: getNestedValue(consignment, 'createdBy.name') || 'N/A',
    createdAt: formatDate(consignment.createdAt),
    updatedAt: formatDate(consignment.updatedAt),
    // Store full consignment data for details page
    consignmentData: consignment,
  };
};

