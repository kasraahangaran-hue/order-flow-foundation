import type {
  Address,
  AddressType,
} from "@/stores/orderStore";

export const ADDRESS_TYPE_LABEL: Record<AddressType, string> = {
  apartment: "Apartment",
  villa: "Villa",
  hotel: "Hotel",
  office: "Office",
};

/**
 * One-line summary of an address for compact display.
 */
export function summarizeAddress(address: Address): string {
  switch (address.type) {
    case "apartment":
      return `${address.fields.aptNumber}, ${address.fields.building}`;
    case "office":
      return `${address.fields.officeNumber}, ${address.fields.building}`;
    case "villa":
      return `Villa ${address.fields.villaNumber}, ${address.fields.community}`;
    case "hotel":
      return `Room ${address.fields.roomNumber}, ${address.fields.hotelName}`;
  }
}

/**
 * Two-line label/value pairs for the Select Address sheet card.
 */
export function addressCardLines(address: Address): {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
} {
  switch (address.type) {
    case "apartment":
      return {
        primaryLabel: "Apartment",
        primaryValue: address.fields.building,
        secondaryLabel: "Apt. #",
        secondaryValue: address.fields.aptNumber,
      };
    case "office":
      return {
        primaryLabel: "Office",
        primaryValue: address.fields.building,
        secondaryLabel: "Office #",
        secondaryValue: address.fields.officeNumber,
      };
    case "villa":
      return {
        primaryLabel: "Villa",
        primaryValue: address.fields.community,
        secondaryLabel: "Villa #",
        secondaryValue: address.fields.villaNumber,
      };
    case "hotel":
      return {
        primaryLabel: "Hotel",
        primaryValue: address.fields.hotelName,
        secondaryLabel: "Room #",
        secondaryValue: address.fields.roomNumber,
      };
  }
}