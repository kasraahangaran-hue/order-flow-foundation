import type {
  DriverInstructionsState,
  CreasesState,
  StarchChoice,
  CreaseChoice,
  DriverPickupChoice,
  DriverDropoffChoice,
  HangingInstructionChoice,
} from "@/stores/orderStore";

const PICKUP_LABELS: Record<DriverPickupChoice, string> = {
  no_preference: "No preference",
  ring_doorbell: "Ring the doorbell",
  knock_door: "Knock the door",
  do_not_disturb_outside: "Do not disturb, bags outside",
};

const DROPOFF_LABELS: Record<DriverDropoffChoice, string> = {
  no_preference: "No preference",
  ring_doorbell: "Ring the doorbell",
  knock_door: "Knock the door",
  do_not_disturb_outside: "Do not disturb, leave packages outside",
};

const HANGING_LABELS: Record<HangingInstructionChoice, string> = {
  none: "",
  door_handle: "Hang on the door handle",
  door_frame: "Hang on the door frame",
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

export function summarizeDriverInstructions(d: DriverInstructionsState): string {
  const parts: string[] = [];
  if (d.pickup !== "no_preference") parts.push(`Pick up: ${PICKUP_LABELS[d.pickup]}`);
  if (d.dropoff !== "no_preference") parts.push(`Drop off: ${DROPOFF_LABELS[d.dropoff]}`);
  if (d.hanging !== "none") parts.push(HANGING_LABELS[d.hanging]);
  if (parts.length === 0) return "No preference";
  return parts.join(" · ");
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
  pickupCallOnArrival: false,
  dropoff: "no_preference",
  hanging: "none",
  dropoffCallOnArrival: false,
};

export const DEFAULT_CREASES: CreasesState = {
  shirtsSleeveCreases: false,
  pantsFrontCreases: false,
  kandura: "no_preference",
  gathra: "no_preference",
};

export const DEFAULT_STARCH: StarchChoice = "none";