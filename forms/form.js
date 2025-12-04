"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { assetFormFields } from "./fields";

function AssetForm() {

  const initialValues = assetFormFields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

  const validationSchema = Yup.object(
    assetFormFields.reduce((acc, field) => {
      if (field.validation === "string") {
        acc[field.name] = Yup.string().required(`${field.label} is required`);
      } else if (field.validation === "number") {
        acc[field.name] = Yup.number()
          .typeError("Must be a number")
          .required(`${field.label} is required`);
      }
      return acc;
    }, {})
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {console.log(values); alert(JSON.stringify(values, null, 2));}}
    >
      {() => (
        <Form className="space-y-4">
          {assetFormFields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">{field.label}: </label>

              {field.type === "text" || field.type === "number" ? (
                <Field 
                  type={field.type} 
                  name={field.name}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : null}

              {field.type === "select" && (
                <Field 
                  as="select" 
                  name={field.name}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Field>
              )}

              {field.type === "radio" && (
                <div className="space-y-2">
                  {field.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm">
                      <Field type="radio" name={field.name} value={option} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              <ErrorMessage
                name={field.name}
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>
          ))}

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition mt-6"
          >
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default AssetForm;