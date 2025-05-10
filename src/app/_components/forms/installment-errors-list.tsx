"use client";

import React from "react";
import type { InstallmentFieldErrors } from "@/actions/product-purchase-actions";

interface InstallmentErrorsListProps {
  errors: InstallmentFieldErrors[];
}

export function InstallmentErrorsList({ errors }: InstallmentErrorsListProps) {
  return (
    <div className="mt-2 space-y-1">
      {errors.map((instError, idx) => (
        <div key={idx} className="text-sm text-red-500" aria-live="polite">
          {Object.entries(instError).map(([field, messages]) =>
            messages?.map((msg, i) => (
              <div key={`${idx}-${field}-${i}`}>Parcela {idx + 1} – {field}: {msg}</div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
