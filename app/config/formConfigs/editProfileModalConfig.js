import * as Yup from 'yup';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Field definitions ─────────────────────────────────────────────────────

/**
 * Edit-profile modal fields.
 * Pass `defaultValues` from current user data to pre-populate the form.
 *
 * @param {{ phone?: string; location?: string; campusId?: string; schoolId?: string; managerId?: string }} defaultValues
 * @param {'full' | 'manager-only'} mode  'full' = complete profile form (default), 'manager-only' = only manager field
 */
export const getEditProfileFields = (defaultValues = {}, mode = 'full') => {
  // Manager-only mode: show just the manager field with guidance text
  if (mode === 'manager-only') {
    return [
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
  }

  // Full profile form
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

// ─── Yup Validation Schemas ────────────────────────────────────────────────

/** Full profile form validation */
export const editProfileValidationSchema = Yup.object().shape({
  phone: Yup.string()
    .required('Phone is required')
    .matches(
      /^[0-9]{10}$/,
      'Phone number must be exactly 10 digits'
    ),
  location: Yup.string()
    .required('Location is required')
    .min(2, 'Location must be at least 2 characters'),
  campusId: Yup.string().nullable(),
  schoolId: Yup.string().nullable(),
  managerId: Yup.string().required('Manager is required'),
});

/** Manager-only modal validation (existing users who only need to set manager) */
export const managerOnlyValidationSchema = Yup.object().shape({
  managerId: Yup.string().required('Please select your reporting manager to continue'),
});

// ─── Initial values ────────────────────────────────────────────────────────

export const editProfileInitialValues = {
  phone: '',
  location: '',
  campusId: '',
  schoolId: '',
  managerId: '',
};
