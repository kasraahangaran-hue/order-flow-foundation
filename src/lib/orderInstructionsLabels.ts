import type {
  DriverInstructionsState,
  CreasesState,
  StarchChoice,
  CreaseChoice,
  DriverPickupChoice,
  DriverDropoffChoice,
} from "@/stores/orderStore";

const PICKUP_LABELS: Record<DriverPickupChoice, string> = {
  no_preference: "No Preference",
  at_concierge: "At concierge / reception",
  ring_doorbell: "Ring the doorbell",
  knock_door: "Knock the door",
  do_not_disturb_bags_outside: "Do not disturb, bags outside",
  call_when_arrive: "Call me when you arrive",
};

const DROPOFF_LABELS: Record<DriverDropoffChoice, string> = {
  no_preference: "No Preference",
  at_concierge: "At concierge / reception",
  hang_door_handle: "Hang on door handle",
  ring_doorbell: "Ring the doorbell",
  knock_door: "Knock the door",
  do_not_disturb_packages_outside: "Do not disturb, leave packages outside",
  call_when_arrive: "Call me when you arrive",
};

const CREASE_LABELS: Record<CreaseChoice, string> = {
  no_preference: "No preference",
  full_crease: "Full crease",
  fold_top_only: "Fold the top only",
};

const STARCH_LABELS: Record<StarchChoice, string> = {
  none: "None",
  light: "Light",
  medium: "Medium",
  hard: "Hard",
};

export interface DriverInstructionsSummary {
  /** True when both pickup and dropoff are "no_preference"; card should collapse to empty state. */
  isEmpty: boolean;
  pickupSuffix: string;
  dropoffSuffix: string;
}

export function summarizeDriverInstructions(d: DriverInstructionsState): DriverInstructionsSummary {
  const pickupSet = d.pickup !== "no_preference";
  const dropoffSet = d.dropoff !== "no_preference";
  return {
    isEmpty: !pickupSet && !dropoffSet,
    pickupSuffix: pickupSet ? PICKUP_LABELS[d.pickup] : "No specific instructions",
    dropoffSuffix: dropoffSet ? DROPOFF_LABELS[d.dropoff] : "No specific instructions",
  };
}

export function summarizeCreases(c: CreasesState): string {
  const parts: string[] = [];
  if (c.shirtsSleeveCreases) parts.push("Sleeve creases");
  if (c.pantsFrontCreases) parts.push("Pants front creases");
  if (c.kandura !== "no_preference") parts.push(`Kandura: ${CREASE_LABELS[c.kandura]}`);
  if (c.gathra !== "no_preference") parts.push(`Gathra: ${CREASE_LABELS[c.gathra]}`);
  if (parts.length === 0) return "No preference";
  return parts.join(" · ");
}

export function summarizeStarch(s: StarchChoice): string {
  return STARCH_LABELS[s];
}

export const DEFAULT_DRIVER_INSTRUCTIONS: DriverInstructionsState = {
  pickup: "no_preference",
  dropoff: "no_preference",
};

export const DEFAULT_CREASES: CreasesState = {
  shirtsSleeveCreases: false,
  pantsFrontCreases: false,
  kandura: "no_preference",
  gathra: "no_preference",
};

export const DEFAULT_STARCH: StarchChoice = "none";