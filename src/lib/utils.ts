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
  red: "bg-red-100 text-red-800",
  orange: "bg-orange-100 text-orange-800",
  amber: "bg-amber-100 text-amber-800",
  yellow: "bg-yellow-100 text-yellow-800",
  lime: "bg-lime-100 text-lime-800",
  green: "bg-green-100 text-green-800",
  emerald: "bg-emerald-100 text-emerald-800",
  teal: "bg-teal-100 text-teal-800",
  cyan: "bg-cyan-100 text-cyan-800",
  sky: "bg-sky-100 text-sky-800",
  blue: "bg-blue-100 text-blue-800",
  indigo: "bg-indigo-100 text-indigo-800",
  violet: "bg-violet-100 text-violet-800",
  purple: "bg-purple-100 text-purple-800",
  fuchsia: "bg-fuchsia-100 text-fuchsia-800",
  pink: "bg-pink-100 text-pink-800",
  rose: "bg-rose-100 text-rose-800",
  gray: "bg-gray-100 text-gray-800",
  slate: "bg-slate-100 text-slate-800",
  zinc: "bg-zinc-100 text-zinc-800",
} as const;

export type CategoryColor = keyof typeof COLOR_MAP;

export function getCategoryColorClasses(color: string): string {
  return COLOR_MAP[color as CategoryColor] || COLOR_MAP.blue;
}
