"use client";

import React from "react";

interface FieldErrorProps {
  messages?: string[];
}

export function FieldError({ messages }: FieldErrorProps) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="mt-1 text-sm text-red-500" aria-live="polite">
      {messages[0]}
    </p>
  );
}
