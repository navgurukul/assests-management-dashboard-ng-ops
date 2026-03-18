import * as Yup from 'yup';

// ─── Field definitions ─────────────────────────────────────────────────────

export const assetReceivedFields = [
  {
    name: 'workingFine',
    type: 'checkbox',
    label: 'I have received the laptop and tested thoroughly and it is working fine',
    required: false,
    showWhen: (formData) => !formData.havingIssue,
  },
  {
    name: 'havingIssue',
    type: 'checkbox',
    label: 'Having some issue',
    required: false,
  },
  {
    name: 'issueType',
    type: 'radio',
    label: 'Issue Type',
    layout: 'vertical',
    required: true,
    showWhen: (formData) => !!formData.havingIssue,
    options: [
      { label: 'Laptop is working but having some issue in software', value: 'SOFTWARE_ISSUE' },
      { label: 'Laptop is broken or damaged', value: 'PHYSICAL_DAMAGE' },
      { label: 'Other issue', value: 'OTHER' },
    ],
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Description',
    placeholder: 'Describe the issue in detail...',
    required: true,
    rows: 4,
    showWhen: (formData) => !!formData.havingIssue && !!formData.issueType,
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const assetReceivedValidationSchema = Yup.object().shape({
  workingFine: Yup.boolean(),
  havingIssue: Yup.boolean(),
  issueType: Yup.string().when('havingIssue', {
    is: true,
    then: (schema) => schema.required('Please select an issue type'),
    otherwise: (schema) => schema.nullable(),
  }),
  description: Yup.string().when('havingIssue', {
    is: true,
    then: (schema) =>
      schema
        .required('Description is required')
        .min(10, 'Please provide more detail (at least 10 characters)'),
    otherwise: (schema) => schema.nullable(),
  }),
});
