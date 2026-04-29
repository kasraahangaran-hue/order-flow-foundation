import type {
  DriverInstructionsState,
  CreasesState,
  StarchChoice,
  CreaseChoice,
  DriverPickupChoice,
  DriverDropoffChoice,
  AutoApprovalsState,
  WashAndFoldApprovalChoice,
  FoldingSelection,
  StainType,
  CleaningInstruction,
  OtherFlag,
} from "@/stores/orderStore";

export type FoldingCategoryId = "tops" | "bottoms" | "linen" | "formal" | "others";

export interface FoldingItem {
  id: string;
  label: string;
}

export interface FoldingCategory {
  id: FoldingCategoryId;
  label: string;
  items: FoldingItem[];
}

// Category structure for the Folding sheet. Item ids are persisted in the store.
// The "All" chip is NOT stored — it's a derived UI affordance.
export const FOLDING_CATEGORIES: FoldingCategory[] = [
  {
    id: "tops",
    label: "Tops",
    items: [
      { id: "tshirt", label: "T shirt" },
      { id: "shirt", label: "Shirt" },
      { id: "blouse", label: "Blouse" },
    ],
  },
  {
    id: "bottoms",
    label: "Bottoms",
    items: [
      { id: "shorts", label: "Shorts" },
      { id: "pants", label: "Pants" },
      { id: "skirt", label: "Skirt" },
      { id: "jeans", label: "Jeans" },
    ],
  },
  {
    id: "linen",
    label: "Linen",
    items: [{ id: "bathrobe", label: "Bathrobe" }],
  },
  {
    id: "formal",
    label: "Formal",
    items: [
      { id: "jacket", label: "Jacket" },
      { id: "gathra_formal", label: "Gathra" },
      { id: "lungi", label: "Lungi" },
      { id: "scarf", label: "Scarf" },
      { id: "tie", label: "Tie" },
    ],
  },
  {
    id: "others",
    label: "Others",
    items: [
      { id: "pyjama_pants", label: "Pyjama pants" },
      { id: "sweater", label: "Sweater" },
      { id: "pullover", label: "Pullover" },
    ],
  },
];

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

/**
 * Returns a comma-separated list of selected folding item display labels
 * in the order they appear in FOLDING_CATEGORIES (Tops first, then Bottoms,
 * Linen, Formal). Returns null if nothing is selected.
 */
export function summarizeFolding(f: FoldingSelection): string | null {
  const labels: string[] = [];
  for (const category of FOLDING_CATEGORIES) {
    for (const item of category.items) {
      if (f[item.id]) {
        labels.push(item.label);
      }
    }
  }
  if (labels.length === 0) return null;
  return labels.join(", ");
}

export const DEFAULT_FOLDING: FoldingSelection = {};

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

const WASH_AND_FOLD_LABELS: Record<WashAndFoldApprovalChoice, string> = {
  notify_me: "Always notify me of items in question",
  transfer_clean_press: "Automatically transfer my items to the Clean & Press service and notify me",
  always_wash: "Always wash my items regardless of risk",
  do_not_wash: "Do not wash and return unprocessed",
};

export interface AutoApprovalsSummaryLine {
  prefix: string;
  suffix: string;
}

/**
 * Returns an array of {prefix, suffix} lines for rendering the Auto-Approvals
 * card subtitle as multi-line stacked content.
 */
export function summarizeAutoApprovals(a: AutoApprovalsState): AutoApprovalsSummaryLine[] {
  return [
    {
      prefix: "Stain & Damage:",
      suffix: a.stainDamageAutoApprove ? "Approved" : "Notify me",
    },
    {
      prefix: "Wash & Fold:",
      suffix: WASH_AND_FOLD_LABELS[a.washAndFold],
    },
  ];
}

export const DEFAULT_AUTO_APPROVALS: AutoApprovalsState = {
  stainDamageAutoApprove: false,
  washAndFold: "notify_me",
};
export const STAIN_OPTIONS: { value: StainType; label: string }[] = [
  { value: "i_dont_know", label: "I don't Know" },
  { value: "coffee", label: "Coffee" },
  { value: "food", label: "Food" },
  { value: "oil", label: "Oil" },
  { value: "blood", label: "Blood" },
  { value: "other", label: "Other" },
];

export const CLEANING_INSTRUCTION_OPTIONS: {
  value: CleaningInstruction;
  label: string;
}[] = [
  { value: "no_preference", label: "I do not have a preference" },
  { value: "dry_clean_only", label: "Dry cleaning only" },
  { value: "opticlean", label: "OptiClean (delicate handwash)" },
  { value: "cold_wash", label: "Cold wash" },
  { value: "high_temp", label: "Wash at high temperature" },
];

export const OTHER_FLAG_OPTIONS: { value: OtherFlag; label: string }[] = [
  { value: "new_item", label: "New Item, take extra care" },
  { value: "delicate", label: "Delicate item, take extra care" },
  { value: "expensive", label: "Expensive item, take extra care" },
  { value: "bad_smell", label: "It has a bad smell" },
];

const STAIN_LABELS: Record<StainType, string> = STAIN_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {} as Record<StainType, string>,
);

const CLEANING_LABELS: Record<CleaningInstruction, string> =
  CLEANING_INSTRUCTION_OPTIONS.reduce(
    (acc, o) => ({ ...acc, [o.value]: o.label }),
    {} as Record<CleaningInstruction, string>,
  );

const OTHER_LABELS: Record<OtherFlag, string> = OTHER_FLAG_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {} as Record<OtherFlag, string>,
);

export function summarizeStains(stains: StainType[]): string | null {
  if (stains.length === 0) return null;
  return stains.map((s) => STAIN_LABELS[s]).join(", ");
}

export function summarizeCleaningInstruction(
  c: CleaningInstruction | null,
): string | null {
  if (!c) return null;
  return CLEANING_LABELS[c];
}

export function summarizeOthers(others: OtherFlag[]): string | null {
  if (others.length === 0) return null;
  return others.map((o) => OTHER_LABELS[o]).join(", ");
}
