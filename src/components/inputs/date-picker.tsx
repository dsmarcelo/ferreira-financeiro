"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  id,
  name,
  defaultValue,
  required,
  onChange,
  value,
  className,
  shortDate = false,
}: {
  id?: string;
  name?: string;
  defaultValue?: string;
  required?: boolean;
  onChange?: (date: string | undefined) => void;
  value?: string;
  className?: string;
  shortDate?: boolean;
}) {
  // Parse defaultValue (yyyy-MM-dd) to Date with timezone handling
  const initialDate = React.useMemo(() => {
    if (!defaultValue) return undefined;

    try {
      // Parse the date using date-fns, which handles the format correctly
      // and set to noon time to avoid timezone issues
      const parsedDate = parse(defaultValue, "yyyy-MM-dd", new Date());
      // Adjust to noon UTC to avoid date shifting due to timezones
      parsedDate.setUTCHours(12, 0, 0, 0);
      return parsedDate;
    } catch (error) {
      console.error("Error parsing date:", error);
      return undefined;
    }
  }, [defaultValue]);

  // Controlled: derive date from value if provided, else fall back to state/defaultValue
  const controlledDate = React.useMemo(() => {
    if (value) {
      try {
        const parsedDate = parse(value, "yyyy-MM-dd", new Date());
        parsedDate.setUTCHours(12, 0, 0, 0);
        return parsedDate;
      } catch (error) {
        console.error("Error parsing date:", error);
        return undefined;
      }
    }
    return initialDate;
  }, [value, initialDate]);

  // Internal state only for uncontrolled usage (for backward compat)
  const [uncontrolledDate, setUncontrolledDate] = React.useState<
    Date | undefined
  >(initialDate);

  // Pick which date to show: controlled (from prop) or uncontrolled (from state)
  const date = value !== undefined ? controlledDate : uncontrolledDate;

  // When value changes externally, update uncontrolled state for backward compat
  React.useEffect(() => {
    if (value === undefined && initialDate !== uncontrolledDate) {
      setUncontrolledDate(initialDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate]);

  return (
    <>
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal mb-0",
              !date && "text-muted-foreground",
              className,
            )}
            id={id}
          >
            <CalendarIcon className="h-4 w-4" />
            {date ? (
              shortDate ? (
                format(date, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                format(date, "PPP", { locale: ptBR })
              )
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (value !== undefined) {
                // Controlled: just call onChange
                onChange?.(selectedDate?.toISOString().split("T")[0]);
              } else {
                // Uncontrolled: update state and call onChange
                setUncontrolledDate(selectedDate);
                onChange?.(selectedDate?.toISOString().split("T")[0]);
              }
            }}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        className="hidden"
        name={name}
        value={date ? format(date, "yyyy-MM-dd") : ""}
        required={required}
        readOnly
      />
    </>
  );
}
