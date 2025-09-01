"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
          className="border-input bg-background w-14 rounded-md border px-1 py-1 text-center"
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
