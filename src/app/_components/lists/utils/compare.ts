// Utility to compare by dueDate and id robustly
// Handles both string and number ids, and ensures date comparison is safe

export function compareByDueDateAndId<T extends { dueDate: string; id: string | number }>(a: T, b: T): number {
  // Fallback for missing dueDate
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;

  const dateA = new Date(a.dueDate);
  const dateB = new Date(b.dueDate);
  const dateDiff = dateA.getTime() - dateB.getTime();
  if (dateDiff !== 0) return dateDiff;

  // Ensure ids are compared as strings
  return String(a.id).localeCompare(String(b.id));
}
