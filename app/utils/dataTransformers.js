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

/**
 * Format allocation reason codes to readable text
 * @param {string} reason - Reason code from API
 * @returns {string} Readable reason text
 */
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

/**
 * Get nested property value with fallback
 * @param {object} obj - Object to get value from
 * @param {string} path - Dot notation path (e.g., 'campus.name')
 * @param {string} fallback - Fallback value if not found
 * @returns {any} Property value or fallback
 */
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

/**
 * Transform allocation data for table display
 * @param {object} allocation - Raw allocation data from API
 * @returns {object} Transformed allocation data
 */
export const transformAllocationForTable = (allocation) => {
  return {
    id: allocation.id,
    allocationId: allocation.id || 'N/A',
    assetTag: getNestedValue(allocation, 'asset.assetTag') || allocation.assetId || 'N/A',
    userName: getNestedValue(allocation, 'user.name') || allocation.userId || 'N/A',
    startDate: formatDate(allocation.startDate),
    endDate: allocation.endDate ? formatDate(allocation.endDate) : 'Active',
    reason: formatAllocationReason(allocation.allocationReason),
    status: allocation.endDate ? 'Returned' : 'Active',
    isActive: !allocation.endDate,
    // Store full allocation data
    allocationData: allocation,
  };
};

/**
 * Format consignment status codes to readable text
 * @param {string} status - Status code from API
 * @returns {string} Readable status text
 */
export const formatConsignmentStatus = (status) => {
  const statusMap = {
    'PENDING': 'Pending',
    'IN_TRANSIT': 'In Transit',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled',
    'RETURNED': 'Returned',
  };
  return statusMap[status] || status || 'N/A';
};

/**
 * Transform consignment data for table display
 * @param {object} consignment - Raw consignment data from API
 * @returns {object} Transformed consignment data
 */
export const transformConsignmentForTable = (consignment) => {
  return {
    id: consignment.id,
    consignmentCode: consignment.consignmentCode || consignment.code || `CON-${consignment.id}`,
    status: formatConsignmentStatus(consignment.status),
    allocationCode: getNestedValue(consignment, 'allocation.allocationCode') || consignment.allocationCode || 'N/A',
    courierService: getNestedValue(consignment, 'courierService.name') || consignment.courierServiceName || 'N/A',
    source: consignment.source || getNestedValue(consignment, 'allocation.sourceCampus.name') || 'N/A',
    destination: consignment.destination || getNestedValue(consignment, 'allocation.destinationCampus.name') || 'N/A',
    shippedAt: formatDate(consignment.shippedAt),
    estimatedDeliveryDate: formatDate(consignment.estimatedDeliveryDate),
    deliveredAt: consignment.deliveredAt ? formatDate(consignment.deliveredAt) : 'Not delivered',
    trackingId: consignment.trackingId || 'N/A',
    assetCount: consignment.assets?.length || consignment.assetCount || 0,
    createdBy: getNestedValue(consignment, 'createdBy.name') || 'N/A',
    createdAt: formatDate(consignment.createdAt),
    updatedAt: formatDate(consignment.updatedAt),
    // Store full consignment data for details page
    consignmentData: consignment,
  };
};

