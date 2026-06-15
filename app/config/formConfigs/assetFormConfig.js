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
  apiUrl: "",// No API URL since we are using static items for brands 
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
  {
    name: "serviceDate",
    label: "Service Date",
    type: "date",
    placeholder: "Select service date",
    required: false,
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
  serviceDate: Yup.string().nullable(),
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
  serviceDate: "",
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
