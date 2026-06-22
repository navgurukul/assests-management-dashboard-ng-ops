const fs = require('fs');
const code = fs.readFileSync('app/config/formConfigs/assetFormConfig.js', 'utf8');

const regex = /\{\s*name:\s*"campusId".*?\}\s*\];/s;
const match = code.match(regex);
console.log(match ? "Found match" : "No match");
