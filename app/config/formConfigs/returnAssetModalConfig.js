import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Field definitions ─────────────────────────────────────────────────────

/**
 * Base return-asset fields (assetId and assetSource get defaultValues injected
 * via `getReturnAssetFields` when a specific asset is selected).
 */
export const returnAssetFields = [
  {
    name: 'assetId',
    label: 'Asset ID',
    type: 'text',
    required: false,
    disabled: true,
    placeholder: '',
  },
  {
    name: 'returnMode',
    label: 'Return Mode',
    type: 'radio',
    required: true,
    options: [
      { label: 'Returning physically by visiting campus', value: 'VISIT_CAMPUS' },
      { label: 'Return to sourced campus', value: 'SOURCED_CAMPUS' },
      { label: 'Return to other campus', value: 'OTHER_CAMPUS' },
    ],
  },
  {
    name: 'assetSource',
    label: 'Asset Source (Campus)',
    type: 'text',
    required: false,
    disabled: true,
    placeholder: '',
    showWhen: (formData) => formData.returnMode === 'SOURCED_CAMPUS',
  },
  {
    name: 'destinationCampusId',
    label: 'Select Campus',
    type: 'api-autocomplete',
    apiUrl: '/campuses',
    valueKey: 'id',
    labelKey: 'campusName',
    required: true,
    placeholder: 'Select a campus',
    showWhen: (formData) => ['VISIT_CAMPUS', 'OTHER_CAMPUS'].includes(formData.returnMode),
  },
  {
    name: 'campusItCoordinator',
    label: 'Campus IT Co-ordinator Email',
    type: 'email',
    required: true,
    placeholder: 'IT coordinator email',
    showWhen: (formData) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(formData.returnMode),
  },
  {
    name: 'exactAddress',
    label: 'Exact Address',
    type: 'textarea',
    required: true,
    placeholder: 'Enter exact pickup / drop address...',
    showWhen: (formData) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(formData.returnMode),
  },
  {
    name: 'vendorName',
    label: 'Vendor Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Bluedart',
    showWhen: (formData) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(formData.returnMode),
  },
  {
    name: 'vendorReceipt',
    label: 'Vendor Receipt (Photo / PDF)',
    type: 'file',
    required: true,
    accept: 'image/*,application/pdf',
    multiple: true,
    hint: 'Accepted formats: JPG, PNG, PDF',
    showWhen: (formData) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(formData.returnMode),
  },
  {
    name: 'managerEmail',
    label: 'Manager Email',
    type: 'email',
    required: true,
    placeholder: 'Manager email to loop in',
  },
  {
    name: 'expectedDeliveryDate',
    label: 'Expected Delivery Date',
    type: 'date',
    required: true,
    placeholder: 'Select date',
    showWhen: (formData) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(formData.returnMode),
  },
];

/**
 * Returns return-asset fields pre-populated with the selected asset's data.
 *
 * @param {{ assetTag?: string; id?: string; campus?: { name?: string }; campusName?: string } | null} selectedAsset
 */
export const getReturnAssetFields = (selectedAsset = null, sourceName = '') =>
  returnAssetFields.map((f) => {
    if (f.name === 'assetId')
      return {
        ...f,
        defaultValue: selectedAsset?.assetTag || selectedAsset?.id || '',
      };
    if (f.name === 'assetSource')
      return {
        ...f,
        defaultValue: sourceName || selectedAsset?.campus?.name || selectedAsset?.campusName || '',
      };
    return f;
  });

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const returnAssetValidationSchema = Yup.object().shape({
  returnMode: Yup.string().required('Please select a return mode'),
  assetSource: Yup.string(),
  destinationCampusId: Yup.string().when('returnMode', {
    is: (val) => ['VISIT_CAMPUS', 'OTHER_CAMPUS'].includes(val),
    then: () => Yup.string().required('Campus is required'),
    otherwise: () => Yup.string().nullable(),
  }),
  campusItCoordinator: Yup.string().when('returnMode', {
    is: (val) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(val),
    then: () => Yup.string()
      .required('IT Coordinator email is required')
      .email('Enter a valid email address'),
    otherwise: () => Yup.string().nullable(),
  }),
  exactAddress: Yup.string().when('returnMode', {
    is: (val) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(val),
    then: () => Yup.string()
      .required('Exact address is required')
      .min(10, 'Please enter a more detailed address'),
    otherwise: () => Yup.string().nullable(),
  }),
  vendorName: Yup.string().when('returnMode', {
    is: (val) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(val),
    then: () => Yup.string().required('Vendor name is required'),
    otherwise: () => Yup.string().nullable(),
  }),
  vendorReceipt: Yup.mixed().when('returnMode', {
    is: (val) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(val),
    then: () => Yup.mixed().required('Vendor receipt is required'),
    otherwise: () => Yup.mixed().nullable(),
  }),
  managerEmail: Yup.string()
    .required('Manager email is required')
    .email('Enter a valid email address'),
  expectedDeliveryDate: Yup.date().when('returnMode', {
    is: (val) => ['SOURCED_CAMPUS', 'OTHER_CAMPUS'].includes(val),
    then: () => Yup.date()
      .required('Expected delivery date is required')
      .min(new Date(), 'Delivery date must be today or in the future'),
    otherwise: () => Yup.date().nullable(),
  }),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const returnAssetInitialValues = {
  assetId: '',
  returnMode: 'SOURCED_CAMPUS',
  assetSource: '',
  destinationCampusId: '',
  campusItCoordinator: '',
  exactAddress: '',
  vendorName: '',
  vendorReceipt: null,
  managerEmail: '',
  expectedDeliveryDate: '',
};
