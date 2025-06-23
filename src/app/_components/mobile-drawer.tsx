"use client";
import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface MobileDrawerProps {
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
}: MobileDrawerProps) {
  const [viewportHeight, setViewportHeight] = React.useState(0);

  React.useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport if available, otherwise fallback to window.innerHeight
      const height = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(height);
    };

    if (open) {
      updateViewportHeight();

      // Listen for viewport changes
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", updateViewportHeight);
        window.visualViewport.addEventListener("scroll", updateViewportHeight);
      } else {
        window.addEventListener("resize", updateViewportHeight);
      }

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener(
            "resize",
            updateViewportHeight,
          );
          window.visualViewport.removeEventListener(
            "scroll",
            updateViewportHeight,
          );
        } else {
          window.removeEventListener("resize", updateViewportHeight);
        }
      };
    }
  }, [open]);

  // Calculate max height based on available viewport
  const maxHeight =
    viewportHeight > 0
      ? Math.max(viewportHeight - 12, 250) // Leave 12px padding, minimum 250px
      : "98dvh"; // Fallback to 98dvh

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="overflow-hidden"
        style={{
          top: "12px",
          maxHeight: "calc(100dvh - 12px)",
        }}
      >
        {/* Header */}
        {(title ?? description) && (
          <DrawerHeader className="flex-shrink-0 pb-1">
            {title && <DrawerTitle className="text-left">{title}</DrawerTitle>}
            {description && (
              <DrawerDescription className="text-left">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        )}

        {/* Scrollable content area */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
