/**
 * Date formatting helpers for the Order Details screen.
 *
 * Inputs are ISO date strings (YYYY-MM-DD). Comparison is local-day based.
 */

export function formatRelativeDay(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  const dayName = target.toLocaleDateString("en-US", { weekday: "long" });
  return dayName + " (+" + diffDays + " days)";
}

export function formatPickupSchedule(date: string, slot: string): string {
  return formatRelativeDay(date) + " " + slot;
}

export function formatDropoffSchedule(date: string, slot: string): string {
  return formatRelativeDay(date) + " " + slot;
}