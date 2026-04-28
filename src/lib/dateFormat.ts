/**
 * Date formatting helpers for the Order Details screen.
 *
 * Inputs are ISO date strings (YYYY-MM-DD). Comparison is local-day based.
 */

export function formatRelativeDay(
  isoDate: string,
  options?: { showOffset?: boolean }
): string {
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
  if (options?.showOffset) {
    return dayName + " (+" + diffDays + " days)";
  }
  return dayName;
}

export function formatPickupSchedule(date: string, slot: string): string {
  return formatRelativeDay(date) + " " + slot;
}

export function formatDropoffSchedule(date: string, slot: string): string {
  return formatRelativeDay(date, { showOffset: true }) + " " + slot;
}

export function formatScheduleLines(
  date: string,
  slot: string,
  options?: { showOffset?: boolean }
): { day: string; time: string } {
  return {
    day: formatRelativeDay(date, options),
    time: slot,
  };
}