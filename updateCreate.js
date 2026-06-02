const fs = require('fs');

let code = fs.readFileSync('features/assets/CreateAsset.js', 'utf8');

const importStr = `import {
  assetFormFields,
  assetValidationSchema,
  assetInitialValues,
  otherCategoryFormFields,
  otherCategoryValidationSchema,
  otherCategoryInitialValues,
} from '@/app/config/formConfigs/assetFormConfig';`;

const targetImports = `import {
  assetFormFields,
  assetValidationSchema,
  assetInitialValues,
} from '@/app/config/formConfigs/assetFormConfig';
import { getCategoryConfig } from '@/app/config/formConfigs/categoryFormConfigs';`;

code = code.replace(importStr, targetImports);

const defaultExportRegex = /export default function CreateAsset\(\) \{[\s\S]*?const categories = \[[\s\S]*?\];/;
const newStart = `export default function CreateAsset() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assetCategory, setAssetCategory] = useState("IT & Electronics");

  const categories = [
    "IT & Electronics",
    "Furniture & Fixtures",
    "Appliances & Equipment",
    "Vehicles & Mobility",
    "Learning & Recreation",
    "Kitchen & Housekeeping",
    "Infrastructure Assets"
  ];
  
  const currentConfig = assetCategory === "IT & Electronics" 
    ? { fields: assetFormFields, validationSchema: assetValidationSchema, initialValues: assetInitialValues }
    : getCategoryConfig(assetCategory);
`;
code = code.replace(defaultExportRegex, newStart);

const formRegex = /<GenericForm[\s\S]*?\/>/;
const newForm = `<GenericForm
            key={assetCategory}
            fields={currentConfig.fields}
            initialValues={currentConfig.initialValues}
            validationSchema={currentConfig.validationSchema}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Asset"
            isSubmitting={isSubmitting}
            fieldCallbacks={fieldCallbacks}
          />`;
code = code.replace(formRegex, newForm);

fs.writeFileSync('features/assets/CreateAsset.js', code);
console.log("Updated CreateAsset.js!");
