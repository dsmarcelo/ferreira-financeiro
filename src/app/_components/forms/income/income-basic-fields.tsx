import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { DatePicker } from "@/components/inputs/date-picker";
import { Input } from "@/components/ui/input";

interface IncomeBasicFieldsProps {
  description: string;
  dateStr: string;
  timeStr: string;
  extraValue: number;
  profitMargin: number;
  onDescriptionChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onExtraValueChange: (value: number) => void;
  onProfitMarginChange: (value: number) => void;
  errors: Record<string, string[]>;
}

export function IncomeBasicFields({
  description,
  dateStr,
  timeStr,
  extraValue,
  profitMargin,
  onDescriptionChange,
  onDateChange,
  onTimeChange,
  onExtraValueChange,
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

      <div className="space-y-2">
        <Label htmlFor="extraValue">Valor Extra</Label>
        <CurrencyInput
          id="extraValue"
          name="extraValue"
          step="0.01"
          min={0}
          value={extraValue}
          onValueChange={(value) => onExtraValueChange(value ?? 0)}
        />
        {errors.value && (
          <p className="mt-1 text-sm text-red-500" aria-live="polite">
            {errors.value[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
        <Input
          id="profitMargin"
          name="profitMargin"
          type="number"
          inputMode="numeric"
          step="0.01"
          min={0}
          max={100}
          value={profitMargin}
          onChange={(e) => onProfitMarginChange(Number(e.target.value) || 0)}
          required
        />
        {errors.profitMargin && (
          <p className="mt-1 text-sm text-red-500" aria-live="polite">
            {errors.profitMargin[0]}
          </p>
        )}
      </div>
    </>
  );
}
