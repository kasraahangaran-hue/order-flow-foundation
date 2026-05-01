import type { DayOption, SlotOption } from "@/components/order/DateSlotPicker";

export function todayIso(offset: number = 0): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function formatSlotTime(startHour: number, endHour: number): string {
  const fmt = (h: number) => {
    if (h === 24) return "12:00 am";
    const period = h >= 12 ? "pm" : "am";
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${String(display).padStart(2, "0")}:00 ${period}`;
  };
  return `${fmt(startHour)} - ${fmt(endHour)}`;
}

function getDayLabel(offset: number, date: Date): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function getDaySubLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============================================================================
// PICKUP — all slots are free (no surcharge, no freeDelivery tag).
// ============================================================================

export const ALL_PICKUP_SLOT_RANGES: Array<{ startHour: number; endHour: number }> = [
  { startHour: 12, endHour: 14 },
  { startHour: 13, endHour: 15 },
  { startHour: 14, endHour: 16 },
  { startHour: 15, endHour: 17 },
  { startHour: 16, endHour: 18 },
  { startHour: 17, endHour: 19 },
  { startHour: 18, endHour: 20 },
  { startHour: 19, endHour: 21 },
  { startHour: 20, endHour: 22 },
  { startHour: 21, endHour: 23 },
  { startHour: 22, endHour: 24 },
];

// HANDOFF: Pickup/drop-off time slot availability is hardcoded here for the
// prototype. Wire to the real availability API before shipping. Specifically:
//   1. The list of available slots per day must come from the backend
//      (today's availability changes throughout the day; future days have
//      different staffing).
//   2. The `minStartHour` cutoff (current rule: don't show slots starting
//      less than ~2 hours from now) should use the SERVER's clock, not the
//      browser's, to avoid timezone-skew edge cases.
//   3. Confirm with ops the maximum lookahead window — currently ~7 days.
export function buildPickupSlotsForDay(offset: number): SlotOption[] {
  const now = new Date();
  const currentHour = now.getHours();
  const minStartHour = offset === 0 ? currentHour + 1 : 0;

  return ALL_PICKUP_SLOT_RANGES
    .filter((r) => r.startHour >= minStartHour)
    .map((r) => ({
      time: formatSlotTime(r.startHour, r.endHour),
      variant: "between" as const,
    }));
}

export function buildPickupMockDays(): DayOption[] {
  const days: DayOption[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    days.push({
      date: todayIso(i),
      label: getDayLabel(i, d),
      subLabel: getDaySubLabel(d),
      slots: buildPickupSlotsForDay(i),
    });
  }
  return days;
}

// ============================================================================
// DROP OFF — only "Anytime during the day" is free; everything else AED 5.
// Rule: a slot has EITHER `freeDelivery: true` OR `surcharge: number` — never both.
// ============================================================================

export const ALL_DROPOFF_SLOT_RANGES: Array<{ startHour: number; endHour: number }> = [
  { startHour: 12, endHour: 14 },
  { startHour: 13, endHour: 15 },
  { startHour: 14, endHour: 16 },
  { startHour: 16, endHour: 18 },
  { startHour: 17, endHour: 19 },
];

export function buildDropoffSlotsForDay(_offset: number): SlotOption[] {
  return [
    { time: "Anytime", variant: "wide", freeDelivery: true },
    { time: "Anytime Before 08:00 pm", variant: "wide", freeDelivery: true },
    { time: "Anytime After 08:00 pm", variant: "wide", freeDelivery: true },
    ...ALL_DROPOFF_SLOT_RANGES.map((r) => ({
      time: formatSlotTime(r.startHour, r.endHour),
      variant: "between" as const,
      surcharge: 5,
    })),
  ];
}

/**
 * Builds the dropoff day options for the next 7 days starting at +1.
 * Day +1 (Tomorrow) normally carries a 50% surcharge for next-day delivery.
 * When isFirstOrder is true, the surcharge is waived as part of the
 * new-user welcome experience — the next-day-delivery badge stays so the
 * user understands the speed benefit, but it's free.
 */
export function buildDropoffMockDays(
  isFirstOrder: boolean = false
): DayOption[] {
  const days: DayOption[] = [];
  // Day 0 (Today) is not a drop-off option for laundry — start at +1
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const isTomorrow = i === 1;
    days.push({
      date: todayIso(i),
      label: getDayLabel(i, d),
      subLabel: getDaySubLabel(d),
      badge: isTomorrow ? "next-day-delivery" : undefined,
      // NU: next-day is free. RU: next-day carries 50% surcharge.
      freeDelivery: isTomorrow ? isFirstOrder : true,
      daySurchargePct: isTomorrow && !isFirstOrder ? 50 : undefined,
      slots: buildDropoffSlotsForDay(i),
    });
  }
  return days;
}
