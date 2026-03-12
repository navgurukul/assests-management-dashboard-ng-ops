import * as Yup from 'yup';

// ─── Options ──────────────────────────────────────────────────────────────

export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'RESIDENTIAL_TEAM', label: 'Residential Team' },
  { value: 'STUDENT', label: 'Student' },
];

// ─── Field definitions ─────────────────────────────────────────────────────

export const changeRoleFields = [
  {
    name: 'role',
    label: 'New Role',
    type: 'select',
    required: true,
    placeholder: 'Select a role',
    options: ROLE_OPTIONS,
  },
];

// ─── Yup Validation Schema ─────────────────────────────────────────────────

export const changeRoleValidationSchema = Yup.object().shape({
  role: Yup.string()
    .required('Role is required')
    .oneOf(
      ROLE_OPTIONS.map((r) => r.value),
      'Invalid role selected'
    ),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const changeRoleInitialValues = {
  role: '',
};
