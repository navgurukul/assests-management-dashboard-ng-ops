'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Modal from './Modal';
import CustomButton from '@/components/atoms/CustomButton';
import ApiAutocomplete from '@/components/atoms/ApiAutocomplete';
import FilterDropdown from './FilterDropdown';
import ActiveFiltersChips from './ActiveFiltersChips';
import AllocationConsignmentSelector from './AllocationConsignmentSelector';
import CustomDatePicker from '@/components/atoms/CustomDatePicker';

const parseDateValue = (value) => {
  if (!value) return null;
  return new Date(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) ? `${value}T00:00:00` : value);
};

const formatDateValue = (date) => {
  if (!date) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
};

export default function FormModal({
  isOpen,
  onClose,
  componentName = '',
  actionType = '',
  fields = [],
  onSubmit,
  size = 'medium',
  isSubmitting = false,
  componentData = null, // Component data from table row (includes campus.id)
  onFormDataChange = null, // Optional callback when form data changes
  helpText = '', // Optional help text to display instead of component name
  validationSchema = null, // Optional Yup schema for validation
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [filters, setFilters] = useState({});

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevFields, setPrevFields] = useState(fields);

  // Initialize form data when modal opens or fields change (avoids useEffect cascading renders)
  if (isOpen !== prevIsOpen || fields !== prevFields) {
    setPrevIsOpen(isOpen);
    setPrevFields(fields);

    if (isOpen) {
      const initialData = {};
      fields.forEach((field) => {
        if (field.type === 'allocation-consignment-selector' && field.lockAllocationSelection && field.lockedAllocationId) {
          const lockedAllocationValue = {
            allocationId: String(field.lockedAllocationId),
            selectedAssets: [],
            allocationDetails: field.lockedAllocationData || null,
          };

          initialData[field.name] = lockedAllocationValue;
          initialData.allocationId = lockedAllocationValue.allocationId;
          initialData.selectedAssets = lockedAllocationValue.selectedAssets;
          initialData.allocationDetails = lockedAllocationValue.allocationDetails;
          return;
        }

        initialData[field.name] = field.type === 'checkbox'
          ? (field.defaultValue ?? false)
          : (field.defaultValue || '');
      });
      setFormData(initialData);
      setErrors({});
      setTouched({});
      setFilters({});
    }
  }

  // Handle input change
  const handleChange = (fieldName, value) => {
    const field = fields.find(f => f.name === fieldName);
    
    setFormData((prev) => {
      let updatedData = {
        ...prev,
        [fieldName]: value,
      };

      // Clear dependent fields when their dependency changes
      fields.forEach((field) => {
        if (
          field.dependsOn &&
          field.dependsOn.field === fieldName &&
          prev[field.name]
        ) {
          // Clear the dependent field value when its dependency changes
          updatedData[field.name] = '';
        }
      });

      // Call the onChange callback if provided and use returned data if available
      if (onFormDataChange && field) {
        const callbackResult = onFormDataChange(updatedData, field);
        if (callbackResult && typeof callbackResult === 'object') {
          updatedData = callbackResult;
        }
      }

      return updatedData;
    });

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Clear errors for dependent fields that were cleared
    fields.forEach((field) => {
      if (
        field.dependsOn &&
        field.dependsOn.field === fieldName &&
        errors[field.name]
      ) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field.name];
          return newErrors;
        });
      }
    });
  };

  // Handle field blur
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    validateField(fieldName, formData[fieldName]);
  };

  // Validate a single field
  const validateField = async (fieldName, value) => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return true;

    let error = '';

    // Yup field-level validation (takes priority when schema provided)
    if (validationSchema) {
      try {
        await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
      } catch (yupError) {
        error = yupError.message;
      }
    } else {
      // Special handling for allocation-consignment-selector
      if (field.type === 'allocation-consignment-selector') {
        if (field.required) {
          if (!formData.allocationId) {
            error = 'Please select an allocation';
          } else if (!formData.selectedAssets || formData.selectedAssets.length === 0) {
            error = 'Please select at least one asset';
          }
        }
      } else {
        // Required validation for other field types
        if (field.required) {
          const isEmpty =
            field.type === 'file'
              ? !value || (value instanceof FileList ? value.length === 0 : !value)
              : !value || value.toString().trim() === '';
          if (isEmpty) {
            error = `${field.label} is required`;
          }
        }
      }

      // Custom validation
      if (!error && field.validation && typeof field.validation === 'function') {
        const customError = field.validation(value, formData);
        if (customError) {
          error = customError;
        }
      }
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
      return false;
    }

    // Clear error for this field if validation passed
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    return true;
  };

  // Validate all fields
  const validateForm = async () => {
    const newErrors = {};
    let isValid = true;

    // Yup schema-level validation
    if (validationSchema) {
      try {
        await validationSchema.validate(formData, { abortEarly: false });
      } catch (yupError) {
        if (yupError.inner && yupError.inner.length > 0) {
          yupError.inner.forEach((err) => {
            if (!newErrors[err.path]) {
              newErrors[err.path] = err.message;
            }
          });
        } else {
          // Single error (abortEarly: true fallback)
          newErrors[yupError.path] = yupError.message;
        }
        isValid = false;
      }
      setErrors(newErrors);
      return isValid;
    }

    // Built-in field-level validation (no Yup schema)
    fields.forEach((field) => {
      const value = formData[field.name];

      // Special handling for allocation-consignment-selector
      if (field.type === 'allocation-consignment-selector') {
        if (field.required) {
          if (!formData.allocationId) {
            newErrors[field.name] = 'Please select an allocation';
            isValid = false;
          } else if (!formData.selectedAssets || formData.selectedAssets.length === 0) {
            newErrors[field.name] = 'Please select at least one asset';
            isValid = false;
          }
        }
      } else {
        // Required validation for other field types
        if (field.required) {
          const isEmpty =
            field.type === 'file'
              ? !value || (value instanceof FileList ? value.length === 0 : !value)
              : !value || value.toString().trim() === '';
          if (isEmpty) {
            newErrors[field.name] = `${field.label} is required`;
            isValid = false;
          }
        }
      }

      // Custom validation
      if (
        !newErrors[field.name] &&
        field.validation &&
        typeof field.validation === 'function'
      ) {
        const customError = field.validation(value, formData);
        if (customError) {
          newErrors[field.name] = customError;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Get active filters from filter-group field
  const getActiveFilters = () => {
    return filters;
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Update formData with filter values for dependent fields
    const filterGroupField = fields.find(f => f.type === 'filter-group');
    if (filterGroupField) {
      const updatedFormData = { ...formData };
      
      // Apply new filter values
      Object.entries(newFilters).forEach(([key, value]) => {
        updatedFormData[key] = value;
      });
      
      // Clear removed filters
      filterGroupField.filterKeys?.forEach(key => {
        if (!newFilters[key]) {
          updatedFormData[key] = '';
        }
      });
      
      setFormData(updatedFormData);
      
      // Trigger form data change callback
      if (onFormDataChange) {
        const field = fields.find(f => f.type === 'filter-group');
        if (field) {
          onFormDataChange(updatedFormData, field);
        }
      }
    }
  };

  // Handle removing a filter
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    handleFilterChange(newFilters);
  };

  // Get category name for filter display
  const getCategoryName = (filterKey) => {
    const categoryNames = {
      campus: 'Campus',
      status: 'Status',
    };
    return categoryNames[filterKey] || filterKey;
  };

  // Get filter label for display
  const getFilterLabel = (filterKey, value) => {
    const filterGroupField = fields.find(f => f.type === 'filter-group');
    if (!filterGroupField) return value;
    
    if (filterKey === 'campus' && filterGroupField.campusOptions) {
      const option = filterGroupField.campusOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    if (filterKey === 'status' && filterGroupField.statusOptions) {
      const option = filterGroupField.statusOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    return value;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    fields.forEach((field) => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate form (async to support Yup)
    const isValid = await validateForm();
    if (isValid) {
      try {
        await onSubmit(formData);
      } catch {
        // errors are handled by the caller's onError callback
      }
    }
  };

  // Render input field based on type
  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = touched[field.name] && errors[field.name];

    const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
      error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;

    switch (field.type) {
      case 'allocation-consignment-selector':
        return (
          <AllocationConsignmentSelector
            value={value || {}}
            onChange={(newValue) => {
              handleChange(field.name, newValue);
              // Also update allocationId and selectedAssets in form data
              setFormData(prev => ({
                ...prev,
                allocationId: newValue.allocationId || '',
                selectedAssets: newValue.selectedAssets || [],
                allocationDetails: newValue.allocationDetails || null,
              }));
            }}
            apiUrl={field.apiUrl}
            queryKey={field.queryKey}
            filterStatus={field.filterStatus}
            lockAllocationSelection={field.lockAllocationSelection}
            lockedAllocationId={field.lockedAllocationId}
            lockedAllocationData={field.lockedAllocationData}
            isDisabled={isSubmitting}
          />
        );
      
      case 'filter-group':
        return (
          <FilterDropdown
            campusOptions={field.campusOptions || []}
            statusOptions={field.statusOptions || []}
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
          />
        );
      
      case 'filter-toggle':
        const isFilterEnabled = formData[field.name] || false;
        const filterField = field.filterField;
        const filterValue = formData[filterField.name] || '';
        const filterError = touched[filterField.name] && errors[filterField.name];
        
        return (
          <div className="space-y-2">
            {/* Radio button to enable filter */}
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id={field.name}
                name="filter-group"
                checked={isFilterEnabled}
                onChange={() => {
                  handleChange(field.name, !isFilterEnabled);
                  if (!isFilterEnabled) {
                    // Clear the filter value when disabling
                    handleChange(filterField.name, '');
                  }
                }}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {field.label}
              </label>
            </div>
            
            {/* Show filter field when enabled */}
            {isFilterEnabled && (
              <div className="ml-7">
                {filterField.type === 'api-autocomplete' ? (
                  <ApiAutocomplete
                    key={`${filterField.name}-${isFilterEnabled}`}
                    apiUrl={filterField.apiUrl}
                    queryKey={filterField.queryKey}
                    labelKey={filterField.labelKey}
                    valueKey={filterField.valueKey}
                    placeholder={filterField.placeholder}
                    value={filterValue}
                    onChange={(newValue) => handleChange(filterField.name, newValue)}
                    onBlur={() => handleBlur(filterField.name)}
                    error={filterError}
                    disabled={isSubmitting}
                  />
                ) : filterField.type === 'date' ? (
                  <input
                    type="date"
                    id={filterField.name}
                    name={filterField.name}
                    value={filterValue}
                    onChange={(e) => handleChange(filterField.name, e.target.value)}
                    onBlur={() => handleBlur(filterField.name)}
                    placeholder={filterField.placeholder}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      filterError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                ) : null}
                {filterError && (
                  <p className="mt-1 text-sm text-red-600">{filterError}</p>
                )}
              </div>
            )}
          </div>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={!!formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              onBlur={() => handleBlur(field.name)}
              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
              disabled={field.disabled || isSubmitting}
            />
            <span className="text-sm text-gray-700 leading-relaxed">{field.label}</span>
          </label>
        );

      case 'radio':
        return (
          <div className={field.layout === 'vertical' ? 'flex flex-col gap-3' : 'flex items-center gap-6'}>
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(field.name, option.value)}
                  onBlur={() => handleBlur(field.name)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  disabled={field.disabled || isSubmitting}
                />
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'date': {
        return (
          <CustomDatePicker
            name={field.name}
            selected={parseDateValue(value)}
            onChange={(date) => {
              handleChange(field.name, formatDateValue(date));
            }}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            hasError={!!error}
            disabled={field.disabled || isSubmitting}
            minDate={field.minDate}
            maxDate={field.maxDate}
          />
        );
      }
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled={field.disabled || isSubmitting}
            readOnly={field.readOnly}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            className={baseInputClasses}
            disabled={field.disabled || isSubmitting}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              id={field.name}
              name={field.name}
              accept={field.accept || 'image/*,application/pdf'}
              multiple={field.multiple || false}
              onChange={(e) => handleChange(field.name, field.multiple ? e.target.files : e.target.files[0])}
              onBlur={() => handleBlur(field.name)}
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
              disabled={field.disabled || isSubmitting}
            />
            {field.hint && (
              <p className="text-xs text-gray-500">{field.hint}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            className={baseInputClasses}
            disabled={field.disabled || isSubmitting}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={baseInputClasses}
            disabled={field.disabled || isSubmitting}
          />
        );

      case 'api-autocomplete':
        // Build additional params if field has a function to build them
        let additionalParams = null;
        if (field.buildAdditionalParams && typeof field.buildAdditionalParams === 'function') {
          additionalParams = field.buildAdditionalParams(formData, componentData);
        } else if (field.additionalParams) {
          additionalParams = field.additionalParams;
        }
        
        // Get dependent value if field depends on another field
        const dependentValue = field.dependsOn?.field 
          ? formData[field.dependsOn.field] 
          : null;
        
        // Check if field should be disabled based on missing dependencies
        let isFieldDisabled = field.disabled || isSubmitting;
        if (field.buildAdditionalParams && typeof field.buildAdditionalParams === 'function') {
          // If field requires componentData but it's not available, disable it
          if (!componentData || !additionalParams) {
            isFieldDisabled = true;
          }
        }
        if (field.dependsOn && !dependentValue) {
          isFieldDisabled = true;
        }
        
        // Create a unique key that includes dependentValue to force remount when dependency changes
        const autocompleteKey = field.dependsOn 
          ? `${field.name}-${dependentValue || 'empty'}` 
          : field.name;

        return (
          <ApiAutocomplete
            key={autocompleteKey}
            name={field.name}
            label={field.label}
            placeholder={isFieldDisabled && field.dependsOn ? `Please select ${field.dependsOn.field?.replace('Id', '')} first` : field.placeholder}
            apiUrl={field.apiUrl}
            queryKey={field.queryKey}
            value={value}
            onChange={(event) => handleChange(field.name, event.target.value)}
            onItemSelect={
              field.companionFields
                ? (item) => field.companionFields.forEach(({ field: targetField, key, compute }) =>
                    handleChange(targetField, compute ? compute(item) : (item[key] || '')))
                : field.companionField
                ? (item) => handleChange(field.companionField, item[field.companionKey] || '')
                : null
            }
            onBlur={() => handleBlur(field.name)}
            isInvalid={!!error}
            errorMessage={error || ''}
            isRequired={field.required}
            isDisabled={isFieldDisabled}
            labelKey={field.labelKey || 'name'}
            valueKey={field.valueKey || 'id'}
            filterCategory={field.filterCategory}
            dependsOn={field.dependsOn}
            dependentValue={dependentValue}
            additionalParams={additionalParams}
            dataPath={field.dataPath}
            formatLabel={field.formatLabel}
            selectedItem={field.selectedItem}
            staticItems={field.staticItems || null}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={actionType} size={size}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Help Text or Component Name Display */}
        {helpText && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <p className="text-sm text-blue-800">
              {helpText}
            </p>
          </div>
        )}
        
        {!helpText && componentName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-lg font-semibold text-gray-900">
              {componentName}
            </p>
          </div>
        )}

        {/* Active Filters Display - Bubble/Chip Style */}
        {Object.keys(getActiveFilters()).length > 0 && (
          <ActiveFiltersChips
            filters={filters}
            getCategoryName={getCategoryName}
            getFilterLabel={getFilterLabel}
            onRemoveFilter={handleRemoveFilter}
          />
        )}

        {/* Dynamic Form Fields */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            // Check if this is the first non-filter field and if we have a filter-group
            const filterGroupField = fields.find(f => f.type === 'filter-group');
            const isFirstNonFilterField = field.type !== 'filter-group' && 
                                         !fields.slice(0, index).some(f => f.type !== 'filter-group');
            
            // If this is the first non-filter field and we have a filter group, render them side by side
            if (isFirstNonFilterField && filterGroupField) {
              return (
                <div key={`row-${field.name}`} className="flex gap-4 items-start">
                  {/* First Field - Reduced width */}
                  <div className="w-2/3">
                    {field.type !== 'api-autocomplete' && (
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                    )}
                    {renderField(field)}
                    {touched[field.name] && errors[field.name] && (
                      <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                    )}
                  </div>
                  
                  {/* Filter Group - Positioned to the right */}
                  <div className="ml-auto">
                    {renderField(filterGroupField)}
                  </div>
                </div>
              );
            }
            
            // Skip filter-group as it's already rendered above
            if (field.type === 'filter-group') {
              return null;
            }
            
            // Generic rowWith pairing — render this field + its paired field side by side
            if (field.rowWith) {
              const pairedField = fields.find(f => f.name === field.rowWith);
              if (pairedField) {
                return (
                  <div key={`row-${field.name}`} className="grid grid-cols-2 gap-4">
                    <div>
                      {field.type !== 'api-autocomplete' && (
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                      )}
                      {renderField(field)}
                      {touched[field.name] && errors[field.name] && (
                        <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                      )}
                    </div>
                    <div>
                      {pairedField.type !== 'api-autocomplete' && (
                        <label htmlFor={pairedField.name} className="block text-sm font-medium text-gray-700 mb-1">
                          {pairedField.label}
                          {pairedField.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                      )}
                      {renderField(pairedField)}
                      {touched[pairedField.name] && errors[pairedField.name] && (
                        <p className="mt-1 text-sm text-red-600">{errors[pairedField.name]}</p>
                      )}
                    </div>
                  </div>
                );
              }
            }

            // Skip fields that are already rendered as part of a rowWith pair
            if (field.pairedWith) {
              return null;
            }

            // Check if source and destination fields should be on the same row
            const sourceFieldIndex = fields.findIndex(f => f.name === 'source');
            const destinationField = fields.find(f => f.name === 'destination');
            const isSourceField = field.name === 'source';
            
            if (isSourceField && destinationField) {
              return (
                <div key={`row-${field.name}`} className="grid grid-cols-2 gap-4">
                  {/* Source Field */}
                  <div>
                    {field.type !== 'api-autocomplete' && (
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                    )}
                    {renderField(field)}
                    {touched[field.name] && errors[field.name] && (
                      <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                    )}
                  </div>
                  
                  {/* Destination Field */}
                  <div>
                    {destinationField.type !== 'api-autocomplete' && (
                      <label
                        htmlFor={destinationField.name}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {destinationField.label}
                        {destinationField.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                    )}
                    {renderField(destinationField)}
                    {touched[destinationField.name] && errors[destinationField.name] && (
                      <p className="mt-1 text-sm text-red-600">{errors[destinationField.name]}</p>
                    )}
                  </div>
                </div>
              );
            }
            
            // Skip destination field as it's already rendered above
            if (field.name === 'destination') {
              return null;
            }
            
            // showWhen conditional — hide field if condition not met
            if (field.showWhen && !field.showWhen(formData)) {
              return null;
            }

            // Regular field rendering
            return (
              <div key={field.name}>
                {field.type !== 'api-autocomplete' && field.type !== 'filter-toggle' && field.type !== 'filter-group' && field.type !== 'allocation-consignment-selector' && field.type !== 'checkbox' && (
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                )}
                {renderField(field)}
                {/* Show errors for all field types */}
                {touched[field.name] && errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <CustomButton
            text="Cancel"
            variant="secondary"
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
          />
          <CustomButton
            text={isSubmitting ? 'Submitting...' : 'Submit'}
            variant="primary"
            type="submit"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
}