import * as Yup from 'yup';

const countWords = (str) =>
  (str || '').trim().split(/\s+/).filter(Boolean).length;

// ─── Field definitions ─────────────────────────────────────────────────────

/**
 * Returns the remarks field for Approve / Reject actions.
 * The placeholder adjusts based on the action type passed in.
 *
 * @param {'Approve'|'Reject'|string} actionType
 */
export const getTicketActionFields = (actionType = '') => [
  {
    name: 'remarks',
    label: 'Remarks',
    type: 'textarea',
    placeholder: `Enter remarks for ${actionType.toLowerCase()}ing this ticket...`,
    required: false,
    rows: 4,
    minWords: 5,
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const ticketApprovalValidationSchema = Yup.object().shape({
  remarks: Yup.string()
    .required('Remarks are required')
    .test(
      'min-words',
      'Remarks must contain at least 5 words',
      (value) => countWords(value) >= 5
    ),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const ticketApprovalInitialValues = {
  remarks: '',
};
