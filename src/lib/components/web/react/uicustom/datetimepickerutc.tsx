"use client";

import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export interface DateTimePickerUTCProps extends Omit<React.ComponentPropsWithoutRef<typeof DatePicker>, 'selected' | 'onChange'> {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  timeZone?: string;
}

function toLocalDateForInput(date: Date | null): Date | null {
  if (!date) return null;
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
}

function toUTCDateFromLocal(date: Date | null): Date | null {
  if (!date) return null;
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ));
}

export function DateTimePickerUTC({ selected, onChange, timeZone, ...props }: DateTimePickerUTCProps) {
  const localDate = React.useMemo(() => toLocalDateForInput(selected), [selected]);

  const DatePickerComponent = DatePicker as unknown as React.ComponentType<any>;
  const handleChange = (date: Date | null) => {
    onChange(toUTCDateFromLocal(date));
  };

  return (
    <DatePickerComponent
      selected={localDate}
      onChange={handleChange}
      {...props}
    />
  );
}
