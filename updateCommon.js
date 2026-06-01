const fs = require('fs');
let code = fs.readFileSync('app/config/formConfigs/assetFormConfig.js', 'utf8');

// We will extract commonFields logic.
// They start at serialNumber? No, let's start at campusId.

const startStr = `  {
    name: "campusId",`;
const endStr = `];

export const assetValidationSchema`;

const commonFieldsPart = code.substring(code.indexOf(startStr), code.indexOf(endStr));

const valStart = `campusId: Yup.string().required("Campus is required"),`;
const valEnd = `});

export const assetInitialValues`;

const commonValPart = code.substring(code.indexOf(valStart), code.indexOf(valEnd));

const initStart = `campusId: "",`;
const initEnd = `};

// Change Location Form Configuration`;

const commonInitPart = code.substring(code.indexOf(initStart), code.indexOf(initEnd));

const newCode = `
export const commonAssetFields = [
${commonFieldsPart}];

export const commonAssetValidation = {
  ${commonValPart}};

export const commonAssetInitial = {
  ${commonInitPart}};
`;

fs.appendFileSync('app/config/formConfigs/assetFormConfig.js', newCode);
console.log("Appended common extracts!");
