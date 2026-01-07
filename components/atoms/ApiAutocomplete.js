'use client';

import React from 'react';
import {
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem
} from "@heroui/autocomplete";
import useFetch from '@/app/hooks/query/useFetch';

export default function ApiAutocomplete({
  name,
  label,
  placeholder,
  apiUrl,
  queryKey,
  value,
  onChange,
  onBlur,
  isInvalid,
  errorMessage,
  isRequired = false,
  isDisabled = false,
  labelKey = 'name',
  valueKey = 'id',
  dependsOn = null,
  dependentValue = null,
}) {
  // Build the API URL with dependent value if exists (append to path)
  const finalApiUrl = dependsOn && dependentValue
    ? `${apiUrl}/${dependentValue}`
    : apiUrl;

  // Include dependent value in queryKey to refetch when it changes
  const finalQueryKey = dependsOn && dependentValue
    ? [...(queryKey || [name]), dependentValue]
    : queryKey || [name];

  const { data, isLoading, isError } = useFetch({
    url: finalApiUrl,
    queryKey: finalQueryKey,
    enabled: !dependsOn || !!dependentValue, // Only fetch if no dependency or dependent value exists
  });

  const items = data?.data || [];

  return ( 

    <>
    <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
    <div
      className={`border rounded-lg api-autocomplete-wrapper ${
        isInvalid ? 'border-red-500' : 'border-gray-300'
      }`}
    >
    
      <Autocomplete
      name={name}
      placeholder={placeholder}
      isRequired={isRequired}
      isDisabled={isDisabled || isLoading}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      defaultItems={items}
      selectedKey={value || null}
      onSelectionChange={(key) => {
        onChange({ target: { name, value: key } });
      }}
      onBlur={onBlur}
      isLoading={isLoading}
      radius="lg"
      classNames={{
        base: "w-full",
        inputWrapper: "border-0 hover:border-0 focus-within:!border-0 shadow-none bg-white",
        input: "text-gray-900",
      }}
      listboxProps={{
        itemClasses: {
          base: "text-gray-900 data-[hover=true]:bg-gray-100 data-[selected=true]:bg-blue-50",
        },
      }}
      popoverProps={{
        classNames: {
          content: "bg-white border border-gray-200 rounded-lg",
        },
      }}
    >
      {(item) => (
        <AutocompleteItem key={item[valueKey]}>
          {item[labelKey]}
        </AutocompleteItem>
      )}
    </Autocomplete>
    </div>
    </>
  );
}
