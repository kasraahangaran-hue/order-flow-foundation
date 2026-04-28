import type { PickupState, DropoffState } from "@/stores/orderStore";
import { todayIso, buildPickupSlotsForDay, buildDropoffSlotsForDay } from "@/data/slots";

export function getDefaultPickup(): PickupState {
  const todaySlots = buildPickupSlotsForDay(0);
  const firstToday = todaySlots[0];
  if (firstToday) {
    return { mode: "door", date: todayIso(0), slot: firstToday.time };
  }
  // Today has no remaining slots — fall back to Tomorrow's first slot.
  const tomorrowSlots = buildPickupSlotsForDay(1);
  return {
    mode: "door",
    date: todayIso(1),
    slot: tomorrowSlots[0]?.time ?? "12:00 pm - 02:00 pm",
  };
}

export function getDefaultDropoff(): DropoffState {
  // Default to +2 days — the earliest FREE day. (+1 Tomorrow has +50% surcharge.)
  const slots = buildDropoffSlotsForDay(2);
  const firstFree = slots.find((s) => s.freeDelivery) ?? slots[0];
  return {
    mode: "door",
    date: todayIso(2),
    slot: firstFree?.time ?? "Anytime",
    surcharge: 0,
  };
}

// TODO: Replace with logic that picks the first free slot from API-returned
// availability data when backend is wired up.
