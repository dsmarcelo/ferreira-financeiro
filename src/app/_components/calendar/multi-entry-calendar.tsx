"use client";
import React, { useState } from "react";
import { BigCalendar, buildCalendarDayData } from "./big-calendar";
import type { CalendarEntry } from "@/lib/types";

interface MultiEntryCalendarProps<T extends CalendarEntry> {
  year: number;
  month: number; // 0-indexed
  entriesByDate: Record<string, T[]>;
  formatLabel: (entries: T[]) => string;
  renderList: (options: {
    date: string;
    entries: T[];
    onClose: () => void;
    onSelect: (entry: T) => void;
    onAdd: () => void;
  }) => React.ReactNode;
  renderEdit: (options: {
    entry: T;
    onClose: () => void;
  }) => React.ReactNode;
  renderAdd: (options: {
    date: string;
    onClose: () => void;
  }) => React.ReactNode;
  className?: string;
}

export function MultiEntryCalendar<T extends CalendarEntry>({
  year,
  month,
  entriesByDate,
  formatLabel,
  renderList,
  renderEdit,
  renderAdd,
  className,
}: MultiEntryCalendarProps<T>) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<T[]>([]);
  const [editingEntry, setEditingEntry] = useState<T | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDayClick = (dateStr: string, entries: T[] | null) => {
    setSelectedDate(dateStr);
    const ents = entries ?? [];
    if (ents.length > 0) {
      setSelectedEntries(ents);
      setIsListOpen(true);
    } else {
      setIsAddOpen(true);
    }
  };

  // Build dayData using generic helper
  const dayData = buildCalendarDayData<T[]>(
    year,
    month,
    entriesByDate,
    (_date, ents) => formatLabel(ents ?? []),
    handleDayClick
  );

  return (
    <div className={className}>
      <BigCalendar year={year} month={month} dayData={dayData} />

      {isListOpen && selectedDate &&
        renderList({
          date: selectedDate,
          entries: selectedEntries,
          onClose: () => setIsListOpen(false),
          onSelect: (entry) => {
            setEditingEntry(entry);
            setIsEditOpen(true);
            setIsListOpen(false);
          },
          onAdd: () => {
            setIsAddOpen(true);
            setIsListOpen(false);
          },
        })
      }

      {editingEntry && isEditOpen &&
        renderEdit({
          entry: editingEntry,
          onClose: () => {
            setIsEditOpen(false);
            setIsListOpen(true);
          },
        })
      }

      {selectedDate && isAddOpen &&
        renderAdd({
          date: selectedDate,
          onClose: () => {
            setIsAddOpen(false);
            setIsListOpen(true);
          },
        })
      }
    </div>
  );
}