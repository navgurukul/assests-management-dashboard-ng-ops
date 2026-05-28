import * as Yup from "yup";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const assetFormFields = [
  {
    name: "assetCategory",
    label: "Asset Category",
    type: "radio",
    required: true,
    options: [
      { label: "Digital Asset", value: "DIGITAL" },
      { label: "Non-Digital Asset", value: "NON_DIGITAL" },
    ],
  },
  {
    name: "assetTypeId",
    label: "Asset Type",
    type: "api-autocomplete",
    placeholder: "Search and select asset type",
    apiUrl: baseUrl + "/asset-types",
    queryKey: ["asset-types"],
    labelKey: "name",
    valueKey: "id",
    required: true,
    filterCategory: "DEVICE",
    companionField: "assetTypeName",
    companionKey: "name",
    onFieldChange: "onAssetTypeChange",
    showIf: { field: "assetCategory", value: ["DIGITAL"] },
  },
  {
    name: "nonDigitalCategory",
    label: "Asset Type",
    type: "select",
    placeholder: "Select asset type",
    required: true,
    showIf: { field: "assetCategory", value: ["NON_DIGITAL"] },
    options: [
      { value: "FURNITURE", label: "Furniture" },
      { value: "SPORTS_EQUIPMENT", label: "Sports Equipment" },
      { value: "BOOKS", label: "Books" },
      { value: "STATIONERY", label: "Stationery" },
      { value: "KITCHEN", label: "Kitchen Equipment" },
      { value: "CLEANING", label: "Cleaning Equipment" },
    ],
    onFieldChange: "onNonDigitalCategoryChange",
  },
  {
    name: "nonDigitalSubCategoryFurniture",
    label: "Item Type",
    type: "select",
    placeholder: "Select item type",
    required: true,
    showIf: { field: "nonDigitalCategory", value: ["FURNITURE"] },
    options: [
      { value: "CHAIR", label: "Chair" },
      { value: "TABLE", label: "Table" },
      { value: "CUPBOARD", label: "Cupboard" },
      { value: "SHELF", label: "Shelf" },
      { value: "BED", label: "Bed" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    name: "nonDigitalSubCategorySports",
    label: "Equipment Type",
    type: "select",
    placeholder: "Select equipment type",
    required: true,
    showIf: { field: "nonDigitalCategory", value: ["SPORTS_EQUIPMENT"] },
    options: [
      { value: "CRICKET", label: "Cricket Kit" },
      { value: "FOOTBALL", label: "Football" },
      { value: "BADMINTON", label: "Badminton" },
      { value: "CHESS", label: "Chess" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    name: "nonDigitalSubCategoryStationery",
    label: "Item Type",
    type: "select",
    required: true,
    showIf: { field: "nonDigitalCategory", value: ["STATIONERY"] },
    options: [
      { value: "PEN", label: "Pen" },
      { value: "PENCIL", label: "Pencil" },
      { value: "NOTEBOOK", label: "Notebook" },
      { value: "MARKER", label: "Marker" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    name: "nonDigitalSubCategoryKitchen",
    label: "Item Type",
    type: "select",
    required: true,
    showIf: { field: "nonDigitalCategory", value: ["KITCHEN"] },
    options: [
      { value: "UTENSILS", label: "Utensils" },
      { value: "APPLIANCE", label: "Appliance" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    name: "nonDigitalSubCategoryCleaning",
    label: "Item Type",
    type: "select",
    required: true,
    showIf: { field: "nonDigitalCategory", value: ["CLEANING"] },
    options: [
      { value: "BROOM", label: "Broom" },
      { value: "MOP", label: "Mop" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    name: "bookName",
    label: "Book Name",
    type: "text",
    placeholder: "Enter book name (e.g., Harry Potter, NCERT Science)",
    required: true,
    showIf: { field: "nonDigitalCategory", value: ["BOOKS"] },
  },
  {
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
    showIf: { field: "assetCategory", value: ["DIGITAL"] },
  },
  {
    name: "nonDigitalBrand",
    label: "Brand / Manufacturer",
    type: "text",
    placeholder: "Enter brand or manufacturer name (optional)",
    required: false,
    showIf: { field: "assetCategory", value: ["NON_DIGITAL"] },
  },
  {
    name: "model",
    label: "Model",
    type: "text",
    placeholder: "Enter model (e.g., Latitude 5400)",
    required: true,
    showIf: { field: "assetCategory", value: ["DIGITAL"] },
  },
  {
    name: "nonDigitalModel",
    label: "Model / Description",
    type: "text",
    placeholder: "Enter description (optional, e.g., Plastic Chair, A4 Size)",
    required: false,
    showIf: { field: "assetCategory", value: ["NON_DIGITAL"] },
  },
  {
    name: "processor",
    label: "Processor",
    type: "select",
    placeholder: "Select processor",
    required: false,
    options: [
      // Intel
      { label: "Intel Core i3", value: "Intel Core i3" },
      { label: "Intel Core i5", value: "Intel Core i5" },
      { label: "Intel Core i7", value: "Intel Core i7" },
      { label: "Intel Core i9", value: "Intel Core i9" },
      { label: "Intel Pentium", value: "Intel Pentium" },
      { label: "Intel Celeron", value: "Intel Celeron" },
      { label: "Intel Xeon", value: "Intel Xeon" },
      { label: "Intel Atom", value: "Intel Atom" },
      // AMD
      { label: "AMD Ryzen 3", value: "AMD Ryzen 3" },
      { label: "AMD Ryzen 5", value: "AMD Ryzen 5" },
      { label: "AMD Ryzen 7", value: "AMD Ryzen 7" },
      { label: "AMD Ryzen 9", value: "AMD Ryzen 9" },
      { label: "AMD Athlon", value: "AMD Athlon" },
      { label: "AMD FX", value: "AMD FX" },
      { label: "AMD EPYC", value: "AMD EPYC" },
      { label: "AMD Threadripper", value: "AMD Threadripper" },
      // Apple
      { label: "Apple M1", value: "Apple M1" },
      { label: "Apple M2", value: "Apple M2" },
      { label: "Apple M3", value: "Apple M3" },
      // ARM
      { label: "ARM Cortex-A", value: "ARM Cortex-A" },
      { label: "ARM Cortex-M", value: "ARM Cortex-M" },
      { label: "ARM Cortex-R", value: "ARM Cortex-R" },
      // Qualcomm
      { label: "Qualcomm Snapdragon 8cx", value: "Qualcomm Snapdragon 8cx" },
      { label: "Qualcomm Snapdragon 888", value: "Qualcomm Snapdragon 888" },
      // Others
      { label: "Other", value: "Other" },
    ],
    showIf: {
      conditions: [
        { field: "assetCategory", value: ["DIGITAL"] },
        { field: "assetTypeName", value: ["Laptop", "Desktop", "Tablet", "Smartphone", "Server", "CPU"] },
      ],
    },
  },
  {
    name: "ramSizeGB",
    label: "RAM Size (GB)",
    type: "api-autocomplete",
    placeholder: "Search and select RAM size (GB)",
    apiUrl: "", // No API URL since we are using static items for RAM sizes
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
      conditions: [
        { field: "assetCategory", value: ["DIGITAL"] },
        { field: "assetTypeName", value: ["Laptop", "Desktop", "Tablet", "Smartphone", "Server", "RAM"] },
      ],
    },
  },
  {
    name: "storageSizeGB",
    label: "Storage Size (GB)",
    type: "api-autocomplete",
    placeholder: "Search and select storage size (GB)",
    apiUrl: "", // No API URL since we are using static items for storage sizes
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
      conditions: [
        { field: "assetCategory", value: ["DIGITAL"] },
        { field: "assetTypeName", value: [
          "Laptop",
          "Desktop",
          "Tablet",
          "Smartphone",
          "Server",
          "External Hard Drive",
          "USB Flash Drive",
          "SSD",
          "HDD",
        ] },
      ],
    },
  },
  {
    name: "serialNumber",
    label: "Serial Number",
    type: "text",
    placeholder: "Enter manufacturer serial number (e.g., 5CG7450GK6",
    required: true,
    showIf: { field: "assetCategory", value: ["DIGITAL"] },
  },
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
      conditions: [
        { field: "assetCategory", value: ["DIGITAL"] },
        { field: "assetTypeName", value: ["Laptop", "Tablet", "Smartphone"] },
      ],
    },
  },
];

export const assetValidationSchema = Yup.object().shape({
  assetCategory: Yup.string()
    .required("Asset category is required")
    .oneOf(["DIGITAL", "NON_DIGITAL"], "Invalid category"),
  assetTypeId: Yup.string().when("assetCategory", {
    is: "DIGITAL",
    then: (schema) => schema.required("Asset type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalCategory: Yup.string().when("assetCategory", {
    is: "NON_DIGITAL",
    then: (schema) => schema.required("Category is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalSubCategoryFurniture: Yup.string().when("nonDigitalCategory", {
    is: "FURNITURE",
    then: (schema) => schema.required("Item type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalSubCategorySports: Yup.string().when("nonDigitalCategory", {
    is: "SPORTS_EQUIPMENT",
    then: (schema) => schema.required("Equipment type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalSubCategoryStationery: Yup.string().when("nonDigitalCategory", {
    is: "STATIONERY",
    then: (schema) => schema.required("Item type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalSubCategoryKitchen: Yup.string().when("nonDigitalCategory", {
    is: "KITCHEN",
    then: (schema) => schema.required("Item type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalSubCategoryCleaning: Yup.string().when("nonDigitalCategory", {
    is: "CLEANING",
    then: (schema) => schema.required("Item type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  bookName: Yup.string().when("nonDigitalCategory", {
    is: "BOOKS",
    then: (schema) => schema.required("Book name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  brand: Yup.string().when("assetCategory", {
    is: "DIGITAL",
    then: (schema) => schema.required("Brand is required").min(2, "Brand must be at least 2 characters"),
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalBrand: Yup.string().notRequired(),
  model: Yup.string().when("assetCategory", {
    is: "DIGITAL",
    then: (schema) => schema
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
    otherwise: (schema) => schema.notRequired(),
  }),
  nonDigitalModel: Yup.string().notRequired(),
  assetTypeName: Yup.string(),
  processor: Yup.string().when("assetTypeName", {
    is: (val) => ["Laptop", "Desktop", "Server", "CPU"].includes(val),
    then: (schema) =>
      schema
        .required("Processor is required")
        .min(2, "Processor must be at least 2 characters")
        .max(15, "Max 15 characters allowed")
        .test("valid-processor", "Processor must contain letters (e.g., 'i5-12400', 'Ryzen 5 5600')", function (value) {
          if (!value) return true;
          return /[a-zA-Z]/.test(value);
        }),
    otherwise: (schema) => schema.notRequired().min(0),
  }),
  ramSizeGB: Yup.string()
    .nullable()
    .when("assetTypeName", {
      is: (val) => ["Laptop", "Desktop", "Server"].includes(val),
      then: (schema) => schema.required("RAM size is required"),
      otherwise: (schema) => schema.notRequired(),
    })
    .test("valid-ram", "RAM size must be at least 1 GB", function (value) {
      if (!value) return true;
      const num = parseInt(value, 10);
      return num >= 1;
    }),
  storageSizeGB: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
        ? null
        : value,
    )
    .when("assetTypeName", {
      is: (val) =>
        ["External Hard Drive", "USB Flash Drive", "SSD", "HDD"].includes(val),
      then: (schema) =>
        schema
          .required("Storage size is required")
          .min(1, "Storage size must be at least 1 GB"),
      otherwise: (schema) => schema.notRequired(),
    }),
  serialNumber: Yup.string().when("assetCategory", {
    is: "DIGITAL",
    then: (schema) => schema
      .required("Serial number is required")
      .min(2, "Serial number must be at least 2 characters")
      .matches(
        /^[a-zA-Z0-9]+$/,     
        "Only letters and numbers allowed. No spaces, hyphens, slashes, or special characters."
      )
      .test("contains-letter", "Serial number must contain at least one letter (e.g., 'SN12345')", function (value) {
        if (!value) return true;
        return /[a-zA-Z]/.test(value);
      }),
    otherwise: (schema) => schema.notRequired(),
  }),
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
      otherwise: (schema) => schema
        .required("Purchase date is required")
        .test("not-future-date", "Purchase date cannot be in the future", function (value) {
          if (!value) return true;
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          selectedDate.setHours(0, 0, 0, 0);
          return selectedDate <= today;
        }),
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
  notes: Yup.string(),
  charger: Yup.boolean(),
});

export const assetInitialValues = {
  assetCategory: "DIGITAL",
  nonDigitalCategory: "",
  nonDigitalSubCategoryFurniture: "",
  nonDigitalSubCategorySports: "",
  nonDigitalSubCategoryStationery: "",
  nonDigitalSubCategoryKitchen: "",
  nonDigitalSubCategoryCleaning: "",
  bookName: "",
  assetTypeId: "",
  assetTypeName: "",
  brand: "",
  nonDigitalBrand: "",
  model: "",
  nonDigitalModel: "",
  processor: "",
  ramSizeGB: "",
  storageSizeGB: "",
  serialNumber: "",
  campusId: "",
  currentLocationId: "",
  status: "IN_STOCK",
  condition: "WORKING",
  sourceType: "PURCHASED",
  sourceBy: "",
  purchaseDate: "",
  cost: "",
  notes: "",
  charger: false,
};

// Change Location Form Configuration
export const changeLocationFields = [
  {
    name: "locationId",
    label: "New Location",
    type: "api-autocomplete",
    placeholder: "Search and select new location",
    apiUrl: baseUrl + "/locations/campus/", // Campus ID will be appended dynamically in AssetDetails
    queryKey: ["locations"],
    labelKey: "name",
    valueKey: "id",
    required: true,
  },
];

export const changeLocationValidationSchema = Yup.object().shape({
  locationId: Yup.string().required("New location is required"),
});