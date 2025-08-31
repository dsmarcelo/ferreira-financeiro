import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { DatePicker } from "@/components/inputs/date-picker";
import { Input } from "@/components/ui/input";

interface IncomeBasicFieldsProps {
  description: string;
  dateStr: string;
  timeStr: string;
  totalValue: number | undefined;
  profitMargin: number | undefined;
  onDescriptionChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onTotalValueChange: (value: number | undefined) => void;
  onProfitMarginChange: (value: number | undefined) => void;
  errors: Record<string, string[]>;
}

export function IncomeBasicFields({
  description,
  dateStr,
  timeStr,
  totalValue,
  profitMargin,
  onDescriptionChange,
  onDateChange,
  onTimeChange,
  onTotalValueChange,
  onProfitMarginChange,
  errors,
}: IncomeBasicFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          type="text"
          placeholder="Descrição da receita"
          required
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500" aria-live="polite">
            {errors.description[0]}
          </p>
        )}
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <DatePicker
            id="date"
            name="date"
            required
            defaultValue={dateStr}
            value={dateStr}
            onChange={(d) => onDateChange(d ?? "")}
            className="w-fit"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.date[0]}
            </p>
          )}
        </div>

        <div className="w-full space-y-2">
          <Label htmlFor="time">Hora</Label>
          <input
            id="time"
            name="time"
            type="time"
            value={timeStr}
            onChange={(e) => onTimeChange(e.target.value)}
            className="border-input h-9 w-fit rounded-md border px-2 py-0 shadow-xs"
            required
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.time[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalValue">Valor</Label>
          <CurrencyInput
            id="totalValue"
            name="totalValue"
            value={totalValue}
            onValueChange={onTotalValueChange}
            placeholder="R$ 0,00"
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.value[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profitMargin">Margem de lucro (%)</Label>
          <Input
            id="profitMargin"
            name="profitMargin"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            step={0.01}
            value={profitMargin ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? undefined : Number(e.target.value);
              onProfitMarginChange(Number.isFinite(v as number) ? (v as number) : undefined);
            }}
          />
          {errors.profitMargin && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {errors.profitMargin[0]}
            </p>
          )}
        </div>
      </div>
    </>
  );
}


