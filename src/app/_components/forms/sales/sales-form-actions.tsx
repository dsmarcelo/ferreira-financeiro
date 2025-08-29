import { Button } from "@/components/ui/button";

interface IncomeFormActionsProps {
  formId?: string;
  pending: boolean;
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
  finalTotal: number;
  customerId: string;
}

export function SalesFormActions({
  formId,
  pending,
  selectedProducts,
  finalTotal,
  customerId,
}: IncomeFormActionsProps) {
  return (
    <>
      {/* Hidden inputs for form data */}
      <input
        type="hidden"
        name="soldItemsJson"
        value={JSON.stringify(
          Object.entries(selectedProducts).map(([id, data]) => ({
            productId: Number(id),
            quantity: data.quantity,
            unitPrice: data.unitPrice,
          })),
        )}
      />
      <input type="hidden" name="totalValue" value={finalTotal} />
      <input type="hidden" name="customerId" value={customerId} />
      {/* Discount data will be handled by DiscountSelect component's hidden inputs */}

      {!formId && (
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Adicionando..." : "Adicionar Venda"}
        </Button>
      )}
    </>
  );
}
