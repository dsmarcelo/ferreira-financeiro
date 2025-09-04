"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { type Product } from "@/hooks/use-sales-data";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  actionCreateProduct,
  actionUpdateProduct,
  type ActionResponse,
} from "@/actions/product-actions";
import { toast } from "sonner";
import { Box } from "lucide-react";

interface IncomeProductEditorProps {
  products: Product[];
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
  onChange: (
    next: Record<number, { quantity: number; unitPrice: number }>,
  ) => void;
  // For edit context: original quantities linked to this income, to allow
  // stock calculation as: available = stock + originalQty - selectedQty
  originalQuantities?: Record<number, number>;
}

export function SalesProductEditor({
  products,
  selectedProducts,
  onChange,
  originalQuantities,
}: IncomeProductEditorProps) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[] | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  // Local text state for quantity inputs to preserve decimals while typing
  const [qtyText, setQtyText] = useState<Record<number, string>>({});

  const [createState, createAction, creating] = useActionState<
    ActionResponse,
    FormData
  >(actionCreateProduct, { success: false, message: "" });
  const [updateState, updateAction, updating] = useActionState<
    ActionResponse,
    FormData
  >(actionUpdateProduct, { success: false, message: "" });

  const selectableProducts = useMemo(
    () => localProducts ?? products,
    [localProducts, products],
  );

  // Removed handleRemove; deletion is handled by setting quantity to 0

  const getAvailable = (productId: number): number => {
    const prod = selectableProducts.find((p) => p.id === productId);
    const stock = prod ? prod.quantity : 0;
    const originalQty = originalQuantities?.[productId] ?? 0;
    const selectedQty = selectedProducts[productId]?.quantity ?? 0;
    return stock + originalQty - selectedQty;
  };

  const ensureEntry = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    const defaultPrice = Number(product?.price ?? 0);
    const current = selectedProducts[productId];
    if (!current) {
      return { quantity: 0, unitPrice: defaultPrice };
    }
    return current;
  };

  const setQuantity = (productId: number, nextQtyRaw: number) => {
    const current = ensureEntry(productId);
    const maxAllowed = Math.max(
      0,
      (current.quantity ?? 0) + getAvailable(productId),
    );
    const nextQty = Math.max(0, Math.min(nextQtyRaw, maxAllowed));
    const next = { ...selectedProducts } as Record<
      number,
      { quantity: number; unitPrice: number }
    >;
    if (nextQty === 0) delete next[productId];
    else next[productId] = { ...current, quantity: nextQty };
    onChange(next);
  };

  const handleQtyChange = (productId: number, delta: number) => {
    const current = ensureEntry(productId);
    if (delta > 0 && getAvailable(productId) <= 0) return;
    setQuantity(productId, (current.quantity ?? 0) + delta);
  };

  const handlePriceChange = (productId: number, price: number | undefined) => {
    const entry = ensureEntry(productId);
    const next = { ...selectedProducts } as Record<
      number,
      { quantity: number; unitPrice: number }
    >;
    if (!entry || (entry?.quantity ?? 0) === 0) {
      // If price is changed before any quantity, start with qty 1 for convenience
      next[productId] = { quantity: 1, unitPrice: price ?? 0 };
    } else {
      next[productId] = { ...entry, unitPrice: price ?? 0 };
    }
    onChange(next);
  };

  // Handle product creation result
  useEffect(() => {
    if (!createState) return;
    if (createState.success) {
      toast.success(createState.message || "Produto criado");
      void (async () => {
        try {
          const res = await fetch("/api/produtos", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as Product[];
            setLocalProducts(data);
          }
        } catch {
          // ignore
        }
      })();
      setAddOpen(false);
    } else if (createState.message) {
      toast.error(createState.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createState.success, createState.message]);

  // Handle product update result
  useEffect(() => {
    if (!updateState) return;
    if (updateState.success) {
      toast.success(updateState.message || "Produto atualizado");
      void (async () => {
        try {
          const res = await fetch("/api/produtos", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as Product[];
            setLocalProducts(data);
          }
        } catch {
          // ignore
        }
      })();
      setEditOpen(false);
      setEditingProductId(null);
    } else if (updateState.message) {
      toast.error(updateState.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateState.success, updateState.message]);

  return (
    <div className="space-y-2">
      <Label className="sr-only">Produtos</Label>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-14 w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Box className="h-4 w-4" /> Produtos
            </span>
            <span className="text-muted-foreground text-xs">
              {
                Object.values(selectedProducts).filter(
                  (v) => (v?.quantity ?? 0) > 0,
                ).length
              }{" "}
              selecionado(s)
            </span>
          </Button>
        </DrawerTrigger>

        <DrawerContent className="mx-auto max-w-xl data-[vaul-drawer-direction=bottom]:max-h-[90dvh] data-[vaul-drawer-direction=top]:max-h-[90dvh]">
          <DrawerHeader className="flex flex-row items-center justify-between">
            <DrawerTitle>Produtos</DrawerTitle>
            <Button
              className="w-fit"
              type="button"
              variant="outline"
              onClick={() => setAddOpen(true)}
            >
              + Novo produto
            </Button>
          </DrawerHeader>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-1 gap-2">
              {selectableProducts.map((p) => {
                const entry = selectedProducts[p.id];
                const qty = entry?.quantity ?? 0;
                const availableRemaining = getAvailable(p.id);
                const maxAllowed = Math.max(
                  0,
                  qty + Math.max(0, availableRemaining),
                );
                return (
                  <div
                    key={p.id}
                    className={`flex items-start justify-between rounded-md border p-2 ${qty > 0 ? "bg-slate-50" : "bg-background"}`}
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{p.name}</p>
                        <span className="text-muted-foreground text-xs">
                          Em estoque: {p.quantity}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQtyChange(p.id, -1)}
                            aria-label="Diminuir"
                          >
                            -
                          </Button>
                          <Input
                            type="text"
                            inputMode="decimal"
                            min="0"
                            value={
                              Object.prototype.hasOwnProperty.call(
                                qtyText,
                                p.id,
                              )
                                ? qtyText[p.id]
                                : String(qty)
                            }
                            onFocus={(e) => {
                              const current = e.target.value;
                              setQtyText((prev) => ({
                                ...prev,
                                [p.id]: current === "0" ? "" : current,
                              }));
                            }}
                            onBlur={() => {
                              const raw = qtyText[p.id] ?? String(qty);
                              const num = Number.parseFloat(raw);
                              const clamped = Number.isFinite(num)
                                ? Math.max(0, Math.min(num, maxAllowed))
                                : 0;
                              setQuantity(p.id, clamped);
                              setQtyText((prev) => ({
                                ...prev,
                                [p.id]: String(clamped),
                              }));
                            }}
                            onChange={(e) => {
                              let inputValue = e.target.value;
                              // Allow only digits and a single dot
                              if (!/^[0-9]*\.?[0-9]*$/.test(inputValue)) {
                                return;
                              }
                              // Remove leading zeros if not a decimal (keep "0.xxx")
                              if (
                                inputValue.length > 1 &&
                                inputValue.startsWith("0") &&
                                !inputValue.startsWith("0.")
                              ) {
                                inputValue = inputValue.replace(/^0+/, "");
                                if (inputValue === "") inputValue = "0";
                              }
                              setQtyText((prev) => ({
                                ...prev,
                                [p.id]: inputValue,
                              }));
                              const parsed = Number.parseFloat(inputValue);
                              if (Number.isFinite(parsed)) {
                                setQuantity(p.id, parsed);
                              } else if (
                                inputValue === "" ||
                                inputValue === "."
                              ) {
                                // treat empty or "." as 0 while typing
                                setQuantity(p.id, 0);
                              }
                            }}
                            className="border-input bg-background min-w-12 rounded-md border px-1 py-1 text-center text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQtyChange(p.id, 1)}
                            aria-label="Aumentar"
                            disabled={availableRemaining <= 0}
                          >
                            +
                          </Button>
                        </div>

                        <div className="w-36">
                          <CurrencyInput
                            name={`price-${p.id}-editor`}
                            value={Number(entry?.unitPrice ?? p.price ?? 0)}
                            onValueChange={(v) => handlePriceChange(p.id, v)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pl-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProductId(p.id);
                          setEditOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="default">
                Concluir
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="gap-3 p-4">
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
          </DialogHeader>

          <form action={createAction} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required placeholder="Ex: Produto" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">Preço</Label>
              <div className="w-full">
                <CurrencyInput name="price" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="quantity">Quantidade em estoque</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                defaultValue={0}
                required
              />
            </div>

            {/* Hidden cost defaults to 0 */}
            <input type="hidden" name="cost" value={0} />

            <DialogFooter>
              <Button type="submit" disabled={creating}>
                {creating ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit product dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditingProductId(null);
        }}
      >
        <DialogContent className="gap-3 p-4">
          <DialogHeader>
            <DialogTitle>Editar produto</DialogTitle>
          </DialogHeader>

          {editingProductId != null &&
            (() => {
              const prod = selectableProducts.find(
                (pp) => pp.id === editingProductId,
              );
              if (!prod) return null;
              return (
                <form action={updateAction} className="space-y-3">
                  <input type="hidden" name="id" value={prod.id} />
                  {/* Preserve price and cost (cost defaults to 0 if unknown) */}
                  <input
                    type="hidden"
                    name="price"
                    value={Number(prod.price) || 0}
                  />
                  <input type="hidden" name="cost" value={0} />

                  <div className="space-y-1">
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={prod.name}
                      required
                    />
                  </div>

                  {/* Keep stock immutable from Sales context: submit as hidden field */}
                  <input type="hidden" name="quantity" value={prod.quantity} />
                  <div className="space-y-1">
                    <Label>Quantidade em estoque</Label>
                    <Input value={prod.quantity} readOnly disabled />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={updating}>
                      {updating ? "Salvando..." : "Salvar"}
                    </Button>
                  </DialogFooter>
                </form>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
