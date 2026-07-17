import * as Yup from "yup";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Common Asset Form Configuration

export const assetCategoryField = {
  name: "assetCategoryId",
  label: "Asset Category",
  type: "api-autocomplete",
  placeholder: "Select asset category",
  apiUrl: baseUrl + "/asset-categories",
  queryKey: ["asset-categories"],
  labelKey: "name",
  valueKey: "id",
  dataPath: "data",
  required: true,
  filterFn: (category) => category.name !== 'Components',
};

export const assetTypeField = {
  name: "assetTypeId",
  label: "Asset Type",
  type: "api-autocomplete",
  placeholder: "Select category first",
  required: true,
  apiUrl: baseUrl + "/asset-categories/",
  queryKey: null,
  labelKey: "name",
  valueKey: "id",
  dataPath: "data.assetTypes",
  dependsOn: { field: "assetCategoryId", paramKey: "categoryId" },
  companionField: "assetTypeName",
  companionKey: "name",
  onFieldChange: "onAssetTypeChange",
};

export const itBrandField = {
  name: "brand",
  label: "Brand",
  type: "api-autocomplete",
  placeholder: "Search and select brand",
  apiUrl: "", // No API URL since we are using static items for brands
  queryKey: [],
  labelKey: "label",
  valueKey: "value",
  staticItems: [
    { label: "Dell", value: "Dell" },
    { label: "HP", value: "HP" },
    { label: "Lenovo", value: "Lenovo" },
    { label: "Acer", value: "Acer" },
    { label: "ASUS", value: "ASUS" },
    { label: "Apple", value: "Apple" },
    { label: "MSI", value: "MSI" },
    { label: "Samsung", value: "Samsung" },
    { label: "Microsoft", value: "Microsoft" },
    { label: "Toshiba", value: "Toshiba" },
  ],
  required: true,
};

export const itModelField = {
  name: "model",
  label: "Model",
  type: "text",
  placeholder: "Enter model (e.g., Latitude 5400)",
  required: true,
};

export const defaultBrandModelFields = [
  {
    name: "brand",
    label: "Brand",
    type: "text",
    placeholder: "Enter brand name",
    required: false,
  },
  {
    name: "model",
    label: "Model",
    type: "text",
    placeholder: "Enter model",
    required: false,
  },
];

export const commonAssetFields = [
  {
    name: "campusId",
    label: "Campus",
    type: "api-autocomplete",
    placeholder: "Search and select campus",
    apiUrl: baseUrl + "/campuses",
    queryKey: ["campuses"],
    labelKey: "campusName",
    valueKey: "id",
    required: true,
    onFieldChange: "onCampusChange",
  },
  {
    name: "currentLocationId",
    label: "Current Location",
    type: "api-autocomplete",
    placeholder: "Search and select location",
    apiUrl: baseUrl + "/locations/campus/",
    queryKey: null,
    labelKey: "name",
    valueKey: "id",
    required: true,
    dependsOn: {
      field: "campusId",
      paramKey: "campusId",
    },
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    placeholder: "Select asset status",
    required: true,
    disabled: true, // Disabled for new assets - always IN_STOCK
    options: [
      { value: "IN_STOCK", label: "In Stock" },
      { value: "ALLOCATED", label: "Allocated" },
      // { value: 'REPAIR', label: 'Under Repair' },
      { value: "SCRAP", label: "Scrap" },
      { value: "PARTED_OUT", label: "Parted Out" },
    ],
  },
  {
    name: "condition",
    label: "Condition",
    type: "select",
    placeholder: "Select asset condition",
    required: true,
    disabled: true, // Disabled for new assets - backend sets default 'WORKING' condition
    options: [
      { value: "WORKING", label: "Working" },
      { value: "MINOR_ISSUES", label: "Minor Issues" },
      { value: "NOT_WORKING", label: "Not Working" },
    ],
  },
  {
    name: "sourceType",
    label: "Source Type",
    type: "select",
    placeholder: "Select source type",
    required: true,
    options: [
      { value: "PURCHASED", label: "Purchased" },
      { value: "DONATED", label: "Donated" },
      { value: "PERSONAL", label: "Personal" },
    ],
  },
  {
    name: "sourceBy",
    label: "Source By",
    type: "text",
    placeholder: "Enter source by",
    required: true,
  },
  {
    name: "purchaseDate",
    label: "Purchase Date",
    type: "date",
    placeholder: "Select purchase date",
    required: true,
    showIf: { field: "sourceType", value: ["PURCHASED", "PERSONAL"] },
  },
  {
    name: "cost",
    label: "Cost",
    type: "number",
    placeholder: "Enter purchase cost (optional)",
    required: false,
    min: 0,
  },
  // Service / Maintenance
  {
    name: "needsServicing",
    label: "This asset needs periodic servicing / maintenance",
    type: "checkbox",
    required: false,
    fullWidth: true,
  },
  {
    name: "inspectionHeader",
    label: "Inspection",
    type: "section-header",
    fullWidth: true,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "inspectionDate",
    label: "Inspection Date",
    type: "date",
    placeholder: "Select inspection date",
    required: (values) => !!values.needsServicing,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "nextInspectionDate",
    label: "Next Inspection Date",
    type: "date",
    placeholder: "Select next inspection date",
    required: (values) => !!values.needsServicing,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "inspectionStatus",
    label: "Inspection Status",
    type: "select",
    placeholder: "Select inspection status",
    required: (values) => !!values.needsServicing,
    options: [
      { value: "HEALTHY", label: "Healthy" },
      { value: "NEED_ATTENTION", label: "Need Attention" },
      { value: "INSPECTION_DUE", label: "Inspection Due" },
    ],
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "inspectionRemark",
    label: "Inspection Remarks",
    type: "textarea",
    placeholder: "Add any inspection remarks",
    required: false,
    fullWidth: true,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "serviceHeader",
    label: "Service",
    type: "section-header",
    fullWidth: true,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "serviceDate",
    label: "Service Date",
    type: "date",
    placeholder: "Select service date",
    required: (values) => !!values.needsServicing,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "nextServiceDate",
    label: "Next Service Date",
    type: "date",
    placeholder: "Select next service date",
    required: (values) => !!values.needsServicing,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "serviceStatus",
    label: "Service Status",
    type: "select",
    placeholder: "Select service status",
    required: (values) => !!values.needsServicing,
    options: [
      { value: "HEALTHY", label: "Healthy" },
      { value: "NEED_ATTENTION", label: "Need Attention" },
      { value: "SERVICE_DUE", label: "Service Due" },
    ],
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "serviceProvider",
    label: "Service Provider",
    type: "text",
    placeholder: "Enter service provider name",
    required: (values) => !!values.needsServicing,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "serviceCost",
    label: "Cost",
    type: "number",
    placeholder: "Enter cost (optional)",
    required: false,
    min: 0,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "serviceRemark",
    label: "Service Remarks",
    type: "textarea",
    placeholder: "Add any service remarks",
    required: false,
    fullWidth: true,
    showIf: { field: "needsServicing", value: true },
  },
  {
    name: "serviceBillDocument",
    label: "Service Bill / Receipt",
    type: "purchase-bill-selector",
    required: false,
    allowMultiple: false,
    simpleMode: true,
    showIf: { field: "needsServicing", value: true },
  },
  // AMC / Insurance
  {
    name: "hasAmcInsurance",
    label: "This asset has an AMC / Insurance",
    type: "checkbox",
    required: false,
    fullWidth: true,
  },
  {
    name: "amcStartDate",
    label: "AMC / Insurance Start Date",
    type: "date",
    placeholder: "Select start date",
    required: (values) => !!values.hasAmcInsurance,
    showIf: { field: "hasAmcInsurance", value: true },
  },
  {
    name: "amcExpiryDate",
    label: "Expiry Date",
    type: "date",
    placeholder: "Select expiry date",
    required: (values) => !!values.hasAmcInsurance,
    showIf: { field: "hasAmcInsurance", value: true },
  },
  {
    name: "healthStatus",
    label: "AMC / Insurance Status",
    type: "select",
    placeholder: "Select status",
    required: (values) => !!values.hasAmcInsurance,
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "EXPIRING_SOON", label: "Expiring Soon" },
      { value: "EXPIRED", label: "Expired" },
    ],
    showIf: { field: "hasAmcInsurance", value: true },
  },
  {
    name: "amcProvider",
    label: "Provider",
    type: "text",
    placeholder: "Enter provider name",
    required: (values) => !!values.hasAmcInsurance,
    showIf: { field: "hasAmcInsurance", value: true },
  },
  {
    name: "amcVendor",
    label: "Vendor Detail",
    type: "text",
    placeholder: "Enter vendor detail",
    required: (values) => !!values.hasAmcInsurance,
    showIf: { field: "hasAmcInsurance", value: true },
  },
  {
    name: "amcCost",
    label: "AMC / Insurance Cost",
    type: "number",
    placeholder: "Enter cost (optional)",
    required: false,
    min: 0,
    showIf: { field: "hasAmcInsurance", value: true },
  },
  {
    name: "amcDocument",
    label: "AMC / Policy Document",
    type: "purchase-bill-selector",
    allowMultiple: false,
    required: false,
    simpleMode: true,
    showIf: { field: "hasAmcInsurance", value: true },
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Add any additional notes or comments",
    required: false,
  },
  {
    name: "charger",
    label: "Charger Included",
    type: "checkbox",
    required: false,
    showIf: {
      field: "assetTypeName",
      value: ["Laptop", "Tablet", "Smartphone"],
    },
  },
  {
    name: "purchaseBills",
    label: "Purchase Bills / Invoices",
    type: "purchase-bill-selector",
    required: false,
    allowMultiple: false,
    helpText: "Link or upload purchase bills for this asset",
  },
];

//  Validation Schemas & Default Values

export const itBrandModelValidation = {
  brand: Yup.string()
    .required("Brand is required")
    .min(2, "Brand must be at least 2 characters"),
  model: Yup.string()
    .required("Model is required")
    .min(2, "Model must be at least 2 characters")
    .matches(
      /^[a-zA-Z0-9\s\-]+$/,
      "Only letters, numbers, spaces, hyphens allowed"
    )
    .test("contains-letter", "Model must contain at least one letter (e.g., 'Latitude 5400')", function (value) {
      if (!value) return true;
      return /[a-zA-Z]/.test(value);
    }),
};

export const createAssetBaseValidation = {
  assetCategoryId: Yup.string().required("Asset category is required"),
  assetCategoryName: Yup.string(),
  assetTypeId: Yup.string().required("Asset Type is required"),
  assetTypeName: Yup.string(),
};

export const commonAssetValidation = {
  brand: Yup.string(),
  model: Yup.string(),
  campusId: Yup.string().required("Campus is required"),
  currentLocationId: Yup.string().required("Current location is required"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(
      ["IN_STOCK", "ALLOCATED", "REPAIR", "SCRAP", "PARTED_OUT"],
      "Invalid status",
    ),
  condition: Yup.string()
    .required("Condition is required")
    .oneOf(["WORKING", "MINOR_ISSUES", "NOT_WORKING"], "Invalid condition"),
  sourceType: Yup.string()
    .required("Source type is required")
    .oneOf(["PURCHASED", "DONATED", "PERSONAL"], "Invalid source type"),
  sourceBy: Yup.string()
    .required("Source by is required")
    .min(2, "Source by must be at least 2 characters"),
  purchaseDate: Yup.string()
    .nullable()
    .when("sourceType", {
      is: "DONATED",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) =>
        schema
          .required("Purchase date is required")
          .test(
            "not-future-date",
            "Purchase date cannot be in the future",
            function (value) {
              if (!value) return true;
              const selectedDate = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              selectedDate.setHours(0, 0, 0, 0);
              return selectedDate <= today;
            },
          ),
    }),
  cost: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
        ? null
        : value,
    )
    .min(0, "Cost must be a positive number")
    .max(9999999, "Cost cannot exceed 99,99,999"),
  // Service / Maintenance
  needsServicing: Yup.boolean(),
  inspectionDate: Yup.string()
    .nullable()
    .when("needsServicing", {
      is: true,
      then: (schema) => schema.required("Inspection date is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  nextInspectionDate: Yup.string()
    .nullable()
    .when("needsServicing", {
      is: true,
      then: (schema) => schema.required("Next inspection date is required"),
      otherwise: (schema) => schema.notRequired(),
    })
    .test(
      "next-after-inspection",
      "Next inspection date cannot be before the inspection date",
      function (value) {
        const { inspectionDate } = this.parent;
        if (!value || !inspectionDate) return true;
        return new Date(value) >= new Date(inspectionDate);
      },
    ),
  serviceDate: Yup.string()
    .nullable()
    .when("needsServicing", {
      is: true,
      then: (schema) => schema.required("Service date is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  nextServiceDate: Yup.string()
    .nullable()
    .when("needsServicing", {
      is: true,
      then: (schema) => schema.required("Next service date is required"),
      otherwise: (schema) => schema.notRequired(),
    })
    .test(
      "next-after-service",
      "Next service date cannot be before the service date",
      function (value) {
        const { serviceDate } = this.parent;
        if (!value || !serviceDate) return true;
        return new Date(value) >= new Date(serviceDate);
      },
    ),
  inspectionStatus: Yup.string()
    .nullable()
    .when("needsServicing", {
      is: true,
      then: (schema) =>
        schema
          .required("Inspection status is required")
          .oneOf(["HEALTHY", "NEED_ATTENTION", "INSPECTION_DUE"], "Invalid status"),
      otherwise: (schema) => schema.notRequired(),
    }),
  inspectionRemark: Yup.string().nullable(),
  serviceStatus: Yup.string()
    .nullable()
    .when("needsServicing", {
      is: true,
      then: (schema) =>
        schema
          .required("Service status is required")
          .oneOf(["HEALTHY", "NEED_ATTENTION", "SERVICE_DUE"], "Invalid status"),
      otherwise: (schema) => schema.notRequired(),
    }),
  serviceProvider: Yup.string()
    .nullable()
    .when("needsServicing", {
      is: true,
      then: (schema) => schema.required("Service provider is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  serviceCost: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
        ? null
        : value,
    )
    .min(0, "Cost must be a positive number")
    .max(9999999, "Cost cannot exceed 99,99,999"),
  serviceRemark: Yup.string().nullable(),
  serviceBillDocument: Yup.array().nullable(),
  // AMC / Insurance
  hasAmcInsurance: Yup.boolean(),
  amcStartDate: Yup.string()
    .nullable()
    .when("hasAmcInsurance", {
      is: true,
      then: (schema) =>
        schema.required("AMC / Insurance start date is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  amcExpiryDate: Yup.string()
    .nullable()
    .when("hasAmcInsurance", {
      is: true,
      then: (schema) => schema.required("Expiry date is required"),
      otherwise: (schema) => schema.notRequired(),
    })
    .test(
      "expiry-after-start",
      "Expiry date must be after the start date",
      function (value) {
        const { amcStartDate } = this.parent;
        if (!value || !amcStartDate) return true;
        return new Date(value) >= new Date(amcStartDate);
      },
    ),
  healthStatus: Yup.string()
    .nullable()
    .when("hasAmcInsurance", {
      is: true,
      then: (schema) =>
        schema
          .required("AMC / Insurance status is required")
          .oneOf(["ACTIVE", "EXPIRING_SOON", "EXPIRED"], "Invalid status"),
        otherwise: (schema) => schema.notRequired(),
  }),
  amcProvider: Yup.string()
    .nullable()
    .when("hasAmcInsurance", {
      is: true,
      then: (schema) => schema.required("Provider is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  amcCost: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
        ? null
        : value,
    )
    .min(0, "Cost must be a positive number")
    .max(9999999, "Cost cannot exceed 99,99,999"),
  amcVendor: Yup.string()
    .nullable()
    .when("hasAmcInsurance", {
      is: true,
      then: (schema) => schema.required("Vendor details are required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  amcDocument: Yup.array().nullable(),
  notes: Yup.string(),
  charger: Yup.boolean(),
};

export const createAssetBaseInitial = {
  assetCategoryId: "",
  assetCategoryName: "",
  assetTypeId: "",
  assetTypeName: "",
  brand: "",
  model: "",
};

export const commonAssetInitial = {
  campusId: "",
  currentLocationId: "",
  status: "IN_STOCK",
  condition: "WORKING",
  sourceType: "PURCHASED",
  sourceBy: "",
  purchaseDate: "",
  cost: "",
  // Service / Maintenance
  needsServicing: false,
  inspectionDate: "",
  nextInspectionDate: "",
  inspectionStatus: "",
  inspectionRemark: "",
  serviceDate: "",
  nextServiceDate: "",
  serviceStatus: "",
  serviceProvider: "",
  serviceCost: "",
  serviceRemark: "",
  serviceBillDocument: [],
  // AMC / Insurance
  hasAmcInsurance: false,
  amcStartDate: "",
  amcExpiryDate: "",
  healthStatus: "",
  amcProvider: "",
  amcCost: "",
  amcVendor: "",
  amcDocument: [],
  notes: "",
  charger: false,
  purchaseBills: [],
};

// Helpers
const IT_ELECTRONICS = "IT & Electronics";

export const getBrandModelFields = (categoryName) =>
  categoryName === IT_ELECTRONICS
    ? [itBrandField, itModelField]
    : defaultBrandModelFields;

export const getBrandModelValidation = (categoryName) =>
  categoryName === IT_ELECTRONICS ? itBrandModelValidation : {};

//  Other form configs (unchanged)
export const changeLocationFields = [
  {
    name: "locationId",
    label: "New Location",
    type: "api-autocomplete",
    placeholder: "Search and select new location",
    apiUrl: baseUrl + "/locations/campus/",
    queryKey: ["locations"],
    labelKey: "name",
    valueKey: "id",
    required: true,
  },
];

export const changeLocationValidationSchema = Yup.object().shape({
  locationId: Yup.string().required("New location is required"),
});

export const otherCategoryFormFields = [
  {
    name: "assetName",
    label: "Asset Name",
    type: "text",
    placeholder: "Enter asset name",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
    required: true,
  },
];

export const otherCategoryValidationSchema = Yup.object().shape({
  assetName: Yup.string().required("Asset Name is required"),
  description: Yup.string().required("Description is required"),
});

export const otherCategoryInitialValues = {
  assetName: "",
  description: "",
};

export const inspectionLogFields = [
  {
    name: "inspectionDate",
    label: "Inspection Date",
    type: "date",
    placeholder: "dd/mm/yyyy",
    required: true,
    rowWith: "nextInspectionDate",
  },
  {
    name: "nextInspectionDate",
    label: "Next Inspection Date",
    type: "date",
    placeholder: "dd/mm/yyyy",
    required: true,
    hint: "Pick when the next inspection should happen.",
    pairedWith: "inspectionDate",
  },
  {
    name: "healthStatus",
    label: "Health After Inspection",
    type: "select",
    placeholder: "Select health status",
    required: true,
    options: [
      { value: "HEALTHY", label: "Healthy" },
      { value: "NEED_ATTENTION", label: "Need Attention" },
      // { value: "SERVICE_DUE", label: "Service Due" },
      { value: "INSPECTION_DUE", label: "Inspection Due" },
    ],
  },
  {
    name: "cost",
    label: "Cost",
    type: "number",
    placeholder: "Enter cost",
    required: false,
    min: 0,
  },
  {
    name: "notes",
    label: "Notes / Remarks",
    type: "textarea",
    placeholder: "Add any notes about this inspection...",
    required: false,
  },
];

export const inspectionLogValidationSchema = Yup.object().shape({
  inspectionDate: Yup.string().required("Inspection date is required"),
  nextInspectionDate: Yup.string()
    .required("Next inspection date is required")
    .nullable()
    .test(
      "next-after-inspection",
      "Next inspection date cannot be before the inspection date",
      function (value) {
        const { inspectionDate } = this.parent;
        if (!value || !inspectionDate) return true;
        return new Date(value) >= new Date(inspectionDate);
      },
    ),
  healthStatus: Yup.string().required("Health status is required"),
  cost: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? null
        : value,
    )
    .min(0, "Cost must be a positive number"),
  notes: Yup.string(),
});

////// Service Log — maps to POST /api/maintenance-history
export const serviceLogFields = [
  {
    name: "serviceDate",
    label: "Service Date",
    type: "date",
    placeholder: "dd/mm/yyyy",
    required: true,
    rowWith: "nextServiceDate",
  },
  {
    name: "nextServiceDate",
    label: "Next Service Date",
    type: "date",
    placeholder: "dd/mm/yyyy",
    required: true,
    hint: "Pick when the next service should happen.",
    pairedWith: "serviceDate",
  },
  {
    name: "healthStatus",
    label: "Health After Service",
    type: "select",
    placeholder: "Select health status",
    required: true,
    options: [
      { value: "HEALTHY", label: "Healthy" },
      { value: "NEED_ATTENTION", label: "Need Attention" },
      { value: "SERVICE_DUE", label: "Service Due" },
      // { value: "INSPECTION_DUE", label: "Inspection Due" },
    ],
  },
  {
    name: "serviceProvider",
    label: "Service Provider",
    type: "text",
    placeholder: "Enter service provider name",
    required: true,
  },
  {
    name: "cost",
    label: "Cost",
    type: "number",
    placeholder: "Enter service cost",
    required: false,
    min: 0,
  },
  
  {
    name: "notes",
    label: "Notes / Remarks",
    type: "textarea",
    placeholder: "Add any notes about this service...",
    required: false,
  },
  {
    name: "billDocument",
    label: "Bill / Receipt",
    type: "purchase-bill-selector",
    required: false,
    allowMultiple: false,
    simpleMode: true,
  },
];

export const serviceLogValidationSchema = Yup.object().shape({
  serviceDate: Yup.string().required("Service date is required"),
  nextServiceDate: Yup.string()
    .required("Next service date is required")
    .nullable()
    .test(
      "next-after-service",
      "Next service date cannot be before the service date",
      function (value) {
        const { serviceDate } = this.parent;
        if (!value || !serviceDate) return true;
        return new Date(value) >= new Date(serviceDate);
      },
    ),
  cost: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? null
        : value,
    )
    .min(0, "Cost must be a positive number"),
  serviceProvider: Yup.string()
  .required("Service provider is required"),
  healthStatus: Yup.string().required("Health status is required"),
  notes: Yup.string(),
});

////// AMC / Insurance Renewal — maps to POST /api/insurance
export const amcRenewalFields = [
  {
    name: "amcStartDate",
    label: "AMC Start Date",
    type: "date",
    placeholder: "dd/mm/yyyy",
    required: true,
    rowWith: "amcExpiryDate",
  },
  {
    name: "amcExpiryDate",
    label: "AMC Expiry Date",
    type: "date",
    placeholder: "dd/mm/yyyy",
    required: true,
    hint: "Pick the AMC / insurance expiry date.",
    pairedWith: "amcStartDate",
  },
  {
    name: "healthStatus",
    label: "AMC / Insurance Status",
    type: "select",
    placeholder: "Select status",
    required: true,
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "EXPIRING_SOON", label: "Expiring Soon" },
      { value: "EXPIRED", label: "Expired" },
    ],
  },
  {
    name: "insuranceProvider",
    label: "AMC / Insurance Provider",
    type: "text",
    placeholder: "e.g., HDFC Ergo / Dell Pro Support",
    required: true,
  },
  {
    name: "vendorDetails",
    label: "Vendor Details",
    type: "textarea",
    placeholder: "Contact person, phone, email, address",
    required: true,
  },
  {
    name: "cost",
    label: "Cost",
    type: "number",
    placeholder: "Enter AMC / Insurance cost",
    required: false,
    min: 0,
  },
  {
    name: "notes",
    label: "Notes / Remarks",
    type: "textarea",
    placeholder: "Add any notes about this AMC / Insurance renewal...",
    required: false,
  },
  {
    name: "policyDocument",
    label: "AMC / Policy Document",
    type: "purchase-bill-selector",
    required: false,
    allowMultiple: false,
    simpleMode: true,
  },
];

export const amcRenewalValidationSchema = Yup.object().shape({
  amcStartDate: Yup.string().required("AMC start date is required"),
  amcExpiryDate: Yup.string()
    .required("AMC expiry date is required")
    .test(
      "expiry-after-start",
      "Expiry date cannot be before the start date",
      function (value) {
        const { amcStartDate } = this.parent;
        if (!value || !amcStartDate) return true;
        return new Date(value) >= new Date(amcStartDate);
      },
    ),
  healthStatus: Yup.string().required("AMC / Insurance status is required"),
  insuranceProvider: Yup.string().required("AMC / Insurance provider is required"),
  vendorDetails: Yup.string()
  .required("Vendor details are required"),
  cost: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? null
        : value,
    )
    .min(0, "Cost must be a positive number"),
  notes: Yup.string(),
});
