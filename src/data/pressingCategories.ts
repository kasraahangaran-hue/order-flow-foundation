// HANDOFF: Per Jira GC-1262 FR-4. These rates and labels are the design-system
// source of truth and must stay in sync with the iOS native build. Update
// here, never inline.
export interface PressingCategory {
  id: string;
  label: string;
  /** W&F+ rate per item, in AED */
  ratePlus: number;
  /** Standard Press Only rate, shown as strikethrough */
  rateStrikethrough: number;
}

export const PRESSING_CATEGORIES: PressingCategory[] = [
  { id: "tshirts_polos",   label: "All T-Shirts / Polos",     ratePlus: 9,  rateStrikethrough: 11 },
  { id: "tank_crop",       label: "All Tank / Crop Tops",     ratePlus: 9,  rateStrikethrough: 11 },
  { id: "gym_tops",        label: "All Gym Tops",             ratePlus: 9,  rateStrikethrough: 11 },
  { id: "shirts_blouses",  label: "All Shirts / Blouses",     ratePlus: 10, rateStrikethrough: 12 },
  { id: "kids_uniform",    label: "All Kids Uniform Tops",    ratePlus: 7,  rateStrikethrough: 11 },
];

/**
 * Kids Uniform Tops: defined as tops containing a school crest. All other
 * kids clothing is excluded. Per GC-1262 FR-4.
 */
export const KIDS_UNIFORM_NOTE = "Must contain school crest";