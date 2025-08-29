import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/inputs/currency-input";
import { DatePicker } from "@/components/inputs/date-picker";
import { Input } from "@/components/ui/input";

interface IncomeBasicFieldsProps {
  description: string;
  dateStr: string;
  timeStr: string;
  onDescriptionChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  errors: Record<string, string[]>;
}

export function SalesBasicFields({
  description,
  dateStr,
  timeStr,
  onDescriptionChange,
  onDateChange,
  onTimeChange,
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

      {/* Extra value and profit margin removed for sales forms */}
    </>
  );
}
