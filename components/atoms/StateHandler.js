import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Loader.css';


export default function StateHandler({
  isLoading = false,
  isError = false,
  error = null,
  isEmpty = false,
  loadingMessage = 'Loading...',
  errorMessage = 'Error loading data',
  emptyMessage = 'No data found',
  icon: Icon = AlertCircle,
  className = 'h-64',
}) {
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="mt-2 text-red-600 font-medium">{errorMessage}</p>
          <p className="text-gray-600 mt-2">{error?.message || error || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  // Empty/Not found state
  if (isEmpty) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          {Icon && <Icon className="w-12 h-12 text-gray-400 mx-auto" />}
          <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return null;
}
