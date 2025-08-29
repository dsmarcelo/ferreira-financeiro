import DiscountSelect, {
  type DiscountType,
} from "@/app/_components/inputs/discount-select";
import { formatCurrency } from "@/lib/utils";

interface IncomeDiscountSectionProps {
  discountType: DiscountType;
  discountValue: number | undefined;
  totalSelectedValue: number;
  onDiscountTypeChange: (type: DiscountType) => void;
  onDiscountValueChange: (value: number | undefined) => void;
  disabled?: boolean;
}

export function SalesDiscountSection({
  discountType,
  discountValue,
  totalSelectedValue,
  onDiscountTypeChange,
  onDiscountValueChange,
  disabled = false,
}: IncomeDiscountSectionProps) {
  return (
    <div className="space-y-3">
      <DiscountSelect
        name="discount"
        discountType={discountType}
        onDiscountTypeChange={onDiscountTypeChange}
        value={discountValue}
        onValueChange={onDiscountValueChange}
        placeholder="0"
        label="Desconto"
        showLabel={true}
        disabled={disabled}
      />

      <div className="text-sm text-slate-600">
        Total:{" "}
        <span className="font-medium">
          {formatCurrency(totalSelectedValue)}
        </span>
      </div>
    </div>
  );
}
