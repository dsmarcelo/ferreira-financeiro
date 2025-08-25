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
  // Track the current numeric value for the hidden input
  const [currentValue, setCurrentValue] = React.useState<number | undefined>(
    value ?? initialValue,
  );

  // Handler for value change from react-currency-mask
  function handleChangeValue(
    _event: React.ChangeEvent<HTMLInputElement>,
    originalValue: number | string,
  ) {
    // Always convert to number if possible, otherwise undefined
    const numericValue =
      typeof originalValue === "number" ? originalValue : Number(originalValue);
    const finalValue = isNaN(numericValue) ? undefined : numericValue;

    setCurrentValue(finalValue);
    onValueChange?.(finalValue);
  }

  return (
    <>
      {/* Hidden input with the raw numeric value for form submission */}
      <input type="hidden" name={name} value={currentValue ?? ""} />
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
            // Change name to avoid conflict with hidden input
            name={`${name}-formatted`}
            placeholder={placeholder ?? "R$ 0,00"}
            className={cn(
              "border-input shadow-xs focus-visible:border-primary bg-background placeholder:text-muted-foreground h-9 w-full rounded-md border px-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
    </>
  );
}
