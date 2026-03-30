'use client';

import React, { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

const CustomDatePicker = ({
  selected,
  onChange,
  onBlur,
  name,
  placeholder,
  hasError,
  disabled,
  minDate,
  maxDate,
  ...props
}) => {
  const datepickerRef = useRef(null);
  const [validationError, setValidationError] = useState('');

  const openDatePicker = () => {
    if (datepickerRef.current) {
      datepickerRef.current.setOpen(true);
    }
  };

  const formatInputValue = (rawValue = '') => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    const parts = [];
    if (day) parts.push(day);
    if (month) parts.push(month);
    if (year) parts.push(year);
    return { formatted: parts.join('-'), day, month, year };
  };

  const isCompleteAndValid = (dayStr, monthStr, yearStr) => {
    if (dayStr.length !== 2 || monthStr.length !== 2 || yearStr.length !== 4) {
      return false;
    }

    const dayNum = Number(dayStr);
    const monthNum = Number(monthStr);
    const yearNum = Number(yearStr);

    if (
      Number.isNaN(dayNum) ||
      Number.isNaN(monthNum) ||
      Number.isNaN(yearNum) ||
      yearNum < 1500 ||
      yearNum > 3000 ||
      monthNum < 1 ||
      monthNum > 12 ||
      dayNum < 1 ||
      dayNum > 31
    ) {
      return false;
    }

    const candidate = new Date(yearNum, monthNum - 1, dayNum);
    return (
      candidate.getFullYear() === yearNum &&
      candidate.getMonth() === monthNum - 1 &&
      candidate.getDate() === dayNum
    );
  };

  const handleRawChange = (event) => {
    const { formatted, day, month, year } = formatInputValue(event.target.value);

    event.target.value = formatted;

    if (formatted.length === 10 && isCompleteAndValid(day, month, year)) {
      setValidationError('');
      onChange?.(new Date(Number(year), Number(month) - 1, Number(day)));
    } else if (formatted.length === 10) {
      setValidationError('Date must be between 01-31, month 01-12, year 1500-3000');
    }
  };

  const handleChange = (date) => {
    setValidationError('');
    onChange?.(date);
  };

  const handleKeyDown = (event) => {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
    ];

    if (allowedKeys.includes(event.key)) return;
    if (event.key === '-') {
      event.preventDefault();
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  };

  return (
    <>
      <div className="relative w-full border border-gray-300 rounded-lg">
      <DatePicker
        ref={datepickerRef}
        name={name}
        selected={selected}
        onChange={handleChange}
        onBlur={onBlur}
        onChangeRaw={handleRawChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        className={`w-full pl-2 pr-100 py-[0.600rem] text-sm rounded-lg  ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        dateFormat="dd-MM-yyyy"
        inputMode="numeric"
        pattern="[0-9]{2}-[0-9]{2}-[0-9]{4}"
        maxLength={10}
        onClickOutside={() => datepickerRef.current.setOpen(false)}
        {...props}
      />
      
      <div
        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        onClick={openDatePicker}
      >
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>
    </div>
    {validationError && (
        <p className="mt-1 text-xs text-red-600">{validationError}</p>
      )}
    </>
  );
};

export default CustomDatePicker;