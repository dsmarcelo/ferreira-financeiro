/**
 * Format a date as YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  try {
    const isoString = date.toISOString();
    const dateStr = isoString.split("T")[0];
    return dateStr || "";
  } catch (e) {
    return ""; // Return empty string for invalid dates
  }
}

/**
 * Get the first and last day of a month as YYYY-MM-DD strings
 */
export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start: formatDateString(start),
    end: formatDateString(end),
  };
}

/**
 * Parse a YYYY-MM-DD string into a Date object
 */
export function parseYYYYMMDD(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  return isValidDate(date) ? date : null;
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get the current year and month (0-indexed) from a date string
 */
export function getYearAndMonthFromDateString(dateStr: string | null): { year: number; month: number } {
  const date = parseYYYYMMDD(dateStr);
  if (!date) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  return { year: date.getFullYear(), month: date.getMonth() };
}