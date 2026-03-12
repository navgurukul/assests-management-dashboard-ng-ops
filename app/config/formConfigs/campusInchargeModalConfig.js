import * as Yup from 'yup';

// ─── Field definitions ─────────────────────────────────────────────────────

export const campusInchargeModalFields = [
  // Campus
  {
    name: 'campus',
    label: 'Campus',
    type: 'text',
    placeholder: 'e.g. PUNE',
    required: true,
  },

  // IT Coordinator
  {
    name: 'itCoordinatorName',
    label: 'IT Coordinator Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
  },
  {
    name: 'itCoordinatorEmail',
    label: 'IT Coordinator Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'itCoordinatorPhone',
    label: 'IT Coordinator Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
  },

  // Operation
  {
    name: 'operationName',
    label: 'Operation Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
  },
  {
    name: 'operationEmail',
    label: 'Operation Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'operationPhone',
    label: 'Operation Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
  },

  // IT Lead
  {
    name: 'itLeadName',
    label: 'IT Lead Name',
    type: 'text',
    placeholder: 'Full name',
    required: true,
  },
  {
    name: 'itLeadEmail',
    label: 'IT Lead Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'itLeadPhone',
    label: 'IT Lead Phone',
    type: 'text',
    placeholder: '+91 XXXXX XXXXX',
    required: true,
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

const nameSchema = (label) =>
  Yup.string()
    .required(`${label} is required`)
    .min(2, `${label} must be at least 2 characters`);

const emailSchema = (label) =>
  Yup.string()
    .required(`${label} is required`)
    .email(`${label} must be a valid email`);

const phoneSchema = (label) =>
  Yup.string()
    .required(`${label} is required`)
    .matches(/^[0-9+\s\-()?]{7,20}$/, `${label}: enter a valid phone number`);

export const campusInchargeValidationSchema = Yup.object().shape({
  campus: Yup.string()
    .required('Campus name is required')
    .min(2, 'Campus name must be at least 2 characters'),

  itCoordinatorName: nameSchema('IT Coordinator Name'),
  itCoordinatorEmail: emailSchema('IT Coordinator Email'),
  itCoordinatorPhone: phoneSchema('IT Coordinator Phone'),

  operationName: nameSchema('Operation Name'),
  operationEmail: emailSchema('Operation Email'),
  operationPhone: phoneSchema('Operation Phone'),

  itLeadName: nameSchema('IT Lead Name'),
  itLeadEmail: emailSchema('IT Lead Email'),
  itLeadPhone: phoneSchema('IT Lead Phone'),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const campusInchargeInitialValues = {
  campus: '',
  itCoordinatorName: '',
  itCoordinatorEmail: '',
  itCoordinatorPhone: '',
  operationName: '',
  operationEmail: '',
  operationPhone: '',
  itLeadName: '',
  itLeadEmail: '',
  itLeadPhone: '',
};
