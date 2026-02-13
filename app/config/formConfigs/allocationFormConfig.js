import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

export const allocationFormFields = [
  {
    name: 'allocationType',
    label: 'Allocation Type',
    type: 'radio',
    required: true,
    options: [
      { value: 'REMOTE', label: 'Remote (Student, Employee, etc.)' },
      { value: 'CAMPUS', label: 'Campus (Bulk Allocation)' },
    ],
  },
  // Remote Allocation Fields (shown when allocationType === 'REMOTE')
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
    showIf: { field: 'allocationType', value: 'REMOTE' },
  },
  {
    name: 'assetId',
    label: 'Asset',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset',
    apiUrl: baseUrl + '/assets',
    queryKey: ['assets'],
    labelKey: 'assetTag',
    valueKey: 'id',
    required: true,
    showIf: { field: 'allocationType', value: 'REMOTE' },
    dependsOn: {
      field: 'campusId',
      paramKey: 'campusId',
    },
    formatLabel: (item) => `${item.assetTag} - ${item.brand || 'N/A'} ${item.model || ''}`,
  },
  {
    name: 'userEmail',
    label: 'User Email',
    type: 'email',
    placeholder: 'Enter user email',
    required: false,
    showIf: { field: 'allocationType', value: 'REMOTE' },
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number',
    type: 'text',
    placeholder: 'Enter phone number',
    required: false,
    showIf: { field: 'allocationType', value: 'REMOTE' },
  },
  {
    name: 'userAddress',
    label: 'User Address',
    type: 'textarea',
    placeholder: 'Enter user address',
    required: false,
    showIf: { field: 'allocationType', value: 'REMOTE' },
  },
  // Campus Allocation Fields (shown when allocationType === 'CAMPUS')
  {
    name: 'sourceCampus',
    label: 'Source Campus',
    type: 'api-autocomplete',
    placeholder: 'Search and select source campus',
    apiUrl: baseUrl + '/campuses',
    queryKey: ['campuses-source'],
    labelKey: 'campusName',
    valueKey: 'campusName',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
  },
  {
    name: 'destinationCampus',
    label: 'Destination Campus',
    type: 'api-autocomplete',
    placeholder: 'Search and select destination campus',
    apiUrl: baseUrl + '/campuses',
    queryKey: ['campuses-destination'],
    labelKey: 'campusName',
    valueKey: 'campusName',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
  }, 
  {
    name: 'campusAssets',
    label: 'Assets',
    type: 'campus-asset-table',
    placeholder: 'Add assets with their working conditions',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
  },
  {
    name: 'assetType',
    label: 'Asset Type',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset type',
    apiUrl: baseUrl + '/asset-types',
    queryKey: ['asset-types-campus'],
    labelKey: 'name',
    valueKey: 'id',
    filterCategory: 'DEVICE',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
  },
  {
    name: 'assetId',
    label: 'Asset ID',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset',
    apiUrl: baseUrl + '/assets',
    queryKey: ['assets-campus'],
    labelKey: 'assetTag',
    valueKey: 'id',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
    dependsOn: {
      field: 'assetType',
      paramKey: 'type',
    },
    formatLabel: (item) => `${item.assetTag} - ${item.brand || 'N/A'} ${item.model || ''}`,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add any additional notes or comments about this allocation',
    required: false,
  },
];

export const allocationValidationSchema = Yup.object().shape({
  allocationType: Yup.string()
    .required('Allocation type is required')
    .oneOf(['REMOTE', 'CAMPUS'], 'Invalid allocation type'),
  
  // Remote allocation validations
  campusId: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.required('Campus is required'),
    }),
  userEmail: Yup.string()
    .email('Invalid email format')
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.nullable(),
    }),
  phoneNumber: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.nullable(),
    }),
  userDepartment: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.nullable(),
    }),
  userAddress: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.nullable(),
    }),
  assetId: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.required('Asset is required'),
    }),
  assetSource: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.nullable(),
    }),
  
  // Campus allocation validations
  sourceCampus: Yup.string()
    .when('allocationType', {
      is: 'CAMPUS',
      then: (schema) => schema.required('Source campus is required'),
    }),
  destinationCampus: Yup.string()
    .when('allocationType', {
      is: 'CAMPUS',
      then: (schema) => schema.required('Destination campus is required'),
    }),
  personRaising: Yup.string()
    .when('allocationType', {
      is: 'CAMPUS',
      then: (schema) => schema.required('Person raising request is required'),
    }),
  campusAssets: Yup.array()
    .when('allocationType', {
      is: 'CAMPUS',
      then: (schema) => schema
        .of(
          Yup.object().shape({
            assetId: Yup.string().required('Asset ID is required'),
            workingCondition: Yup.string().required('Working condition is required'),
          })
        )
        .min(1, 'At least one asset is required'),
    }),
  
  // Common validations
  startDate: Yup.date()
    .required('Allocation date is required'),
  allocationReason: Yup.string()
    .required('Allocation reason is required')
    .oneOf(['JOINER', 'REPAIR', 'REPLACEMENT', 'LOANER', 'CAMPUS_TRANSFER'], 'Invalid allocation reason'),
  notes: Yup.string().nullable(),
});

export const allocationInitialValues = {
  allocationType: 'REMOTE',
  // Remote fields
  campusId: '',
  assetId: '',
  userEmail: '',
  phoneNumber: '',
  userDepartment: '',
  userAddress: '',
  assetSource: '',
  // Campus fields
  sourceCampus: '',
  destinationCampus: '',
  personRaising: '',
  campusAssets: [],
  // Common fields
  startDate: new Date().toISOString().split('T')[0],
  allocationReason: 'JOINER',
  notes: '',
  assetType: '',
  assetId: '',
};
