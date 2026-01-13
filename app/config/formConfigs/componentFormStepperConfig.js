import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

// Break down the component form into logical steps
export const componentStepperConfig = [
  {
    label: 'Component Source',
    description: 'Specify where the component came from and purchase details',
    fields: [
      {
        name: 'sourceType',
        label: 'Source Type',
        type: 'radio',
        required: true,
        options: [
          { value: 'NEW_PURCHASE', label: 'New Purchase' },
          { value: 'EXTRACTED', label: 'Extracted from Old Device' }
        ]
      },
      // New Purchase fields
      {
        name: 'invoiceNumber',
        label: 'Invoice Number',
        type: 'text',
        placeholder: 'Enter invoice number',
        required: false,
        showIf: { field: 'sourceType', value: 'NEW_PURCHASE' }
      },
      {
        name: 'purchaseOrderNumber',
        label: 'Purchase Order Number',
        type: 'text',
        placeholder: 'Enter PO number',
        required: false,
        showIf: { field: 'sourceType', value: 'NEW_PURCHASE' }
      },
      {
        name: 'purchaseVendorName',
        label: 'Vendor Name',
        type: 'select',
        placeholder: 'Select vendor',
        required: false,
        showIf: { field: 'sourceType', value: 'NEW_PURCHASE' },
        options: [
          { value: 'Vendor A', label: 'Vendor A' },
          { value: 'Vendor B', label: 'Vendor B' },
          { value: 'Vendor C', label: 'Vendor C' },
          { value: 'Vendor D', label: 'Vendor D' },
          { value: 'Vendor E', label: 'Vendor E' }
        ]
      },
      {
        name: 'vendorDetails',
        label: 'Vendor Details',
        type: 'textarea',
        placeholder: 'Enter vendor details',
        required: false,
        showIf: { field: 'sourceType', value: 'NEW_PURCHASE' }
      },
      // Extracted from device fields
      {
        name: 'sourceDeviceTag',
        label: 'Source Device Tag',
        type: 'searchable-select',
        placeholder: 'Search and select device',
        required: false,
        showIf: { field: 'sourceType', value: 'EXTRACTED' }
      },
      {
        name: 'sourceDeviceType',
        label: 'Source Device Type',
        type: 'text',
        placeholder: 'Enter device type',
        required: false,
        showIf: { field: 'sourceType', value: 'EXTRACTED' }
      },
      {
        name: 'extractionDate',
        label: 'Extraction Date',
        type: 'date',
        placeholder: 'Select extraction date',
        required: false,
        showIf: { field: 'sourceType', value: 'EXTRACTED' }
      },
      {
        name: 'extractionReason',
        label: 'Extraction Reason',
        type: 'select',
        placeholder: 'Select reason',
        required: false,
        showIf: { field: 'sourceType', value: 'EXTRACTED' },
        options: [
          { value: 'DEVICE_SCRAP', label: 'Device Scrap' },
          { value: 'UPGRADE', label: 'Upgrade' },
          { value: 'REPAIR', label: 'Repair' },
          { value: 'TESTING', label: 'Testing' },
          { value: 'OTHER', label: 'Other' }
        ]
      },
      {
        name: 'extractionTechnician',
        label: 'Technician Name',
        type: 'select',
        placeholder: 'Select technician',
        required: false,
        showIf: { field: 'sourceType', value: 'EXTRACTED' },
        options: [
          { value: 'Person A', label: 'Person A' },
          { value: 'Person B', label: 'Person B' },
          { value: 'Person C', label: 'Person C' }
        ]
      },
      {
        name: 'condition',
        label: 'Condition',
        type: 'select',
        placeholder: 'Select condition',
        required: true,
        showIf: { field: 'sourceType', value: 'EXTRACTED' },
        options: [
          { value: 'NEW', label: 'New' },
          { value: 'USED', label: 'Used' },
          { value: 'REFURBISHED', label: 'Refurbished' },
          { value: 'FAULTY', label: 'Faulty' },
          { value: 'GOOD', label: 'Good' },
          { value: 'POOR', label: 'Poor' },
          { value: 'MODERATE', label: 'Moderate' }
        ]
      },
      // Purchase Details (only for New Purchase)
      {
        name: 'purchaseDate',
        label: 'Purchase Date',
        type: 'date',
        placeholder: 'Select purchase date',
        required: false,
        showIf: { field: 'sourceType', value: 'NEW_PURCHASE' }
      },
      {
        name: 'purchasePrice',
        label: 'Purchase Price (₹)',
        type: 'number',
        placeholder: 'Enter purchase price',
        required: false,
        min: 0,
        showIf: { field: 'sourceType', value: 'NEW_PURCHASE' }
      },
      {
        name: 'warrantyExpiryDate',
        label: 'Warranty Expiry Date',
        type: 'date',
        placeholder: 'Select warranty expiry date',
        required: false,
        showIf: { field: 'sourceType', value: 'NEW_PURCHASE' }
      }
    ]
  },
  {
    label: 'Basic Information',
    description: 'Enter the core details about the component',
    fields: [
      {
        name: 'componentType',
        label: 'Component Type',
        type: 'api-autocomplete',
        placeholder: 'Search and select component type',
        apiUrl: baseUrl + '/asset-types',
        queryKey: ['asset-types'],
        labelKey: 'name',
        valueKey: 'id',
        required: true,
        filterCategory: 'COMPONENT', // Filter to show only COMPONENT category
      },
      {
        name: 'brand',
        label: 'Brand/Manufacturer',
        type: 'text',
        placeholder: 'e.g., Kingston, Samsung, Seagate',
        required: true
      },
      {
        name: 'modelNumber',
        label: 'Model Number',
        type: 'text',
        placeholder: 'Enter model number',
        required: true
      },
      {
        name: 'specifications',
        label: 'Specifications',
        type: 'text',
        placeholder: 'e.g., 8GB DDR4 2666MHz, 512GB NVMe',
        required: true,
        helpText: 'Detailed specifications of the component'
      },
      {
        name: 'serialNumber',
        label: 'Serial Number',
        type: 'text',
        placeholder: 'Enter serial number',
        required: false
      }
    ]
  },
  {
    label: 'Current Status',
    description: 'Define the component\'s current state and location',
    fields: [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'Select status',
        required: true,
        options: [
          { value: 'WORKING', label: 'Working' },
          { value: 'IN_STOCK', label: 'In Stock' },
          { value: 'INSTALLED', label: 'Installed' },
          { value: 'UNDER_TESTING', label: 'Under Testing' },
          { value: 'FAULTY', label: 'Faulty' },
          { value: 'SCRAP', label: 'Scrap' }
        ]
      },
      // Location fields - shown when status is IN_STOCK
      {
        name: 'campusId',
        label: 'Campus',
        type: 'api-autocomplete',
        placeholder: 'Search and select campus',
        apiUrl: baseUrl + '/campuses',
        queryKey: ['campuses'],
        labelKey: 'campusName',
        valueKey: 'id',
        required: false,
        showIf: { field: 'status', value: 'IN_STOCK' },
      },
      {
        name: 'locationId',
        label: 'Location',
        type: 'api-autocomplete',
        placeholder: 'Search and select location',
        apiUrl: baseUrl + '/locations/campus',
        queryKey: ['locations'],
        labelKey: 'name',
        valueKey: 'id',
        required: false,
        showIf: { field: 'status', value: 'IN_STOCK' },
        dependsOn: {
          field: 'campusId',
          paramKey: 'campusId',
        },
      },
      {
        name: 'almirahId',
        label: 'Almirah/Storage ID',
        type: 'select',
        placeholder: 'Select almirah',
        required: false,
        showIf: { field: 'status', value: 'IN_STOCK' },
        options: [] // To be populated from API based on campus
      },
      {
        name: 'shelfNumber',
        label: 'Shelf Number',
        type: 'text',
        placeholder: 'Enter shelf number',
        required: false,
        showIf: { field: 'status', value: 'IN_STOCK' },
      },
      // Installed fields - shown when status is INSTALLED
      {
        name: 'installedDeviceTag',
        label: 'Device Tag',
        type: 'searchable-select',
        placeholder: 'Search and select device',
        required: false,
        showIf: { field: 'status', value: 'INSTALLED' }
      },
      {
        name: 'installationDate',
        label: 'Installation Date',
        type: 'date',
        placeholder: 'Select installation date',
        required: false,
        showIf: { field: 'status', value: 'INSTALLED' }
      },
      {
        name: 'ownedBy',
        label: 'Owned By',
        type: 'text',
        placeholder: 'Enter owner (e.g., lws)',
        required: false
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Additional notes',
        required: false,
        rows: 3
      }
    ]
  },
  {
    label: 'Documents',
    description: 'Attach bills, invoices, and other documents',
    fields: [
      {
        name: 'documents',
        label: 'Bills/Invoices/Documents',
        type: 'document-selector',
        required: false,
        allowMultiple: true,
        documentType: 'INVOICE',
        helpText: 'You can link to existing Bills or upload new ones. One bill can be linked to multiple components.'
      }
    ]
  }
];

// Same validation schema
export const componentFormValidationSchema = Yup.object().shape({
  componentType: Yup.string().required('Component type is required'),
  brand: Yup.string().required('Brand is required'),
  modelNumber: Yup.string().required('Model number is required'),
  specifications: Yup.string().required('Specifications are required'),
  serialNumber: Yup.string(),
  purchaseDate: Yup.date().when('sourceType', {
    is: 'NEW_PURCHASE',
    then: (schema) => schema.required('Purchase date is required'),
    otherwise: (schema) => schema.notRequired()
  }),
  warrantyExpiryDate: Yup.date(),
  purchasePrice: Yup.number()
    .min(0, 'Price cannot be negative')
    .when('sourceType', {
      is: 'NEW_PURCHASE',
      then: (schema) => schema.required('Purchase price is required'),
      otherwise: (schema) => schema.notRequired()
    }),
  sourceType: Yup.string()
    .oneOf(['NEW_PURCHASE', 'EXTRACTED'])
    .required('Source type is required'),
  status: Yup.string()
    .oneOf(['WORKING', 'IN_STOCK', 'INSTALLED', 'UNDER_TESTING', 'FAULTY', 'SCRAP'])
    .required('Status is required'),
  condition: Yup.string()
    .oneOf(['NEW', 'USED', 'REFURBISHED', 'FAULTY', 'GOOD', 'POOR', 'MODERATE'])
    .when('sourceType', {
      is: 'EXTRACTED',
      then: (schema) => schema.required('Condition is required'),
      otherwise: (schema) => schema.notRequired()
    }),
  notes: Yup.string()
});

// Initial values for form
export const componentFormInitialValues = {
  componentTag: 'COMP-' + Date.now(),
  componentType: '',
  brand: '',
  modelNumber: '',
  specifications: '',
  serialNumber: '',
  purchaseDate: '',
  warrantyExpiryDate: '',
  purchasePrice: '',
  sourceType: 'NEW_PURCHASE',
  invoiceNumber: '',
  purchaseOrderNumber: '',
  purchaseVendorName: '',
  vendorDetails: '',
  sourceDeviceTag: '',
  sourceDeviceType: '',
  extractionDate: '',
  extractionReason: '',
  extractionTechnician: '',
  status: 'IN_STOCK',
  campusId: '',
  almirahId: '',
  shelfNumber: '',
  locationId: '',
  installedDeviceTag: '',
  installationDate: '',
  condition: 'NEW',
  ownedBy: 'lws',
  notes: '',
  documents: []
};
