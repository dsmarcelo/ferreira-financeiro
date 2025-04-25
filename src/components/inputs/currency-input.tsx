"use client";
import React from "react";
import { CurrencyInput as RCCurrencyInput } from "react-currency-mask";

import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  onValueChange?: (value: number | undefined) => void;
  initialValue?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  value?: number;
}

export default function CurrencyInput({
  name,
  onValueChange,
  initialValue,
  placeholder,
  className,
  disabled,
  min,
  max,
  value,
}: CurrencyInputProps) {
  // Handler for value change from react-currency-mask
  function handleChangeValue(
    _event: React.ChangeEvent<HTMLInputElement>,
    originalValue: number | string,
  ) {
    // Always convert to number if possible, otherwise undefined
    const numericValue =
      typeof originalValue === "number" ? originalValue : Number(originalValue);
    onValueChange?.(isNaN(numericValue) ? undefined : numericValue);
  }

  return (
    <RCCurrencyInput
      value={value}
      defaultValue={initialValue}
      onChangeValue={handleChangeValue}
      currency="BRL"
      locale="pt-BR"
      hideSymbol={false}
      // Use InputElement to pass a custom input with our styling and attributes
      InputElement={
        <input
          name={name}
          placeholder={placeholder ?? "R$ 0,00"}
          className={cn(
            "border-input focus-visible:border-primary bg-background placeholder:text-muted-foreground h-9 w-full rounded-md border px-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          disabled={disabled}
          min={min}
          max={max}
          inputMode="numeric"
          type="text"
        />
      }
    />
  );
}
