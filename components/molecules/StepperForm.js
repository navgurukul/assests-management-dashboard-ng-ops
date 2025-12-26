'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@nextui-org/react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import FormField from './FormField';

export default function StepperForm({
  steps,
  initialValues,
  validationSchema,
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const handleNext = (formikProps) => {
    // Validate current step fields
    const currentStepFields = steps[currentStep].fields.map(f => f.name);
    const stepErrors = Object.keys(formikProps.errors).filter(key =>
      currentStepFields.includes(key)
    );

    // Touch all fields in current step to show errors
    const touchedFields = {};
    currentStepFields.forEach(field => {
      touchedFields[field] = true;
    });
    formikProps.setTouched({ ...formikProps.touched, ...touchedFields });

    // If no errors in current step, proceed
    if (stepErrors.length === 0) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex, formikProps) => {
    // Allow navigation to completed steps or previous steps
    if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const isStepCompleted = (stepIndex) => completedSteps.has(stepIndex);
  const isStepActive = (stepIndex) => stepIndex === currentStep;
  const isStepAccessible = (stepIndex) => stepIndex <= currentStep || completedSteps.has(stepIndex);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="space-y-6">
          {/* Stepper Header */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`flex flex-col items-center flex-1 ${
                      isStepAccessible(index) ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onClick={() => handleStepClick(index, formikProps)}
                  >
                    {/* Step Circle */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                        ${
                          isStepCompleted(index)
                            ? 'bg-green-500 text-white'
                            : isStepActive(index)
                            ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                            : isStepAccessible(index)
                            ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                            : 'bg-gray-200 text-gray-400'
                        }
                      `}
                    >
                      {isStepCompleted(index) ? (
                        <Check size={20} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <div className="mt-2 text-center max-w-[120px]">
                      <p
                        className={`text-xs font-medium ${
                          isStepActive(index)
                            ? 'text-blue-600'
                            : isStepCompleted(index)
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-[2px] mx-2 mb-8">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isStepCompleted(index)
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {steps[currentStep].label}
            </h3>
            {steps[currentStep].description && (
              <p className="text-sm text-gray-600 mb-6">
                {steps[currentStep].description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps[currentStep].fields.map((field) => {
                // Handle conditional fields (showIf)
                if (field.showIf) {
                  const { field: conditionField, value: conditionValue } = field.showIf;
                  if (formikProps.values[conditionField] !== conditionValue) {
                    return null;
                  }
                }

                return (
                  <div
                    key={field.name}
                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                  >
                    <FormField field={field} formik={formikProps} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              {currentStep > 0 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="flat"
                  color="default"
                  startContent={<ChevronLeft size={18} />}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onCancel}
                variant="light"
                color="danger"
              >
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => handleNext(formikProps)}
                  color="primary"
                  endContent={<ChevronRight size={18} />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  color="success"
                  isLoading={isSubmitting}
                  endContent={!isSubmitting && <Check size={18} />}
                >
                  {isSubmitting ? 'Creating...' : 'Create Component'}
                </Button>
              )}
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
