"use client";

import { useState } from "react";
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
import AddExpenseForm from "@/app/_components/forms/add-expense-form";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AddExpenseSheet({
  source,
}: {
  source: ExpenseInsert["source"];
}) {
  const [open, setOpen] = useState(false);
  // return (
  //   <Dialog open={open} onOpenChange={setOpen}>
  //     <DialogTrigger asChild>
  //       <Button className="rounded-full">Adicionar compra de produto</Button>
  //     </DialogTrigger>
  //     <DialogContent className="flex h-[90dvh] w-[800px] flex-col">
  //       <DialogHeader className="py-0">
  //         <DialogTitle>Adicionar Despesa</DialogTitle>
  //         <DialogDescription className="hidden" aria-hidden="true" />
  //       </DialogHeader>
  //       <AddExpenseForm source={source} onSuccess={() => setOpen(false)} />
  //       <DialogFooter>
  //         <DialogClose asChild>
  //           <Button variant="outline">Cancelar</Button>
  //         </DialogClose>
  //       </DialogFooter>
  //       <Button type="submit">Adicionar</Button>
  //     </DialogContent>
  //   </Dialog>
  // );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-full">Adicionar compra de produto</Button>
      </SheetTrigger>
      <SheetContent className="flex w-[800px] flex-col">
        <SheetHeader className="pb-0">
          <SheetTitle>Adicionar Despesa</SheetTitle>
          <SheetDescription className="hidden" aria-hidden="true" />
        </SheetHeader>
        <AddExpenseForm source={source} onSuccess={() => setOpen(false)} />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
        </SheetFooter>
        {/* <Button type="submit">Adicionar</Button> */}
      </SheetContent>
    </Sheet>
  );
}
