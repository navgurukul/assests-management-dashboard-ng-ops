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
    type: 'api-multi-select',
    placeholder: 'Select assets from the allocation',
    apiUrl: baseUrl + '/assets',
    queryKey: ['assets'],
    labelKey: 'assetTag',
    valueKey: 'id',
    required: true,
    dependsOn: 'allocationId', // Load assets based on selected allocation
    filterKey: 'allocationId', // Filter assets by allocation ID
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
