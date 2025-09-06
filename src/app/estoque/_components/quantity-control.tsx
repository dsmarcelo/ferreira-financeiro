"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export default function QuantityControl({
  value,
  onChange,
  label,
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
      </div>
    </div>
  );
}
