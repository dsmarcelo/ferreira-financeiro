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
}: {
  id?: string;
  name?: string;
  defaultValue?: string;
  required?: boolean;
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

  const [date, setDate] = React.useState<Date | undefined>(initialDate);

  return (
    <>
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
            id={id}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: ptBR })
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
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
