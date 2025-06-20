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
        window.visualViewport.addEventListener('resize', updateViewportHeight);
        window.visualViewport.addEventListener('scroll', updateViewportHeight);
      } else {
        window.addEventListener('resize', updateViewportHeight);
      }

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updateViewportHeight);
          window.visualViewport.removeEventListener('scroll', updateViewportHeight);
        } else {
          window.removeEventListener('resize', updateViewportHeight);
        }
      };
    }
  }, [open]);

  // Calculate max height based on available viewport
  const maxHeight = viewportHeight > 0
    ? Math.max(viewportHeight - 40, 250) // Leave 40px padding, minimum 250px
    : "80vh"; // Fallback to 80vh

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="overflow-hidden"
        style={{
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }}
      >
        {/* Header */}
        {(title ?? description) && (
          <DrawerHeader className="flex-shrink-0">
            {title && (
              <DrawerTitle className="text-left">{title}</DrawerTitle>
            )}
            {description && (
              <DrawerDescription className="text-left">{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}