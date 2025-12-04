export const assetFormFields = [
  {name: "assettag",label: "Asset Tag",type: "text",validation: "string"},
//   {name: "price",label: "Price",type: "number",validation: "number"},
  {name: "Type",label: "Type",type: "select",options: ["Laptop", "Charger","Desktop","tablet"],validation: "string"},
  {name: "Campus",label: "Campus",type: "select",options: ["Sarjapura", "Pune", "Dantewada","Dharamshala","Kisanganj", "jashpur","Himachal"],validation: "string"},
  {name: "condition",label: "Condition",type: "radio",options: ["New", "Old","Refurbished","Used"],validation: "string"},
  {name: "status",label: "Status",type: "select",options: ["In Stock", "Allocated","Repair","Scrap"],validation: "string"},
  {name: "location",label: "Location",type: "text",validation: "string"},
];
