import type { PickupState, DropoffState } from "@/stores/orderStore";

function todayPlus(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getDefaultPickup(): PickupState {
  // Earliest free pickup. All pickup slots are free in current mock data.
  return {
    mode: "door",
    date: todayPlus(0),
    slot: "03:00 pm - 05:00 pm",
  };
}

export function getDefaultDropoff(): DropoffState {
  // Earliest FREE drop-off (skips slots with surcharge).
  // First day is +1 (Tomorrow), first free slot is "Anytime during the day".
  return {
    mode: "door",
    date: todayPlus(1),
    slot: "Anytime during the day",
    surcharge: 0,
  };
}

// TODO: Replace with logic that picks the first free slot from API-returned
// availability data when backend is wired up.