import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Customer } from "@/hooks/use-income-data";

interface IncomeCustomerSelectorProps {
  customers: Customer[];
  customerId: string;
  onCustomerIdChange: (value: string) => void;
  onCustomerCreate: (name: string) => Promise<Customer | null>;
  disabled?: boolean;
}

export function IncomeCustomerSelector({
  customers,
  customerId,
  onCustomerIdChange,
  onCustomerCreate,
  disabled = false,
}: IncomeCustomerSelectorProps) {
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  const handleCustomerSelect = (val: string) => {
    if (val === "__new__") {
      setAddCustomerOpen(true);
      return;
    }
    onCustomerIdChange(val);
  };

  const handleCreateCustomer = async () => {
    const name = newCustomerName.trim();
    if (!name) return;

    const created = await onCustomerCreate(name);
    if (created) {
      onCustomerIdChange(String(created.id));
      setNewCustomerName("");
      setAddCustomerOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">Cliente</Label>
      <Select
        key={customerId ? "has-value" : "no-value"}
        value={customerId && customerId.length > 0 ? customerId : undefined}
        onValueChange={handleCustomerSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__new__">Novo Cliente</SelectItem>
          {customers.map((c) => {
            return (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription className="hidden" aria-hidden="true" />
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="newCustomerName">Nome</Label>
            <Input
              id="newCustomerName"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleCreateCustomer}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
