import * as Yup from 'yup';

// ─── Field definitions ─────────────────────────────────────────────────────

export const assetReceivedFields = [
  {
    name: 'deviceConditionOnReceive',
    type: 'select',
    label: 'Device Condition On Receive',
    required: true,
    placeholder: 'Select device condition',
    options: [
      { label: 'Working', value: 'WORKING' },
      { label: 'Minor Issues', value: 'MINOR_ISSUES' },
      { label: 'Not Working', value: 'NOT_WORKING' },
      { label: 'Damaged', value: 'DAMAGED' },
    ],
  },
  {
    name: 'issueType',
    type: 'select',
    label: 'Issue Type',
    required: true,
    showWhen: (formData) => formData.deviceConditionOnReceive && formData.deviceConditionOnReceive !== 'WORKING',
    placeholder: 'Select issue type',
    options: [
      { label: 'Damage', value: 'DAMAGE' },
      { label: 'Hardware Issue', value: 'HARDWARE_ISSUE' },
      { label: 'Software Issue', value: 'SOFTWARE_ISSUE' },
      { label: 'Other', value: 'OTHER' },
    ],
  },
  {
    name: 'receiveNotes',
    type: 'textarea',
    label: 'Receive Notes',
    placeholder: 'Add any notes about received condition...',
    required: false,
    rows: 4,
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const assetReceivedValidationSchema = Yup.object().shape({
  deviceConditionOnReceive: Yup.string()
    .oneOf(['WORKING', 'MINOR_ISSUES', 'NOT_WORKING', 'DAMAGED'])
    .required('Please select device condition on receive'),
  issueType: Yup.string().when('deviceConditionOnReceive', {
    is: (value) => !!value && value !== 'WORKING',
    then: (schema) => schema.required('Please select an issue type'),
    otherwise: (schema) => schema.nullable(),
  }),
  receiveNotes: Yup.string().nullable(),
});
