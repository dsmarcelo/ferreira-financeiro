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

const COLOR_MAP = {
  red: "bg-red-50 text-red-800",
  orange: "bg-orange-50 text-orange-800",
  amber: "bg-amber-50 text-amber-800",
  yellow: "bg-yellow-50 text-yellow-800",
  lime: "bg-lime-50 text-lime-800",
  green: "bg-green-50 text-green-800",
  emerald: "bg-emerald-50 text-emerald-800",
  teal: "bg-teal-50 text-teal-800",
  cyan: "bg-cyan-50 text-cyan-800",
  sky: "bg-sky-50 text-sky-800",
  blue: "bg-blue-50 text-blue-800",
  indigo: "bg-indigo-50 text-indigo-800",
  violet: "bg-violet-50 text-violet-800",
  purple: "bg-purple-50 text-purple-800",
  fuchsia: "bg-fuchsia-50 text-fuchsia-800",
  pink: "bg-pink-50 text-pink-800",
  rose: "bg-rose-50 text-rose-800",
  gray: "bg-gray-50 text-gray-800",
  slate: "bg-slate-50 text-slate-800",
  zinc: "bg-zinc-50 text-zinc-800",
} as const;

export type CategoryColor = keyof typeof COLOR_MAP;

export function getCategoryColorClasses(color: string): string {
  return COLOR_MAP[color as CategoryColor] || COLOR_MAP.blue;
}
