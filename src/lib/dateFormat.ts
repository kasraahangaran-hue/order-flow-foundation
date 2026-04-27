/**
 * Date formatting helpers for the Order Details screen.
 *
 * Inputs are ISO date strings (YYYY-MM-DD). Comparison is local-day based.
 */

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseISODate(iso: string): Date {
  // Treat "YYYY-MM-DD" as a local date (not UTC) to avoid TZ drift.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Days from today (local) to the given ISO date. Negative if in the past. */
export function daysFromToday(iso: string): number {
  const today = startOfLocalDay(new Date()).getTime();
  const target = startOfLocalDay(parseISODate(iso)).getTime();
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

/**
 * Pickup label: "Today", "Tomorrow", or "Mon Apr 28".
 */
export function formatPickupDate(iso: string): string {
  const diff = daysFromToday(iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  const d = parseISODate(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Dropoff label: "Tomorrow", or "Wednesday (+2 days)".
 * For today (diff 0) returns "Today".
 */
export function formatDropoffDate(iso: string): string {
  const diff = daysFromToday(iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  const d = parseISODate(iso);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  return `${weekday} (+${diff} days)`;
}