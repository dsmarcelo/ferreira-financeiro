"use client";
import * as React from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MobileDrawer } from "./mobile-drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveSheetProps {
  triggerButton: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  description?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxWidth?: string;
  _enableMobileKeyboardHandling?: boolean;
}

export default function ResponsiveSheet({
  triggerButton,
  children,
  title,
  description,
  isOpen,
  onOpenChange,
  maxWidth = "sm:max-w-[600px]",
  _enableMobileKeyboardHandling = true,
}: ResponsiveSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch: render nothing until mounted
    return null;
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  const isSheetOpen = isOpen ?? open;

  if (isMobile) {
    return (
      <>
        <div onClick={() => handleOpenChange(true)}>
          {triggerButton}
        </div>
        <MobileDrawer
          open={isSheetOpen}
          onOpenChange={handleOpenChange}
          title={title}
          description={description}
        >
          {children}
        </MobileDrawer>
      </>
    );
  }

  // Desktop: use Drawer
  return (
    <Drawer open={isSheetOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent
        className={`${maxWidth} max-h-[90dvh] overflow-y-auto`}
      >
        <DrawerHeader className="sticky top-0 bg-background z-10 pb-4">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}