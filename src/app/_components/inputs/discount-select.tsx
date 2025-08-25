"use client";

/**
 * DiscountSelect Component
 *
 * A flexible discount input component that allows users to choose between
 * percentage-based or fixed value discounts.
 *
 * Features:
 * - Select dropdown to choose discount type (percentage or fixed)
 * - Conditional input rendering based on selected type
 * - Percentage input with % symbol display
 * - Fixed value input using the CurrencyInput component
 * - Form integration with hidden inputs for both type and value
 *
 * Usage example:
 * ```tsx
 * <DiscountSelect
 *   name="discount"
 *   discountType="percentage"
 *   onDiscountTypeChange={(type) => console.log('Type changed:', type)}
 *   value={10}
 *   onValueChange={(value) => console.log('Value changed:', value)}
 *   placeholder="Enter discount"
 *   label="Discount Amount"
 * />
 * ```
 *
 * Form submission will include:
 * - discount-type: "percentage" or "fixed"
 * - discount-value: the numeric value
 */

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CurrencyInput from "@/components/inputs/currency-input";
import { cn } from "@/lib/utils";

export type DiscountType = "percentage" | "fixed";

interface DiscountSelectProps {
  name: string;
  discountType?: DiscountType;
  onDiscountTypeChange?: (type: DiscountType) => void;
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
}

export default function DiscountSelect({
  name,
  discountType = "percentage",
  onDiscountTypeChange,
  value,
  onValueChange,
  placeholder,
  className,
  disabled,
  min,
  max,
  showLabel = true,
  label = "Desconto",
}: DiscountSelectProps) {
  const handleTypeChange = (value: string) => {
    const newType = value as DiscountType;
    onDiscountTypeChange?.(newType);
  };

  const renderInput = () => {
    if (discountType === "fixed") {
      return (
        <CurrencyInput
          name={`${name}-value`}
          value={value}
          onValueChange={onValueChange}
          placeholder={placeholder ?? "R$ 0,00"}
          className={className}
          disabled={disabled}
          min={min ?? 0}
          max={max}
        />
      );
    }

    return (
      <Input
        name={`${name}-value`}
        type="number"
        inputMode="numeric"
        placeholder={placeholder ?? "0"}
        className={cn("", className)}
        disabled={disabled}
        min={min ?? 0}
        max={max ?? 100}
        value={value ?? ""}
        onChange={(e) => {
          const numericValue =
            e.target.value === "" ? undefined : Number(e.target.value);
          onValueChange?.(numericValue);
        }}
        step="0.01"
      />
    );
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      )}

      <div className="flex gap-3">
        <Select
          value={discountType}
          onValueChange={handleTypeChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
            <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          {renderInput()}
          {discountType === "percentage" && (
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
              %
            </span>
          )}
        </div>
      </div>

      {/* Hidden input to store the discount type for form submission */}
      <input type="hidden" name={`${name}-type`} value={discountType} />
    </div>
  );
}
