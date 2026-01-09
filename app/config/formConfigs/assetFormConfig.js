import * as Yup from 'yup';

export const assetFormFields = [
  {
    name: 'assetTypeId',
    label: 'Asset Type',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset type',
    apiUrl: 'https://asset-dashboard.navgurukul.org/api/asset-types',
    queryKey: ['asset-types'],
    labelKey: 'name',
    valueKey: 'id',
    required: true,
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'text',
    placeholder: 'Enter brand name (e.g., Dell, HP, Lenovo)',
    required: true,
  },
  {
    name: 'model',
    label: 'Model',
    type: 'text',
    placeholder: 'Enter model (e.g., Latitude 5400)',
    required: true,
  },
  {
    name: 'specLabel',
    label: 'Specification Label',
    type: 'text',
    placeholder: 'Enter full specs (e.g., Intel i5, 8GB RAM, 256GB SSD)',
    required: true,
  },
  {
    name: 'processor',
    label: 'Processor',
    type: 'text',
    placeholder: 'Enter processor (e.g., i5, i7, Ryzen 5)',
    required: false,
  },
  {
    name: 'ramSizeGB',
    label: 'RAM Size (GB)',
    type: 'number',
    placeholder: 'Enter RAM size in GB (e.g., 8, 16, 32)',
    required: false,
    min: 0,
  },
  {
    name: 'storageSizeGB',
    label: 'Storage Size (GB)',
    type: 'number',
    placeholder: 'Enter storage size in GB (e.g., 256, 512, 1024)',
    required: false,
    min: 0,
  },
  {
    name: 'serialNumber',
    label: 'Serial Number',
    type: 'text',
    placeholder: 'Enter manufacturer serial number',
    required: true,
  },
  {
    name: 'campusId',
    label: 'Campus',
    type: 'api-autocomplete',
    placeholder: 'Search and select campus',
    apiUrl: 'https://asset-dashboard.navgurukul.org/api/campuses',
    queryKey: ['campuses'],
    labelKey: 'campusName',
    valueKey: 'id',
    required: true,
  },
  {
    name: 'currentLocationId',
    label: 'Current Location',
    type: 'api-autocomplete',
    placeholder: 'Search and select location',
    apiUrl: 'https://asset-dashboard.navgurukul.org/api/locations/campus',
    queryKey: ['locations'],
    labelKey: 'name',
    valueKey: 'id',
    required: true,
    dependsOn: {
      field: 'campusId',
      paramKey: 'campusId',
    },
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Select asset status',
    required: true,
    options: [
      { value: 'IN_STOCK', label: 'In Stock' },
      { value: 'ALLOCATED', label: 'Allocated' },
      { value: 'REPAIR', label: 'Under Repair' },
      { value: 'SCRAP', label: 'Scrap' },
      { value: 'PARTED_OUT', label: 'Parted Out' },
    ],
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    placeholder: 'Select asset condition',
    required: true,
    options: [
      { value: 'WORKING', label: 'Working' },
      { value: 'MINOR_ISSUES', label: 'Minor Issues' },
      { value: 'NOT_WORKING', label: 'Not Working' },
    ],
  },
  {
    name: 'sourceType',
    label: 'Source Type',
    type: 'select',
    placeholder: 'Select source type',
    required: true,
    options: [
      { value: 'PURCHASED', label: 'Purchased' },
      { value: 'DONATED', label: 'Donated' },
      { value: 'PERSONAL', label: 'Personal' },
    ],
  },
  {
    name: 'purchaseDate',
    label: 'Purchase Date',
    type: 'date',
    placeholder: 'Select purchase date',
    required: true,
  },
  {
    name: 'cost',
    label: 'Cost',
    type: 'number',
    placeholder: 'Enter purchase cost (optional)',
    required: false,
    min: 0,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add any additional notes or comments',
    required: false,
  },
  {
    name: 'charger',
    label: 'Charger',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'bag',
    label: 'Bag',
    type: 'checkbox',
    required: false,
  },
];

export const assetValidationSchema = Yup.object().shape({
  assetTypeId: Yup.string().required('Asset type is required'),
  brand: Yup.string().required('Brand is required'),
  model: Yup.string().required('Model is required'),
  specLabel: Yup.string().required('Specification label is required'),
  processor: Yup.string(),
  ramSizeGB: Yup.number()
    .nullable()
    .min(0, 'RAM size must be a positive number'),
  storageSizeGB: Yup.number()
    .nullable()
    .min(0, 'Storage size must be a positive number'),
  serialNumber: Yup.string().required('Serial number is required'),
  campusId: Yup.string().required('Campus is required'),
  currentLocationId: Yup.string().required('Current location is required'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['IN_STOCK', 'ALLOCATED', 'REPAIR', 'SCRAP', 'PARTED_OUT'], 'Invalid status'),
  condition: Yup.string()
    .required('Condition is required')
    .oneOf(['WORKING', 'MINOR_ISSUES', 'NOT_WORKING'], 'Invalid condition'),
  sourceType: Yup.string()
    .required('Source type is required')
    .oneOf(['PURCHASED', 'DONATED', 'PERSONAL'], 'Invalid source type'),
  purchaseDate: Yup.date().required('Purchase date is required'),
  cost: Yup.number()
    .nullable()
    .min(0, 'Cost must be a positive number'),
  notes: Yup.string(),
  charger: Yup.boolean(),
  bag: Yup.boolean(),
});

export const assetInitialValues = {
  assetTypeId: '',
  brand: '',
  model: '',
  specLabel: '',
  processor: '',
  ramSizeGB: '',
  storageSizeGB: '',
  serialNumber: '',
  campusId: '',
  currentLocationId: '',
  status: 'IN_STOCK',
  condition: 'WORKING',
  sourceType: 'PURCHASED',
  purchaseDate: '',
  cost: '',
  notes: '',
  charger: false,
  bag: false,
};
