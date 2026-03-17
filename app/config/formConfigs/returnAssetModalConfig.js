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
    name: 'assetSource',
    label: 'Asset Source (Campus)',
    type: 'text',
    required: false,
    disabled: true,
    placeholder: '',
  },
  {
    name: 'campusItCoordinator',
    label: 'Campus IT Co-ordinator Email',
    type: 'email',
    required: true,
    placeholder: 'IT coordinator email',
  },
  {
    name: 'exactAddress',
    label: 'Exact Address',
    type: 'textarea',
    required: true,
    placeholder: 'Enter exact pickup / drop address...',
  },
  {
    name: 'vendorName',
    label: 'Vendor Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Bluedart',
  },
  {
    name: 'vendorReceipt',
    label: 'Vendor Receipt (Photo / PDF)',
    type: 'file',
    required: true,
    accept: 'image/*,application/pdf',
    multiple: true,
    hint: 'Accepted formats: JPG, PNG, PDF',
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
  assetSource: Yup.string(),
  campusItCoordinator: Yup.string()
    .required('IT Coordinator email is required')
    .email('Enter a valid email address'),
  exactAddress: Yup.string()
    .required('Exact address is required')
    .min(10, 'Please enter a more detailed address'),
  vendorName: Yup.string().required('Vendor name is required'),
  vendorReceipt: Yup.mixed().required('Vendor receipt is required'),
  managerEmail: Yup.string()
    .required('Manager email is required')
    .email('Enter a valid email address'),
  expectedDeliveryDate: Yup.date()
    .required('Expected delivery date is required')
    .min(new Date(), 'Delivery date must be today or in the future'),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const returnAssetInitialValues = {
  assetId: '',
  assetSource: '',
  campusItCoordinator: '',
  exactAddress: '',
  vendorName: '',
  vendorReceipt: null,
  managerEmail: '',
  expectedDeliveryDate: '',
};
