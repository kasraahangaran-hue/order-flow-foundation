
// HANDOFF — NU/RU schedule defaulting:
//
// Pickup mode rule:
//   New users → "in_person" (driver greets them, hands over bags). The web
//   pickup sheet does not show the door/in-person mode toggle for NU; mode
//   is locked to in_person.
//   Returning users → "door" (their previously-used mode in production).
//
// Slot rule (both NU and RU):
//   First available slot today, falling back to tomorrow's first slot if
//   today is exhausted. NU has no premium tier on pickup, so no filter
//   needed. If premium pickup tiers are introduced later, gate them
//   behind isFirstOrder per Jira GC-1310.
//
// Drop-off rule:
//   Both NU and RU default to +2 days (the earliest FREE day). +1 Tomorrow
//   has a +50% delivery surcharge.
// NOTE: We intentionally do NOT import from "@/lib/userType" or
// "@/stores/orderStore" at module scope — that creates a circular dependency
// (orderStore → scheduleDefaults → userType → orderStore) which leaves
// `useOrderStore` undefined during initial state evaluation and crashes the
// app to a white screen.
//
// Instead, callers that need NU-aware defaults pass `isFirstOrder` in
// explicitly. Initial store creation defaults to RU ("door"), which matches
// the store's initial flowType of "existingUser".
import type { PickupState, DropoffState } from "@/stores/orderStore";

export function getDefaultPickup(isFirstOrder = false): PickupState {
  const mode: PickupState["mode"] = isFirstOrder ? "in_person" : "door";
  const todaySlots = buildPickupSlotsForDay(0);
  const firstToday = todaySlots[0];
  if (firstToday) {
    return { mode, date: todayIso(0), slot: firstToday.time };
  }
  // Today has no remaining slots — fall back to Tomorrow's first slot.
  const tomorrowSlots = buildPickupSlotsForDay(1);
  return {
    mode,
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

// HANDOFF: Default pickup/drop-off slots are hardcoded. The intended
// production behavior is: when the customer lands on Order Details, the
// app pre-selects the first AVAILABLE pickup slot today (or the soonest
// free slot tomorrow if today's are exhausted), and a drop-off slot ~48h
// later. Wire this to the availability API once the slots data is dynamic.