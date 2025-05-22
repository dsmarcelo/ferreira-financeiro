import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function formatDate(date: Date | string) {
  const dateObject = typeof date === "string" ? stringToDate(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObject);
}

export function formatShortDate(date: Date | string) {
  const dateObject = typeof date === "string" ? stringToDate(date) : date;
  return format(dateObject, "dd/MM/yyyy");
}

export function getSelectedMonth() {
  const month = localStorage.getItem("month");
  if (month) return month;
  return "";
}

export function getMonthFromDate(date: Date | string) {
  const dateObject = typeof date === "string" ? stringToDate(date) : date;
  return format(dateObject, "MMMM 'de' yyyy", { locale: ptBR });
}

export function formatMonth(date: Date | string) {
  const dateObject = typeof date === "string" ? stringToDate(date) : date;
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(dateObject);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function stringToDate(date: string): Date {
  const parsed = parseISO(date);
  return toZonedTime(parsed, "UTC");
}
export function getToday(): string {
  const iso = new Date().toISOString();
  const [date] = iso.split("T");
  return typeof date === "string" ? date : "";
}
