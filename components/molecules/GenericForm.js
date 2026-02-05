'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import FormField from './FormField';

export default function GenericForm({
  fields,
  initialValues,
  validationSchema,
  onSubmit,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  onCancel,
  isSubmitting = false,
  showSections = false,
}) {
  // Check if fields are grouped by sections
  const hasSection = fields.length > 0 && fields[0].section;
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {(formik) => (
        <Form className="space-y-6">
          {/* Render fields with sections */}
          {hasSection ? (
            fields.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
                  {section.section}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => {
                    // Handle conditional fields (showIf)
                    if (field.showIf) {
                      const conditionMet = formik.values[field.showIf.field] === field.showIf.value;
                      if (!conditionMet) return null;
                    }
                    
                    return (
                      <div
                        key={field.name}
                        className={
                          field.type === 'textarea' || field.type === 'document-selector'
                            ? 'md:col-span-2'
                            : ''
                        }
                      >
                        <FormField field={field} formik={formik} />
                        {field.helpText && (
                          <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            /* Render fields without sections */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => {
                // Handle conditional fields (showIf)
                if (field.showIf) {
                  const conditionMet = formik.values[field.showIf.field] === field.showIf.value;
                  if (!conditionMet) return null;
                }
                
                return (
                  <div
                    key={field.name}
                    className={
                      field.type === 'textarea' || 
                      field.type === 'campus-asset-table' || 
                      field.type === 'radio'
                        ? 'md:col-span-2' 
                        : ''
                    }
                  >
                    <FormField field={field} formik={formik} />
                    {field.helpText && (
                      <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting || formik.isSubmitting}
              >
                {cancelButtonText}
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || formik.isSubmitting || !formik.isValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || formik.isSubmitting ? 'Submitting...' : submitButtonText}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
