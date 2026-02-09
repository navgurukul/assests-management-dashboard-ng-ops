import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

// Courier service providers with their tracking URL patterns
export const courierProviders = [
  {
    id: 'dtdc',
    name: 'DTDC',
    trackingUrlPattern: 'https://www.dtdc.in/tracking/mobile/search.asp?invoiceno={trackingId}',
  },
  {
    id: 'indianpost',
    name: 'India Post',
    trackingUrlPattern: 'https://tracking.indiapost.gov.in/status/trackingid?mailid={trackingId}',
  },
  {
    id: 'bluedart',
    name: 'Blue Dart',
    trackingUrlPattern: 'https://www.bluedart.com/onlinetracking.asp?ShipmentNumber={trackingId}',
  },
  {
    id: 'delhivery',
    name: 'Delhivery',
    trackingUrlPattern: 'https://track.delhivery.com/track/package/{trackingId}',
  },
  {
    id: 'flipkart',
    name: 'Flipkart Logistics',
    trackingUrlPattern: 'https://www.flipkart.com/tracking/order/{trackingId}',
  },
];

// ============================================
// STEP 1: Create Consignment (Draft Status)
// ============================================

export const createConsignmentFields = [
  {
    name: 'filterGroup',
    type: 'filter-group',
    filters: [
      {
        name: 'enableCampusFilter',
        label: 'Campus',
        filterFieldName: 'campusId',
        filterField: {
          name: 'campusId',
          label: '',
          type: 'api-autocomplete',
          placeholder: 'Select campus',
          apiUrl: baseUrl + '/campuses',
          queryKey: ['campuses'],
          labelKey: 'campusName',
          valueKey: 'id',
        },
      },
      {
        name: 'enableDateFilter',
        label: 'Date',
        filterFieldName: 'dateFilter',
        filterField: {
          name: 'dateFilter',
          label: '',
          type: 'date',
          placeholder: 'Select date',
        },
      },
    ],
    required: false,
  },
  {
    name: 'allocationId',
    label: 'Allocation ID',
    type: 'api-autocomplete',
    placeholder: 'Search and select allocation',
    apiUrl: baseUrl + '/allocations',
    queryKey: ['allocations'],
    labelKey: 'allocationCode',
    valueKey: 'id',
    required: true,
    buildAdditionalParams: (formData) => {
      const params = {};
      if (formData.enableCampusFilter && formData.campusId) {
        params.campusId = formData.campusId;
      }
      if (formData.enableDateFilter && formData.dateFilter) {
        params.date = formData.dateFilter;
      }
      return params;
    },
  },
  {
    name: 'assets',
    label: 'Assets',
    type: 'multi-select',
    placeholder: 'Select assets from the allocation',
    options: [], // Will be populated dynamically
    required: true,
    description: 'Select one or multiple assets from this allocation',
  },
  {
    name: 'source',
    label: 'Source',
    type: 'text',
    placeholder: 'Auto-populated from allocation',
    required: false,
    disabled: true,
  },
  {
    name: 'destination',
    label: 'Destination',
    type: 'text',
    placeholder: 'Auto-populated from allocation',
    required: false,
    disabled: true,
  },
];

export const createConsignmentValidation = Yup.object().shape({
  allocationId: Yup.string().required('Allocation ID is required'),
  assets: Yup.array()
    .min(1, 'At least one asset must be selected')
    .required('Assets are required'),
});

export const createConsignmentInitialValues = {
  enableCampusFilter: false,
  campusId: '',
  enableDateFilter: false,
  dateFilter: '',
  allocationId: '',
  assets: [],
  source: '',
  destination: '',
};

// ============================================
// STEP 2: Ready to Dispatch (Dispatch Status)
// ============================================

export const readyToDispatchFields = [
  {
    name: 'courierServiceId',
    label: 'Courier Partner',
    type: 'select',
    placeholder: 'Select courier service provider',
    options: courierProviders.map(courier => ({
      value: courier.id,
      label: courier.name,
    })),
    required: true,
  },
];

export const readyToDispatchValidation = Yup.object().shape({
  courierServiceId: Yup.string().required('Courier partner is required'),
});

export const readyToDispatchInitialValues = {
  courierServiceId: '',
};

// ============================================
// STEP 3: Add Transit (In Transit Status)
// ============================================

export const addTransitFields = [
  {
    name: 'courierServiceId',
    label: 'Courier Partner',
    type: 'text',
    placeholder: 'Courier partner',
    required: false,
    disabled: true,
    description: 'Pre-filled from dispatch step',
  },
  {
    name: 'trackingId',
    label: 'Tracking ID',
    type: 'text',
    placeholder: 'Enter tracking ID',
    required: true,
  },
  {
    name: 'trackingLink',
    label: 'Tracking Link',
    type: 'text',
    placeholder: 'Enter tracking link',
    required: false,
  },
];

export const addTransitValidation = Yup.object().shape({
  trackingId: Yup.string().required('Tracking ID is required'),
  trackingLink: Yup.string().url('Must be a valid URL').nullable(),
});

export const addTransitInitialValues = {
  courierServiceId: '',
  trackingId: '',
  trackingLink: '',
};

// ============================================
// Legacy/Full Form Config (Kept for reference)
// ============================================

export const consignmentFormFields = [
  {
    name: 'allocationId',
    label: 'Allocation ID',
    type: 'api-autocomplete',
    placeholder: 'Search and select allocation',
    apiUrl: baseUrl + '/allocations',
    queryKey: ['allocations'],
    labelKey: 'allocationCode',
    valueKey: 'id',
    required: true,
  },
  {
    name: 'assets',
    label: 'Assets',
    type: 'multi-select',
    placeholder: 'Select assets from the allocation',
    options: [], // Will be populated dynamically from allocation
    required: true,
    dependsOn: { field: 'allocationId', paramKey: 'allocationId' },
  },
  {
    name: 'source',
    label: 'Source',
    type: 'text',
    placeholder: 'Auto-populated from allocation',
    required: false,
    disabled: true,
  },
  {
    name: 'destination',
    label: 'Destination',
    type: 'text',
    placeholder: 'Auto-populated from allocation',
    required: false,
    disabled: true,
  },
  {
    name: 'courierServiceId',
    label: 'Courier Service Provider',
    type: 'select',
    placeholder: 'Select courier service provider',
    options: courierProviders.map(courier => ({
      value: courier.id,
      label: courier.name,
    })),
    required: true,
    onFieldChange: 'handleCourierChange',
  },
  {
    name: 'trackingLink',
    label: 'Tracking Link',
    type: 'text',
    placeholder: 'Auto-populated based on courier selection',
    required: false,
    disabled: false,
    readOnly: true,
  },
  {
    name: 'trackingId',
    label: 'Tracking ID',
    type: 'text',
    placeholder: 'Enter tracking ID (will auto-generate tracking link)',
    required: false,
    onFieldChange: 'handleTrackingIdChange',
  },
  {
    name: 'shippedAt',
    label: 'Shipped At',
    type: 'date',
    placeholder: 'Select shipped date',
    required: true,
  },
  {
    name: 'estimatedDeliveryDate',
    label: 'Estimated Delivery Date',
    type: 'date',
    placeholder: 'Select estimated delivery date',
    required: true,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add any additional notes or special instructions',
    required: false,
    rows: 3,
  },
];

export const consignmentValidationSchema = Yup.object().shape({
  allocationId: Yup.string()
    .required('Allocation ID is required'),
  assets: Yup.array()
    .min(1, 'At least one asset must be selected')
    .required('Assets are required'),
  courierServiceId: Yup.string()
    .required('Courier service provider is required'),
  trackingLink: Yup.string()
    .url('Must be a valid URL')
    .nullable(),
  trackingId: Yup.string()
    .nullable(),
  shippedAt: Yup.date()
    .required('Shipped date is required')
    .nullable(),
  estimatedDeliveryDate: Yup.date()
    .required('Estimated delivery date is required')
    .min(Yup.ref('shippedAt'), 'Estimated delivery date must be after shipped date')
    .nullable(),
  notes: Yup.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .nullable(),
});

export const consignmentInitialValues = {
  allocationId: '',
  assets: [],
  source: '',
  destination: '',
  courierServiceId: '',
  trackingLink: '',
  trackingId: '',
  shippedAt: '',
  estimatedDeliveryDate: '',
  notes: '',
};
