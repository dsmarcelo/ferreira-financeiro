import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { DeleteDialog } from "../../dialogs/delete-dialog";

interface IncomeFormActionsProps {
  formId?: string;
  pending: boolean;
  selectedProducts: Record<number, { quantity: number; unitPrice: number }>;
  finalTotal: number;
  customerId: string;
  isEditMode?: boolean;
  onDelete?: () => void;
}

export function SalesFormActions({
  formId,
  pending,
  selectedProducts,
  finalTotal,
  customerId,
  isEditMode = false,
  onDelete,
}: IncomeFormActionsProps) {
  return (
    <div className="w-full">
      {/* Hidden inputs for form data */}
      {/* Sales do not expose profit margin; default to 0 to satisfy server validation */}
      <input type="hidden" name="profitMargin" value={0} />
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
        <div className="flex w-full justify-between gap-2 pt-2">
          {isEditMode && onDelete && (
            <DeleteDialog
              onConfirm={onDelete}
              triggerText={<TrashIcon className="h-4 w-4 text-red-500" />}
            />
          )}

          <Button type="submit" disabled={pending} className="w-fit">
            {pending
              ? isEditMode
                ? "Salvando..."
                : "Adicionando..."
              : isEditMode
                ? "Salvar Alterações"
                : "Adicionar Venda"}
          </Button>
        </div>
      )}
    </div>
  );
}
