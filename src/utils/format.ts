const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

/** Formats a number as Philippine pesos, e.g. 42000 -> ₱42,000.00 */
export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount);
}

/** Returns progress as a number from 0 to 1 (capped at 1). */
export function calculateProgress(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(raised / goal, 1);
}

/** Formats an ISO date string, e.g. 2026-12-15 -> Dec 15, 2026 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Whole days left until the deadline (0 when the deadline has passed). */
export function daysLeft(deadlineIso: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = new Date(deadlineIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / msPerDay));
}