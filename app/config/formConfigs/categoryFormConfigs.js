import * as Yup from "yup";
import { commonAssetFields, commonAssetValidation, commonAssetInitial } from "./assetFormConfig";

export const categoryConfigs = {
  "Furniture & Fixtures": {
    assetTypes: ["Bed", "Mattress", "Table", "Chair", "Cupboard", "Shelf", "Whiteboard"],
    fields: [
      { name: "material", label: "Material", type: "text", placeholder: "e.g. Wood, Steel", required: true },
      { name: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 10x20x5", required: true }
    ],
    validation: {
      material: Yup.string().required("Material is required"),
      dimensions: Yup.string().required("Dimensions is required")
    },
    initial: { material: "", dimensions: "" }
  },
  "Appliances & Equipment": {
    assetTypes: ["Fan", "Cooler", "Refrigerator", "Washing Machine", "RO", "Water Cooler", "Motor", "Inverter", "Battery", "Generator"],
    fields: [
      { name: "brand", label: "Brand", type: "text", placeholder: "e.g. LG, Samsung", required: true },
      { name: "powerRating", label: "Power Rating (Watts)", type: "number", placeholder: "e.g. 1500", required: true }
    ],
    validation: {
      brand: Yup.string().required("Brand is required"),
      powerRating: Yup.number().required("Power Rating is required").min(1)
    },
    initial: { brand: "", powerRating: "" }
  },
  "Vehicles & Mobility": {
    assetTypes: ["Scooter", "Bicycle", "E-Bike"],
    fields: [
      { name: "vehicleNumber", label: "Vehicle Number", type: "text", placeholder: "e.g. MH 12 AB 1234", required: true },
      { name: "brand", label: "Brand / Make", type: "text", placeholder: "e.g. Honda, Hero", required: true }
    ],
    validation: {
      vehicleNumber: Yup.string().required("Vehicle Number is required"),
      brand: Yup.string().required("Brand is required")
    },
    initial: { vehicleNumber: "", brand: "" }
  },
  "Learning & Recreation": {
    assetTypes: ["Books", "Sports Equipment", "Gym Equipment", "Learning Kits"],
    fields: [
      { name: "subjectOrSport", label: "Subject / Sport Category", type: "text", placeholder: "e.g. Cricket, Math", required: true },
      { name: "quantity", label: "Quantity", type: "number", placeholder: "e.g. 10", required: true }
    ],
    validation: {
      subjectOrSport: Yup.string().required("Category is required"),
      quantity: Yup.number().required("Quantity is required").min(1)
    },
    initial: { subjectOrSport: "", quantity: "" }
  },
  "Kitchen & Housekeeping": {
    assetTypes: ["Stove", "Utensils", "Dining Equipment", "Cleaning Equipment", "Vacuum Cleaner"],
    fields: [
      { name: "material", label: "Material", type: "text", placeholder: "e.g. Stainless Steel", required: true },
      { name: "capacity", label: "Capacity (Liters/Kg)", type: "number", placeholder: "e.g. 5", required: true }
    ],
    validation: {
      material: Yup.string().required("Material is required"),
      capacity: Yup.number().required("Capacity is required").min(1)
    },
    initial: { material: "", capacity: "" }
  },
  "Infrastructure Assets": {
    assetTypes: ["Solar System", "Water Tank", "Electrical Panels", "Plumbing Assets", "Fixed Installations"],
    fields: [
      { name: "installationDate", label: "Installation Date", type: "date", required: true },
      { name: "vendor", label: "Vendor / Contractor", type: "text", placeholder: "e.g. ABC Corp", required: true }
    ],
    validation: {
      installationDate: Yup.string().required("Installation Date is required"),
      vendor: Yup.string().required("Vendor is required")
    },
    initial: { installationDate: "", vendor: "" }
  }
};

export const getCategoryConfig = (category) => {
  const config = categoryConfigs[category];
  if (!config) return null;

  const typeOptions = config.assetTypes.map(t => ({ label: t, value: t }));

  const fields = [
    {
      name: "assetTypeName",
      label: "Asset Type",
      type: "select",
      placeholder: "Select asset type",
      required: true,
      options: typeOptions
    },
    ...config.fields,
    ...commonAssetFields
  ];

  const validationSchema = Yup.object().shape({
    assetTypeName: Yup.string().required("Asset Type is required"),
    ...config.validation,
    ...commonAssetValidation
  });

  const initialValues = {
    assetTypeName: "",
    ...config.initial,
    ...commonAssetInitial
  };

  return { fields, validationSchema, initialValues };
};
