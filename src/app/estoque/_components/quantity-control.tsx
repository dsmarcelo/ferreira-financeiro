"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  showSubmit?: boolean;
  onSubmit?: () => void;
}

export default function QuantityControl({
  value,
  onChange,
  label,
  showSubmit,
  onSubmit,
}: QuantityControlProps) {
  const [text, setText] = useState<string>(String(value ?? 0));

  // Keep local text in sync with external value changes
  useEffect(() => {
    setText(String(value ?? 0));
  }, [value]);

  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      <div className="flex w-full items-center gap-1">
        {/* Commented out decrement button - was only shown when focused */}
        {/* <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onDelta(-1)}
        >
          -
        </Button> */}

        {/* TODO: Make this the same as in the product sale editor */}
        <Input
          type="text"
          inputMode="decimal"
          min="0"
          value={text}
          onBlur={() => {
            const num = Number.parseFloat(text);
            if (Number.isFinite(num) && num >= 0) {
              onChange(num);
              setText(String(num));
            } else {
              onChange(0);
              setText("0");
            }
          }}
          onChange={(e) => {
            let inputValue = e.target.value;
            // Allow only digits and a single dot
            if (!/^[0-9]*\.?[0-9]*$/.test(inputValue)) {
              return; // ignore invalid keystrokes
            }
            // Remove leading zeros if not a decimal (e.g., "01" -> "1"), keep "0.xxx"
            if (
              inputValue.length > 1 &&
              inputValue.startsWith("0") &&
              !inputValue.startsWith("0.")
            ) {
              inputValue = inputValue.replace(/^0+/, "");
              if (inputValue === "") inputValue = "0";
            }
            setText(inputValue);
            const parsed = Number.parseFloat(inputValue);
            if (Number.isFinite(parsed)) {
              onChange(parsed);
            } else if (inputValue === "" || inputValue === ".") {
              // treat empty or "." as 0 while typing
              onChange(0);
            }
          }}
          className="border-input bg-background min-w-12 rounded-md border px-1 py-1 text-center text-sm"
        />

        {showSubmit && onSubmit && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onSubmit}
            className="h-9 w-9"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}

        {/* Commented out increment button - was only shown when focused */}
        {/* <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onDelta(1)}
        >
          +
        </Button> */}
      </div>
    </div>
  );
}
