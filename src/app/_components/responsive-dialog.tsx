"use client";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { useIsMobile } from "@/hooks/use-mobile";
// import { useMediaQuery } from "usehooks-ts";

export default function ResponsiveDialog({
  triggerButton,
  children,
  title,
  description,
  isOpen,
  onOpenChange,
  maxWidth = "sm:max-w-[425px]",
  enableMobileKeyboardHandling = true,
}: {
  triggerButton: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  description?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxWidth?: string;
  enableMobileKeyboardHandling?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { getMobileDialogHeight } = useViewportHeight();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // const isDesktop = useMediaQuery("(min-width: 640px)");
  const isDesktop = true;

  if (!mounted) {
    // Prevent hydration mismatch: render nothing until mounted
    return null;
  }

  if (isDesktop) {
    const mobileMaxHeight = enableMobileKeyboardHandling && isMobile ? getMobileDialogHeight() : undefined;

    return (
      <Dialog open={isOpen ?? open} onOpenChange={onOpenChange ?? setOpen}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent
          className={`${maxWidth} max-h-[90dvh] overflow-y-auto`}
          style={mobileMaxHeight ? { maxHeight: `${mobileMaxHeight}px` } : undefined}
        >
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen ?? open} onOpenChange={onOpenChange ?? setOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          {children}
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
