import * as Yup from "yup";
import {
  assetTypeField,
  commonAssetFields,
  commonAssetValidation,
  commonAssetInitial,
  createAssetBaseValidation,
  createAssetBaseInitial,
  getBrandModelFields,
  getBrandModelValidation,
} from "./assetFormConfig";

export const categoryConfigs = {
  "IT & Electronics": {
    fields: [
      {
        name: "processor",
        label: "Processor",
        type: "select",
        placeholder: "Select processor",
        required: false,
        options: [
          { label: "Intel Core i3", value: "Intel Core i3" },
          { label: "Intel Core i5", value: "Intel Core i5" },
          { label: "Intel Core i7", value: "Intel Core i7" },
          { label: "Intel Core i9", value: "Intel Core i9" },
          { label: "Intel Pentium", value: "Intel Pentium" },
          { label: "Intel Celeron", value: "Intel Celeron" },
          { label: "Intel Xeon", value: "Intel Xeon" },
          { label: "AMD Ryzen 3", value: "AMD Ryzen 3" },
          { label: "AMD Ryzen 5", value: "AMD Ryzen 5" },
          { label: "AMD Ryzen 7", value: "AMD Ryzen 7" },
          { label: "AMD Ryzen 9", value: "AMD Ryzen 9" },
          { label: "Apple M1", value: "Apple M1" },
          { label: "Apple M2", value: "Apple M2" },
          { label: "Apple M3", value: "Apple M3" },
          { label: "Other", value: "Other" },
        ],
        showIf: {
          field: "assetTypeName",
          value: ["Laptop", "Desktop", "Tablet", "Smartphone", "Server", "CPU"],
        },
      },
      {
        name: "ramSizeGB",
        label: "RAM Size (GB)",
        type: "api-autocomplete",
        placeholder: "Search and select RAM size (GB)",
        apiUrl: "",
        queryKey: [],
        labelKey: "label",
        valueKey: "value",
        staticItems: [
          { label: "4 GB", value: "4" },
          { label: "8 GB", value: "8" },
          { label: "12 GB", value: "12" },
          { label: "16 GB", value: "16" },
          { label: "24 GB", value: "24" },
          { label: "32 GB", value: "32" },
          { label: "64 GB", value: "64" },
        ],
        required: false,
        showIf: {
          field: "assetTypeName",
          value: ["Laptop", "Desktop", "Tablet", "Smartphone", "Server", "RAM"],
        },
      },
      {
        name: "storageSizeGB",
        label: "Storage Size (GB)",
        type: "api-autocomplete",
        placeholder: "Search and select storage size (GB)",
        apiUrl: "",
        queryKey: [],
        labelKey: "label",
        valueKey: "value",
        staticItems: [
          { label: "128 GB", value: "128" },
          { label: "256 GB", value: "256" },
          { label: "512 GB", value: "512" },
          { label: "1024 GB (1 TB)", value: "1024" },
        ],
        required: false,
        showIf: {
          field: "assetTypeName",
          value: ["Laptop", "Desktop", "Tablet", "Smartphone", "Server", "External Hard Drive", "USB Flash Drive", "SSD", "HDD"],
        },
      },
      {
        name: "serialNumber",
        label: "Serial Number",
        type: "text",
        placeholder: "Enter manufacturer serial number (e.g., 5CG7450GK6)",
        required: true,
      },
    ],
    validation: {
      processor: Yup.string().when("assetTypeName", {
        is: (val) => ["Laptop", "Desktop", "Server", "CPU"].includes(val),
        then: (schema) => schema.required("Processor is required").min(2).max(15),
        otherwise: (schema) => schema.notRequired(),
      }),
      ramSizeGB: Yup.string().nullable().when("assetTypeName", {
        is: (val) => ["Laptop", "Desktop", "Server"].includes(val),
        then: (schema) => schema.required("RAM size is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      storageSizeGB: Yup.number().nullable()
        .transform((value, originalValue) =>
          originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        )
        .when("assetTypeName", {
          is: (val) => ["External Hard Drive", "USB Flash Drive", "SSD", "HDD"].includes(val),
          then: (schema) => schema.required("Storage size is required").min(1),
          otherwise: (schema) => schema.notRequired(),
        }),
      serialNumber: Yup.string()
        .required("Serial number is required")
        .min(2)
        .matches(/^[a-zA-Z0-9]+$/, "Only letters and numbers allowed")
        .test("contains-letter", "Must contain at least one letter", function(value) {
          if (!value) return true;
          return /[a-zA-Z]/.test(value);
        }),
    },
    initial: {
      processor: "",
      ramSizeGB: "",
      storageSizeGB: "",
      serialNumber: "",
    },
  },
  "Furniture & Fixtures": {
    fields: [
      { name: "material", label: "Material", type: "text", placeholder: "e.g. Wood, Steel", required: true },
      { name: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 10x20x5", required: true },
    ],
    validation: {
      material: Yup.string().required("Material is required"),
      dimensions: Yup.string().required("Dimensions is required"),
    },
    initial: { material: "", dimensions: "" },
  },
  "Appliances & Equipment": {
    fields: [
      { name: "powerRating", label: "Power Rating (Watts)", type: "number", placeholder: "e.g. 1500", required: true },
    ],
    validation: {
      powerRating: Yup.number().required("Power Rating is required").min(1),
    },
    initial: { powerRating: "" },
  },
  "Vehicles & Mobility": {
    fields: [
      { name: "vehicleNumber", label: "Vehicle Number", type: "text", placeholder: "e.g. MH 12 AB 1234", required: true },
    ],
    validation: {
      vehicleNumber: Yup.string().required("Vehicle Number is required"),
    },
    initial: { vehicleNumber: "" },
  },
  "Learning & Recreation": {
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "e.g. Cricket, Algebra Textbook", required: true },
      { name: "isbn", label: "ISBN", type: "text", placeholder: "978-3-16-148410-0", required: false, showIf: { field: "assetTypeName", value: ["Books"] } },
    ],
    validation: {
      name: Yup.string().required("Name is required"),
      isbn: Yup.string().required("ISBN is required").min(1),
    },
    initial: { name: "", isbn: "" },
  },
  "Kitchen & Housekeeping": {
    fields: [
      { name: "material", label: "Material", type: "text", placeholder: "e.g. Stainless Steel", required: true },
      { name: "capacity", label: "Capacity (Liters/Kg)", type: "number", placeholder: "e.g. 5", required: true },
    ],
    validation: {
      material: Yup.string().required("Material is required"),
      capacity: Yup.number().required("Capacity is required").min(1),
    },
    initial: { material: "", capacity: "" },
  },
  "Infrastructure Assets": {
    fields: [
      { name: "installationDate", label: "Installation Date", type: "date", required: true },
      { name: "contractorVendor", label: "Vendor / Contractor", type: "text", placeholder: "e.g. ABC Corp", required: true },
    ],
    validation: {
      installationDate: Yup.string().required("Installation Date is required"),
      contractorVendor: Yup.string().required("Vendor is required"),
    },
    initial: { installationDate: "", contractorVendor: "" },
  },
};

const buildCreateAssetFields = (categoryName) => [
  assetTypeField,
  ...getBrandModelFields(categoryName),
];

const buildCreateAssetValidation = (categoryName, categoryValidation = {}) =>
  Yup.object().shape({
    ...createAssetBaseValidation,
    ...getBrandModelValidation(categoryName),
    ...categoryValidation,
    ...commonAssetValidation,
  });

const buildCreateAssetInitialValues = (categoryName, categoryInitial = {}) => ({
  ...createAssetBaseInitial,
  ...categoryInitial,
  ...commonAssetInitial,
});

export const getNoCategoryConfig = () => ({
  fields: [...buildCreateAssetFields(""), ...commonAssetFields],
  validationSchema: buildCreateAssetValidation(""),
  initialValues: buildCreateAssetInitialValues(""),
});

export const getCategoryConfig = (categoryName) => {
  const config = categoryConfigs[categoryName];
  if (!config) return null;

  return {
    fields: [
      ...buildCreateAssetFields(categoryName),
      ...config.fields,
      ...commonAssetFields,
    ],
    validationSchema: buildCreateAssetValidation(categoryName, config.validation),
    initialValues: buildCreateAssetInitialValues(categoryName, config.initial),
  };
};
