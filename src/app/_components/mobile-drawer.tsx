"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function MobileDrawer({
  open,
  onOpenChange,
  children,
  title,
  description,
}: MobileSheetProps) {
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  // Ensure component is mounted before rendering portal
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const updateViewportHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(height);
    };

    if (open) {
      updateViewportHeight();

      // Prevent body scroll when sheet is open
      document.body.style.overflow = "hidden";

      // Listen for viewport changes (keyboard)
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", updateViewportHeight);
      }
      window.addEventListener("resize", updateViewportHeight);

      return () => {
        document.body.style.overflow = "";
        if (window.visualViewport) {
          window.visualViewport.removeEventListener(
            "resize",
            updateViewportHeight,
          );
        }
        window.removeEventListener("resize", updateViewportHeight);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onOpenChange]);

  // Calculate sheet height based on viewport
  const sheetHeight =
    viewportHeight > 0 ? `${viewportHeight - 12}px` : "calc(100dvh - 12px)";

  if (!mounted || !open) return null;

  const sheetContent = (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="bg-background animate-in slide-in-from-bottom fixed inset-x-0 bottom-0 z-50 flex flex-col shadow-lg duration-200"
        style={{
          height: sheetHeight,
          maxHeight: sheetHeight,
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex-1">
            {title && (
              <h2 className="text-left text-lg font-semibold">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground mt-1 text-left text-sm">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}
