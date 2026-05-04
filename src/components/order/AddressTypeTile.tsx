import { cn } from "@/lib/utils";
import type { AddressType } from "@/stores/orderStore";

import addressOfficeUrl from "@/assets/icons/address-office.svg";
import addressHotelUrl from "@/assets/icons/address-hotel.svg";
import addressVillaUrl from "@/assets/icons/address-villa.svg";
import addressApartmentUrl from "@/assets/icons/address-apartment.svg";

const ICON_URL_BY_TYPE: Record<AddressType, string> = {
  office: addressOfficeUrl,
  hotel: addressHotelUrl,
  villa: addressVillaUrl,
  apartment: addressApartmentUrl,
};

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
  const iconUrl = ICON_URL_BY_TYPE[type];
  const label = LABEL_BY_TYPE[type];

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "press-effect flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 transition-colors",
          selected
            ? "border-washmen-primary bg-washmen-primary text-white"
            : "border-washmen-pale-grey bg-white text-washmen-primary",
        )}
        aria-pressed={selected}
      >
        <img
          src={iconUrl}
          alt=""
          className="h-5 w-5 shrink-0 select-none"
          draggable={false}
        />
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
        "press-effect flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 transition-all",
        selected
          ? "border-washmen-primary shadow-md"
          : "border-washmen-pale-grey hover:border-washmen-cloudy-blue",
      )}
      aria-pressed={selected}
    >
      <img
        src={iconUrl}
        alt=""
        className="h-16 w-16 select-none"
        draggable={false}
      />
      <span className="text-[14px] font-semibold text-washmen-primary">{label}</span>
    </button>
  );
}
