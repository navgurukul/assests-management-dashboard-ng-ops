import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api';

export const allocationFormFields = [
  {
    name: 'allocationType',
    label: 'Allocation Type',
    type: 'radio',
    required: true,
    options: [
      { value: 'REMOTE', label: 'Individual (Student,Remote Employee, etc.)' },
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
    onFieldChange: 'clearAssetSelections',
    companionField: 'sourceCampusName',
    companionKey: 'campusName',
  },
  {
    name: 'assetTypeId',
    label: 'Asset Type',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset type',
    apiUrl: baseUrl + '/asset-types',
    queryKey: ['asset-types-remote'],
    labelKey: 'name',
    valueKey: 'id',
    filterCategory: 'DEVICE',
    required: true,
    showIf: { field: 'allocationType', value: 'REMOTE' },
    dependsOn: {
      field: 'campusId',
      paramKey: 'campusId',
    },
    onFieldChange: 'clearAssetId',
  },
  {
    name: 'assetId',
    label: 'Asset',
    type: 'api-autocomplete',
    placeholder: 'Search and select asset',
    apiUrl: baseUrl + '/assets',
    labelKey: 'assetTag',
    valueKey: 'id',
    required: true,
    showIf: { field: 'allocationType', value: 'REMOTE' },
    dependsOn: {
      field: 'assetTypeId',
      paramKey: 'type',
    },
    buildAdditionalParams: (formData) => ({
      campusId: formData?.campusId || undefined,
      status: 'IN_STOCK',
    }),
    emptyContent: 'No available assets. They may be out of stock or already assigned to a consignment.',
    formatLabel: (item) => `${item.assetTag} - ${item.brand || 'N/A'} ${item.model || ''}`,
    renderItem: (item, label) => (
      <div className="flex justify-between items-center w-full">
        <span>{label}</span>
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 text-[8px] rounded-full ${item.isAllocated ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            Allocation: {item.isAllocated ? 'Yes' : 'No'}
          </span>
          <span className={`px-2 py-0.5 text-[8px] rounded-full ${item.isConsignmentCreated ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            Consignment: {item.isConsignmentCreated ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    ),
    isItemDisabled: (item) => item.isAllocated || item.isConsignmentCreated,
    enableSearch: true,
    enablePagination: true,
    pageLimit: 10,
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
    valueKey: 'id',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
    onFieldChange: 'clearSourceCampusSelections',
    companionField: 'sourceCampusName',
    companionKey: 'campusName',
  },
  {
    name: 'destinationCampus',
    label: 'Destination Campus',
    type: 'api-autocomplete',
    placeholder: 'Search and select destination campus',
    apiUrl: baseUrl + '/campuses',
    queryKey: ['campuses-destination'],
    labelKey: 'campusName',
    valueKey: 'id',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
    excludeField: 'sourceCampus',
    companionField: 'destinationCampusName',
    companionKey: 'campusName',
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
    name: 'campusAssets',
    label: 'Assets',
    type: 'campus-asset-table',
    placeholder: 'Add assets with their working conditions',
    required: true,
    showIf: { field: 'allocationType', value: 'CAMPUS' },
  },
  // {
  //   name: 'allocationReason',
  //   label: 'Allocation Reason',
  //   type: 'select',
  //   placeholder: 'Select allocation reason',
  //   required: true,
  //   showIf: { field: 'allocationType', value: 'CAMPUS' },
  //   options: [
  //     {value: 'JOINER', label: 'Joiner (New User)'},
  //     { value: 'NEW_CAMPUS', label: 'New Campus Setup' },
  //     { value: 'CAMPUS_TRANSFER', label: 'Campus Transfer' },
  //     { value: 'REPLACEMENT', label: 'Replacement' },
  //     { value: 'UPGRADE', label: 'Upgrade' },
  //     { value: 'MAINTENANCE', label: 'Maintenance' },
  //     { value: 'OTHER', label: 'Other' },
  //   ],
  // },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add any additional notes or comments about this allocation',
    required: true,
  },
];

export const allocationValidationSchema = Yup.object().shape({
  allocationType: Yup.string()
    .required('Allocation type is required')
    .oneOf(['REMOTE', 'CAMPUS'], 'Invalid allocation type'),
  
  // Remote allocation validations - only when allocationType is REMOTE
  campusId: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.required('Campus is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  assetId: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.required('Asset is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  assetTypeId: Yup.string()
    .when('allocationType', {
      is: 'REMOTE',
      then: (schema) => schema.required('Asset type is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  userEmail: Yup.string()
    .nullable()
    .email('Invalid email format'),
  phoneNumber: Yup.string().nullable(),
  userDepartment: Yup.string().nullable(),
  userAddress: Yup.string().nullable(),
  assetSource: Yup.string().nullable(),
  
  // Campus allocation validations - only when allocationType is CAMPUS
  sourceCampus: Yup.string()
    .when('allocationType', {
      is: 'CAMPUS',
      then: (schema) => schema.required('Source campus is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  destinationCampus: Yup.string()
    .when('allocationType', {
      is: 'CAMPUS',
      then: (schema) =>
        schema
          .required('Destination campus is required')
          .test(
            'not-same-as-source',
            'Destination campus cannot be the same as source campus',
            function (value) {
              return value !== this.parent.sourceCampus;
            }
          ),
      otherwise: (schema) => schema.nullable(),
    }),
  // allocationReason: Yup.string()
  //   .when('allocationType', {
  //     is: 'CAMPUS',
  //     then: (schema) => schema.required('Allocation reason is required'),
  //     otherwise: (schema) => schema.nullable(),
  //   }),
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
      otherwise: (schema) => schema.nullable(),
    }),
  
  // Helper fields for Campus - not validated for submission
  sourceCampusName: Yup.string().nullable(),
  destinationCampusName: Yup.string().nullable(),
  assetType: Yup.string().nullable(),
  
  // Common fields
  notes: Yup.string()
    .required('Notes are required')
    .test(
      'min-words',
      'Notes must contain at least 5 words',
      function (value) {
        if (!value) return false;
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 5;
      }
    ),
});

export const allocationInitialValues = {
  allocationType: 'REMOTE',
  // Remote fields
  campusId: '',
  assetTypeId: '',
  assetId: '',
  userEmail: '',
  phoneNumber: '',
  userDepartment: '',
  userAddress: '',
  assetSource: '',
  // Campus fields
  sourceCampus: '',
  sourceCampusName: '',
  destinationCampus: '',
  destinationCampusName: '',
  personRaising: '',
  campusAssets: [],
  // Common fields
  startDate: new Date().toISOString().split('T')[0],
  allocationReason: 'JOINER',
  notes: '',
  assetType: '',
  assetId: '',
};