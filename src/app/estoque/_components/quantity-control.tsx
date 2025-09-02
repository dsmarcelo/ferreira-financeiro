"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  onDelta: (delta: number) => void;
  label: string;
}

export default function QuantityControl({
  value,
  onChange,
  onDelta,
  label,
}: QuantityControlProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState<string>(String(value ?? 0));

  // Keep local text in sync when not focused
  const displayValue = useMemo(() => {
    return isFocused ? text : String(value ?? 0);
  }, [isFocused, text, value]);

  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      <div className="flex w-full items-center gap-1">
        {isFocused && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onDelta(-1)}
          >
            -
          </Button>
        )}
        {/* TODO: Make this the same as in the product sale editor */}
        <Input
          type="text"
          inputMode="decimal"
          min="0"
          value={displayValue}
          onFocus={(e) => {
            setIsFocused(true);
            // If the value is "0", clear it for easier editing
            if (e.target.value === "0") {
              setText("");
            } else {
              setText(e.target.value);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
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
        {isFocused && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onDelta(1)}
          >
            +
          </Button>
        )}
      </div>
    </div>
  );
}
