"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

interface DeleteDialogProps {
  // The function to call when deletion is confirmed
  onConfirm: () => void;
  // Optional props
  triggerText?: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteDialog({
  onConfirm,
  triggerText,
  title = "Tem certeza?",
  description = "Esta ação não pode ser revertida.",
  confirmText = "Deletar",
  cancelText = "Cancelar",
}: DeleteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-red-500">
          {triggerText ?? <Trash2 className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">{cancelText}</Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
