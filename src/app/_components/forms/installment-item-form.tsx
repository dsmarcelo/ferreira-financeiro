import type { ProductPurchaseInstallment } from "@/server/db/schema/product-purchase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";

export default function InstallmentItemForm({
  installment,
}: {
  installment: ProductPurchaseInstallment;
}) {
  // const [description, setDescription] = React.useState(installment.description);
  return (
    <div className="flex flex-col gap-2">
      <span>{`${installment.installmentNumber}/${installment.totalInstallments}`}</span>
      <Input
        type="text"
        id="description"
        name="description"
        defaultValue={installment.description}
        required
      />
      <CurrencyInput
        name="amount"
        initialValue={Number(installment.amount)}
        required
        min={0}
        step={0.01}
        className="w-1/4"
      />
    </div>
  );
}
