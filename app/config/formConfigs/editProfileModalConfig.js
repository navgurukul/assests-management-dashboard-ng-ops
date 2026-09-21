import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Static option lists ───────────────────────────────────────────────────

export const DEPARTMENT_OPTIONS = [
  'Samyarth',
  'PnC',
  'Residential Academics',
  'Residential Life Skills',
  'Placements',
  'Residential Program',
  'Admissions/Outreach',
  'CEO Office',
  'SOSC',
  'Sama',
  'Ad Curriculum Support',
  'Zuvy',
  'Finance',
  'Residential Operations',
  'Communication',
].map((dept) => ({ value: dept, label: dept }));

export const MANDATORY_PROFILE_FIELDS = [
  { name: 'phone', isFilled: (user) => !!user?.phone },
  { name: 'location', isFilled: (user) => !!user?.location },
  { name: 'department', isFilled: (user) => !!user?.department },
  { name: 'managerId', isFilled: (user) => !!(user?.managerId || user?.manager?.id) },
];

/** Returns the list of mandatory field names that are missing/empty for this user. */
export const getMissingMandatoryFields = (user) =>
  MANDATORY_PROFILE_FIELDS.filter((f) => !f.isFilled(user)).map((f) => f.name);

// ─── Field definitions ─────────────────────────────────────────────────────

/**
 * All edit-profile fields (phone, location, department, campus, school, manager).
 * Pass `defaultValues` from current user data to pre-populate the form.
 * The caller (UserProfileTab) decides whether to render all of these
 * (new user) or just a filtered subset (only the missing mandatory ones).
 *
 * @param {{ phone?: string; location?: string; department?: string; campusId?: string; schoolId?: string; managerId?: string }} defaultValues
 */
export const getEditProfileFields = (defaultValues = {}) => {
  return [
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter 10-digit phone number',
      required: true,
      defaultValue: defaultValues.phone || '',
      maxLength: 10,
      inputMode: 'numeric',
      allowOnlyDigits: true,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Enter location',
      required: true,
      defaultValue: defaultValues.location || '',
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      placeholder: 'Select department',
      required: true,
      options: DEPARTMENT_OPTIONS,
      defaultValue: defaultValues.department || '',
    },
    {
      name: 'campusId',
      label: 'Campus (Only for students)',
      type: 'api-autocomplete',
      placeholder: 'Search and select campus',
      apiUrl: baseUrl + '/campuses',
      queryKey: ['campuses'],
      labelKey: 'campusName',
      valueKey: 'id',
      required: false,
      defaultValue: defaultValues.campusId || '',
    },
    {
      name: 'schoolId',
      label: 'School (Only for students)',
      type: 'select',
      placeholder: 'Select school',
      required: false,
      options: [],
      defaultValue: defaultValues.schoolId || '',
    },
    {
      name: 'managerId',
      label: 'Manager',
      type: 'api-autocomplete',
      placeholder: 'Search by name or email',
      apiUrl: baseUrl + '/users',
      queryKey: ['profile-managers'],
      labelKey: 'email',
      valueKey: 'id',
      dataPath: 'data',
      additionalParams: { role: 'MANAGER & ADMIN & CAMPUS_MANAGER', limit: 1000 },
      formatLabel: (manager) => {
        const fullName = `${manager?.firstName || ''} ${manager?.lastName || ''}`.trim();
        return fullName ? `${fullName} - ${manager?.email}` : manager?.email;
      },
      helpText: "Search by name or email. Can't find your manager? Ask them to log in once, or contact IT/Admin.",
      emptyContent: "No manager found with that name/email. They may not have logged in yet, or their account role isn't set to Manager — ask them to log in once, or contact IT/Admin to update their role.",
      required: true,
      defaultValue: defaultValues.managerId || '',
    },
  ];
};

// ─── Yup Validation ─────────────────────────────────────────────────────────

/** Per-field validation rules, keyed by field name. */
const profileFieldValidations = {
  phone: Yup.string()
    .required('Phone is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  location: Yup.string()
    .required('Location is required')
    .min(2, 'Location must be at least 2 characters'),
  department: Yup.string().required('Department is required'),
  campusId: Yup.string().nullable(),
  schoolId: Yup.string().nullable(),
  managerId: Yup.string().required('Manager is required'),
};

/** Full profile form validation (all fields at once — used for new/incomplete users). */
export const editProfileValidationSchema = Yup.object().shape(profileFieldValidations);

export const getValidationSchemaForFields = (fieldNames = []) =>
  Yup.object().shape(
    fieldNames.reduce((acc, name) => {
      if (profileFieldValidations[name]) acc[name] = profileFieldValidations[name];
      return acc;
    }, {})
  );

// ─── Initial values ────────────────────────────────────────────────────────

export const editProfileInitialValues = {
  phone: '',
  location: '',
  department: '',
  campusId: '',
  schoolId: '',
  managerId: '',
};
