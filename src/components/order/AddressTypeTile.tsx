import { Briefcase, Building2, Home, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AddressType } from "@/stores/orderStore";

const ICON_BY_TYPE = {
  office: Briefcase,
  hotel: Hotel,
  villa: Home,
  apartment: Building2,
} as const;

const LABEL_BY_TYPE: Record<AddressType, string> = {
  office: "Office",
  hotel: "Hotel",
  villa: "Villa",
  apartment: "Apartment",
};

interface AddressTypeTileProps {
  type: AddressType;
  selected: boolean;
  onSelect: () => void;
  /**
   * "card" — full illustration card used on the Type Select screen.
   * "chip" — compact horizontal chip used at the top of the Details form.
   */
  variant: "card" | "chip";
}

export function AddressTypeTile({
  type,
  selected,
  onSelect,
  variant,
}: AddressTypeTileProps) {
  const Icon = ICON_BY_TYPE[type];
  const label = LABEL_BY_TYPE[type];

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 transition-colors",
          selected
            ? "border-washmen-primary bg-washmen-primary text-white"
            : "border-washmen-pale-grey bg-white text-washmen-primary",
        )}
        aria-pressed={selected}
      >
        <Icon className="h-4 w-4" />
        <span className="text-[13px] font-medium">{label}</span>
      </button>
    );
  }

  // "card" variant
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 transition-all",
        selected
          ? "border-washmen-primary shadow-md"
          : "border-washmen-pale-grey hover:border-washmen-cloudy-blue",
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          selected ? "bg-washmen-primary text-white" : "bg-muted text-washmen-primary",
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <span className="text-[14px] font-semibold text-washmen-primary">{label}</span>
    </button>
  );
}
