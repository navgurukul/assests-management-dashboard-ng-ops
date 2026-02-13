'use client';

import React from 'react';
import { Field, ErrorMessage } from 'formik';
import DocumentSelector from './DocumentSelector';
import ApiAutocomplete from '@/components/atoms/ApiAutocomplete';
import MultiSelect from '@/components/atoms/MultiSelect';
import CampusAssetTable from './CampusAssetTable';

export default function FormField({ field, formik, onFieldChange }) {
  const { name, label, type, placeholder, required, options, min, max, disabled, readOnly } = field;
  const hasError = formik.touched[name] && formik.errors[name];

  // Handle field change with callback
  const handleFieldChange = (event) => {
    const value = event.target.value;
    formik.setFieldValue(name, value);
    // Call the field-specific callback if provided
    if (onFieldChange && typeof onFieldChange === 'function') {
      onFieldChange(value, formik);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Field
            name={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        );

      case 'number':
        return (
          <Field
            name={name}
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'date':
        return (
          <Field
            name={name}
            type="date"
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'select':
        return (
          <Field
            as="select"
            name={name}
            onChange={handleFieldChange}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
        );

      case 'multi-select':
        return (
          <>
            <MultiSelect
              name={name}
              label={label}
              placeholder={placeholder}
              options={options || []}
              value={formik.values[name] || []}
              onChange={(e) => formik.setFieldValue(name, e.target.value)}
              onBlur={() => formik.setFieldTouched(name, true)}
              isInvalid={hasError}
              errorMessage={hasError ? formik.errors[name] : ''}
              isRequired={required}
              isDisabled={disabled}
            />
          </>
        );

      case 'textarea':
        return (
          <Field
            as="textarea"
            name={name}
            placeholder={placeholder}
            rows={3}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <Field
              name={name}
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={name} className="ml-2 text-xs text-gray-700">
              {label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-1">
            {options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <Field
                  name={name}
                  type="radio"
                  value={option.value}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'document-selector':
        return (
          <DocumentSelector
            selectedDocuments={formik.values[name] || []}
            onDocumentsChange={(docs) => formik.setFieldValue(name, docs)}
            allowMultiple={field.allowMultiple !== false}
            documentType={field.documentType || 'INVOICE'}
          />
        );

      case 'api-autocomplete':
        // Handle dependsOn - disable field if dependent field has no value
        const dependsOnField = field.dependsOn?.field;
        const dependentValue = dependsOnField ? formik.values[dependsOnField] : null;
        const isDependentDisabled = dependsOnField && !dependentValue;
        
        return (
          <ApiAutocomplete
            name={name}
            label={label}
            placeholder={isDependentDisabled ? `Please select ${dependsOnField?.replace('Id', '')} first` : placeholder}
            apiUrl={field.apiUrl}
            queryKey={field.queryKey}
            value={formik.values[name] || ''}
            onChange={(e) => formik.setFieldValue(name, e.target.value)}
            onBlur={() => formik.setFieldTouched(name, true)}
            isInvalid={hasError}
            errorMessage={hasError ? formik.errors[name] : ''}
            isRequired={required}
            isDisabled={field.disabled || isDependentDisabled}
            labelKey={field.labelKey || 'name'}
            valueKey={field.valueKey || 'id'}
            dependsOn={field.dependsOn}
            dependentValue={dependentValue}
            filterCategory={field.filterCategory}
            dataPath={field.dataPath}
            formatLabel={field.formatLabel}
            selectedItem={field.selectedItem}
          />
        );

      case 'campus-asset-table':
        return (
          <CampusAssetTable
            assets={formik.values[name] || []}
            onChange={(assets) => formik.setFieldValue(name, assets)}
          />
        );

      default:
        return (
          <Field
            name={name}
            type="text"
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  return (
    <div className="mb-2">
      {type !== 'checkbox' && type !== 'api-autocomplete' && type !== 'multi-select' && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {type !== 'api-autocomplete' && type !== 'multi-select' && (
        <ErrorMessage name={name}>
          {(msg) => <div className="text-red-500 text-xs mt-0.5">{msg}</div>}
        </ErrorMessage>
      )}
    </div>
  );
}
