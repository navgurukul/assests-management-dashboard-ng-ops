'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomButton from '@/components/atoms/CustomButton';


export default function FormModal({
  isOpen,
  onClose,
  componentName = '',
  actionType = '',
  fields = [],
  onSubmit,
  size = 'medium',
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when modal opens or fields change
  useEffect(() => {
    if (isOpen) {
      const initialData = {};
      fields.forEach((field) => {
        initialData[field.name] = field.defaultValue || '';
      });
      setFormData(initialData);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, fields]);

  // Handle input change
  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
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
  const validateField = (fieldName, value) => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return true;

    let error = '';

    // Required validation
    if (field.required && (!value || value.toString().trim() === '')) {
      error = `${field.label} is required`;
    }

    // Custom validation
    if (!error && field.validation && typeof field.validation === 'function') {
      const customError = field.validation(value, formData);
      if (customError) {
        error = customError;
      }
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
      return false;
    }

    return true;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const value = formData[field.name];

      // Required validation
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
        isValid = false;
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    fields.forEach((field) => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (validateForm()) {
      onSubmit(formData);
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
      case 'text':
      case 'date':
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
          />
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

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={actionType} size={size}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Component Name Display */}
        {componentName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">
              Component Name
            </h4>
            <p className="text-lg font-semibold text-gray-900">
              {componentName}
            </p>
          </div>
        )}

        {/* Dynamic Form Fields */}
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
                {field.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              {renderField(field)}
              {touched[field.name] && errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
              )}
            </div>
          ))}
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
