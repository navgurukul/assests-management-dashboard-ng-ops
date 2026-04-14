import * as Yup from 'yup';
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const assetFormFields = [
  {
    name: 'assetTypeId',
    label: 'Asset Type',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset type',
    apiUrl: baseUrl + '/asset-types',
    queryKey: ['asset-types'],
    labelKey: 'name',
    valueKey: 'id',
    required: true,
    filterCategory: 'DEVICE',
    companionField: 'assetTypeName',
    companionKey: 'name',
    onFieldChange: 'onAssetTypeChange',
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'api-autocomplete',
    placeholder: 'Search and select brand',
    apiUrl: '',// No API URL since we are using static items for brands
    queryKey: [],
    labelKey: 'label',
    valueKey: 'value',
    staticItems: [
      { label: 'Dell', value: 'Dell' },
      { label: 'HP', value: 'HP' },
      { label: 'Lenovo', value: 'Lenovo' },
      { label: 'Acer', value: 'Acer' },
      { label: 'ASUS', value: 'ASUS' },
      { label: 'Apple', value: 'Apple' },
      { label: 'MSI', value: 'MSI' },
      { label: 'Samsung', value: 'Samsung' },
      { label: 'Microsoft', value: 'Microsoft' },
      { label: 'Toshiba', value: 'Toshiba' },
    ],
    required: true,
  },
  {
    name: 'model',
    label: 'Model',
    type: 'text',
    placeholder: 'Enter model (e.g., Latitude 5400)',
    required: true,
  },
  // {
  //   name: 'specLabel',
  //   label: 'Specification Label',
  //   type: 'text',
  //   placeholder: 'Enter full specs (e.g., Intel i5, 8GB RAM, 256GB SSD)',
  //   required: true,
  // },
  {
    name: 'processor',
    label: 'Processor',
    type: 'text',
    placeholder: 'Enter processor (e.g., i5, i7, Ryzen 5)',
    required: false,
    showIf: { field: 'assetTypeName', value: ['Laptop', 'Desktop', 'Tablet', 'Smartphone', 'Server', 'CPU'] },
  },
  {
    name: 'ramSizeGB',
    label: 'RAM Size (GB)',
    type: 'api-autocomplete',
    placeholder: 'Search and select RAM size (GB)',
    apiUrl: '', // No API URL since we are using static items for RAM sizes 
    queryKey: [],
    labelKey: 'label',
    valueKey: 'value',
    staticItems: [
      { label: '4 GB', value: '4' },
      { label: '8 GB', value: '8' },
      { label: '12 GB', value: '12' },
      { label: '16 GB', value: '16' },
      { label: '24 GB', value: '24' },
      { label: '32 GB', value: '32' },
      { label: '64 GB', value: '64' },
    ],
    required: false,
    showIf: { field: 'assetTypeName', value: ['Laptop', 'Desktop', 'Tablet', 'Smartphone', 'Server', 'RAM'] },
  },
  {
    name: 'storageSizeGB',
    label: 'Storage Size (GB)',
    type: 'api-autocomplete',
    placeholder: 'Search and select storage size (GB)',
    apiUrl: '', // No API URL since we are using static items for storage sizes
    queryKey: [],
    labelKey: 'label',
    valueKey: 'value',
    staticItems: [
      { label: '128 GB', value: '128' },
      { label: '256 GB', value: '256' },
      { label: '512 GB', value: '512' },
      { label: '1024 GB (1 TB)', value: '1024' }
    ],
    required: false,
    showIf: { field: 'assetTypeName', value: ['Laptop', 'Desktop', 'Tablet', 'Smartphone', 'Server', 'External Hard Drive', 'USB Flash Drive', 'SSD', 'HDD'] },
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
    apiUrl: baseUrl + '/campuses',
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
    apiUrl: baseUrl + '/locations/campus/',
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
      // { value: 'REPAIR', label: 'Under Repair' },
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
    name: 'sourceBy',
    label: 'Source By',
    type: 'text',
    placeholder: 'Enter source by',
    required: true,
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
    label: 'Charger Included',
    type: 'checkbox',
    required: false,
    showIf: { field: 'assetTypeName', value: ['Laptop', 'Tablet', 'Smartphone'] },
  },
];

export const assetValidationSchema = Yup.object().shape({
  assetTypeId: Yup.string().required('Asset type is required'),
  brand: Yup.string()
    .required('Brand is required')
    .min(2, 'Brand must be at least 2 characters'),
  model: Yup.string()
    .required('Model is required')
    .min(2, 'Model must be at least 2 characters'),
  assetTypeName: Yup.string(),
  processor: Yup.string().when('assetTypeName', {
    is: (val) => ['Laptop', 'Desktop', 'Server', 'CPU'].includes(val),
    then: (schema) => schema.required('Processor is required').min(2, 'Processor must be at least 2 characters'),
    otherwise: (schema) => schema.notRequired().min(0),
  }),
  ramSizeGB: Yup.string()
    .nullable()
    .when('assetTypeName', {
      is: (val) => ['Laptop', 'Desktop', 'Server'].includes(val),
      then: (schema) => schema.required('RAM size is required'),
      otherwise: (schema) => schema.notRequired(),
    })
    .test('valid-ram', 'RAM size must be at least 1 GB', function(value) {
      if (!value) return true;
      const num = parseInt(value, 10);
      return num >= 1;
    }),
  storageSizeGB: Yup.number()
    .nullable()
    .when('assetTypeName', {
      is: (val) => ['External Hard Drive', 'USB Flash Drive', 'SSD', 'HDD'].includes(val),
      then: (schema) => schema.required('Storage size is required').min(1, 'Storage size must be at least 1 GB'),
      otherwise: (schema) => schema.notRequired().min(0),
    }),
  serialNumber: Yup.string()
    .required('Serial number is required')
    .min(2, 'Serial number must be at least 2 characters'),
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
  sourceBy: Yup.string()
    .required('Source by is required')
    .min(2, 'Source by must be at least 2 characters'),
  purchaseDate: Yup.date().required('Purchase date is required'),
  cost: Yup.number()
    .nullable()
    .min(0, 'Cost must be a positive number')
    .max(9999999, 'Cost cannot exceed 99,99,999'),
  notes: Yup.string(),
  charger: Yup.boolean(),
});

export const assetInitialValues = {
  assetTypeId: '',
  assetTypeName: '',
  brand: '',
  model: '',
  processor: '',
  ramSizeGB: '',
  storageSizeGB: '',
  serialNumber: '',
  campusId: '',
  currentLocationId: '',
  status: 'IN_STOCK',
  condition: 'WORKING',
  sourceType: 'PURCHASED',
  sourceBy: '',
  purchaseDate: '',
  cost: '',
  notes: '',
  charger: false,
};
