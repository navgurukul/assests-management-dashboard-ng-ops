import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

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
    type: 'textarea',
    placeholder: 'Assets will be loaded from selected allocation',
    required: false,
    disabled: true,
    rows: 2,
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
    type: 'api-autocomplete',
    placeholder: 'Select courier service provider',
    apiUrl: baseUrl + '/courier-services',
    queryKey: ['courier-services'],
    labelKey: 'name',
    valueKey: 'id',
    required: true,
  },
  {
    name: 'trackingLink',
    label: 'Tracking Link',
    type: 'text',
    placeholder: 'Enter tracking link or leave to auto-populate',
    required: false,
  },
  {
    name: 'trackingId',
    label: 'Tracking ID',
    type: 'text',
    placeholder: 'Enter tracking ID manually',
    required: false,
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
  assets: '',
  source: '',
  destination: '',
  courierServiceId: '',
  trackingLink: '',
  trackingId: '',
  shippedAt: '',
  estimatedDeliveryDate: '',
  notes: '',
};
