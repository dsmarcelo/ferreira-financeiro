"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddIncomeForm from "@/app/_components/forms/add-income-form";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddIncomeSheet({
  buttonLabel = "Adicionar Receita",
  children,
}: {
  buttonLabel?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button className="rounded-full">{buttonLabel}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Entrada</DialogTitle>
          <DialogDescription className="hidden" aria-hidden="true" />
        </DialogHeader>
        <div className="py-4">
          <AddIncomeForm id="add-income-form" onSuccess={() => setOpen(false)} />
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="add-income-form">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
