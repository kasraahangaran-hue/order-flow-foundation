import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getDefaultPickup, getDefaultDropoff } from "@/data/scheduleDefaults";

export interface PressingPrefs {
  items: string[];
  pricePerItem: number;
}

export interface ServicesState {
  washAndFold: boolean;
  addPressing: boolean;
  pressingPrefs: PressingPrefs | null;
  cleanAndPress: boolean;
  bedAndBath: boolean;
  pressOnly: boolean;
}

export type AddressType = "apartment" | "villa" | "hotel" | "office";

export interface ApartmentFields {
  building: string;
  aptNumber: string;
  notes?: string;
}

export interface VillaFields {
  community: string;
  street: string;
  villaNumber: string;
  notes?: string;
}

export interface HotelFields {
  hotelName: string;
  roomNumber: string;
  guestName: string;
  notes?: string;
}

export interface OfficeFields {
  building: string;
  officeNumber: string;
  notes?: string;
}

export type AddressFields =
  | { type: "apartment"; fields: ApartmentFields }
  | { type: "villa"; fields: VillaFields }
  | { type: "hotel"; fields: HotelFields }
  | { type: "office"; fields: OfficeFields };

export type Address = {
  id: string;
  lat: number;
  lng: number;
  formattedAddress: string;
} & AddressFields;

/**
 * Pending address draft — populated as the user moves through the map → type
 * → details flow. Cleared when the address is saved or the flow is cancelled.
 */
export interface PendingAddressDraft {
  id?: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  type?: AddressType;
  fields?: ApartmentFields | VillaFields | HotelFields | OfficeFields;
}

export interface PickupState {
  mode: "door" | "in_person";
  date: string;
  slot: string;
}

export interface DropoffState {
  mode: "door" | "in_person";
  date: string;
  slot: string;
  surcharge?: number;
}

export interface DriverInstructionsState {
  pickup: DriverPickupChoice;
  dropoff: DriverDropoffChoice;
}

export type DriverPickupChoice =
  | "no_preference"
  | "at_concierge"
  | "ring_doorbell"
  | "knock_door"
  | "do_not_disturb_bags_outside"
  | "call_when_arrive";

export type DriverDropoffChoice =
  | "no_preference"
  | "at_concierge"
  | "hang_door_handle"
  | "ring_doorbell"
  | "knock_door"
  | "do_not_disturb_packages_outside"
  | "call_when_arrive";

export type StarchChoice = "none" | "light" | "medium" | "hard";
export type CreaseChoice = "no_preference" | "full_crease" | "fold_top_only";

export interface CreasesState {
  shirtsSleeveCreases: boolean;
  pantsFrontCreases: boolean;
  kandura: CreaseChoice;
  gathra: CreaseChoice;
}

export type WashAndFoldApprovalChoice =
  | "notify_me"
  | "transfer_clean_press"
  | "always_wash"
  | "do_not_wash";

export interface AutoApprovalsState {
  stainDamageAutoApprove: boolean;
  washAndFold: WashAndFoldApprovalChoice;
}

// Folding selection: keys are item type ids; value is true when selected.
export type FoldingSelection = Record<string, boolean>;

export type StainType =
  | "i_dont_know"
  | "coffee"
  | "food"
  | "oil"
  | "blood"
  | "other";

export type CleaningInstruction =
  | "no_preference"
  | "dry_clean_only"
  | "opticlean"
  | "cold_wash"
  | "high_temp";

export type OtherFlag =
  | "new_item"
  | "delicate"
  | "expensive"
  | "bad_smell";

export interface DelicateItem {
  id: string;
  photo: string;
  brand: string;
  stains: StainType[];
  cleaningInstruction: CleaningInstruction;
  others: OtherFlag[];
}

export interface OrderInstructionsState {
  specialRequests: string;
  delicateItems: DelicateItem[];
  folding: FoldingSelection | null;
  creases: CreasesState | null;
  starch: StarchChoice | null;
  autoApprovals: AutoApprovalsState | null;
}

export interface PaymentState {
  method: string;
  last4?: string;
}

export type TipValue = 0 | 3 | 5 | 10;

export type FlowType = "newUser" | "existingUser" | "pricingPage";

export interface CartItem {
  service: "washAndFold" | "cleanAndPress" | "bedAndBath" | "pressOnly";
  itemLabel: string;
  unitPrice: number;
  quantity: number;
  discountedPrice?: number;
}

export interface OrderState {
  flowType: FlowType;
  services: ServicesState;
  addresses: Address[];
  selectedAddressId: string | null;
  pendingAddressDraft: PendingAddressDraft | null;
  pickup: PickupState | null;
  dropoff: DropoffState | null;
  driverInstructions: DriverInstructionsState | null;
  orderInstructions: OrderInstructionsState | null;
  payment: PaymentState | null;
  promoCode: string | null;
  tip: TipValue;
  cart: CartItem[];

  // actions
  setFlowType: (t: FlowType) => void;
  setServices: (patch: Partial<ServicesState>) => void;
  setPressingPrefs: (prefs: PressingPrefs | null) => void;
  addAddress: (a: Address) => void;
  updateAddress: (a: Address) => void;
  deleteAddress: (id: string) => void;
  selectAddress: (id: string | null) => void;
  setPendingAddressDraft: (d: PendingAddressDraft | null) => void;
  setPickup: (p: PickupState | null) => void;
  setDropoff: (d: DropoffState | null) => void;
  setDriverInstructions: (d: DriverInstructionsState | null) => void;
  setOrderInstructions: (o: Partial<OrderInstructionsState> | null) => void;
  setPayment: (p: PaymentState | null) => void;
  setPromoCode: (c: string | null) => void;
  setTip: (t: TipValue) => void;
  setCart: (items: CartItem[]) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;
  reset: () => void;
}

const initialServices: ServicesState = {
  washAndFold: false,
  addPressing: false,
  pressingPrefs: null,
  cleanAndPress: false,
  bedAndBath: false,
  pressOnly: false,
};

const initialOrderInstructions: OrderInstructionsState = {
  specialRequests: "",
  delicateItems: [],
  folding: null,
  creases: null,
  starch: null,
  autoApprovals: null,
};

// HANDOFF — Seed address for dev/preview environments.
//
// In production, addresses come from the customer profile API:
// - RU users have ≥1 saved address from previous orders
// - NU users on first session have an empty address state and add one
//   through the address-add flow
//
// For dev/preview where there is no customer profile API, we seed this
// address for both NU and RU so testers can walk the flow without going
// through the address-add screens every time. Once the API integration
// lands, gate this seeding behind an env check (e.g. import.meta.env.DEV)
// or remove it entirely.
const SEED_ADDRESS: Address = {
  id: "seed_addr_default",
  type: "office" as const,
  lat: 25.2105,
  lng: 55.2796,
  formattedAddress: "Al Ferdous 4, DIFC, Dubai",
  fields: {
    building: "Al Ferdous 4",
    officeNumber: "118",
  },
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      flowType: "existingUser",
      services: initialServices,
      addresses: [SEED_ADDRESS],
      selectedAddressId: SEED_ADDRESS.id,
      pendingAddressDraft: null,
      pickup: getDefaultPickup(),
      dropoff: getDefaultDropoff(),
      driverInstructions: null,
      orderInstructions: null,
      payment: null,
      promoCode: null,
      tip: 0,
      cart: [],

      // TODO: When washAndFold is false on submit, exclude Press & Hang from the
      // priced order regardless of addPressing flag — needs to be handled in
      // cart/checkout logic.
      setFlowType: (flowType) =>
        set(() => ({
          flowType,
          // Re-derive the pickup default so NU lands on "in_person" and RU
          // on "door" when the flow type changes via the State Inspector.
          // Addresses are intentionally NOT cleared on flowType change —
          // for dev testing the seed address persists across both modes.
          // Production NU users will get an empty address state from the
          // customer profile API at session start, not from the web layer.
          pickup: getDefaultPickup(flowType === "newUser"),
        })),
      setServices: (patch) =>
        set((s) => ({ services: { ...s.services, ...patch } })),
      setPressingPrefs: (prefs) =>
        set((s) => ({
          services: {
            ...s.services,
            pressingPrefs: prefs,
            addPressing: !!(prefs && prefs.items.length > 0),
          },
        })),
      addAddress: (a) =>
        set((state) => ({
          addresses: [...state.addresses, a],
          selectedAddressId: a.id,
          pendingAddressDraft: null,
        })),
      updateAddress: (a) =>
        set((state) => ({
          addresses: state.addresses.map((x) => (x.id === a.id ? a : x)),
          pendingAddressDraft: null,
        })),
      deleteAddress: (id) =>
        set((state) => {
          if (state.selectedAddressId === id) return state;
          return {
            addresses: state.addresses.filter((x) => x.id !== id),
          };
        }),
      selectAddress: (id) => set({ selectedAddressId: id }),
      setPendingAddressDraft: (d) => set({ pendingAddressDraft: d }),
      setPickup: (pickup) => set({ pickup }),
      setDropoff: (dropoff) => set({ dropoff }),
      setDriverInstructions: (driverInstructions) => set({ driverInstructions }),
      setOrderInstructions: (patch) =>
        set((s) => ({
          orderInstructions: patch
            ? { ...(s.orderInstructions ?? initialOrderInstructions), ...patch }
            : null,
        })),
      setPayment: (payment) => set({ payment }),
      setPromoCode: (promoCode) => set({ promoCode }),
      setTip: (tip) => set({ tip }),
      setCart: (cart) => set({ cart }),
      updateCartItemQuantity: (index, quantity) =>
        set((s) => {
          if (quantity <= 0) {
            return { cart: s.cart.filter((_, i) => i !== index) };
          }
          return {
            cart: s.cart.map((item, i) =>
              i === index ? { ...item, quantity } : item
            ),
          };
        }),
      reset: () =>
        set((state) => ({
          // Preserve current flowType so dev-panel mode toggles aren't clobbered
          // and getDefaultPickup() picks the right mode for the active flow.
          flowType: state.flowType,
          services: initialServices,
          // Preserve existing addresses across reset. If somehow empty,
          // restore the seed for dev convenience. This applies to both NU
          // and RU — production behaviour comes from the customer profile
          // API, not the web layer.
          addresses: state.addresses.length > 0 ? state.addresses : [SEED_ADDRESS],
          selectedAddressId:
            state.selectedAddressId ??
            (state.addresses.length > 0 ? state.addresses[0].id : SEED_ADDRESS.id),
          pendingAddressDraft: null,
          pickup: getDefaultPickup(state.flowType === "newUser"),
          dropoff: getDefaultDropoff(),
          driverInstructions: null,
          orderInstructions: null,
          payment: null,
          promoCode: null,
          tip: 0,
          cart: [],
        })),
    }),
    {
      // v8: bumped from v7 to seed a default address.
      name: "washmen.laundry-order.v8",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        flowType: s.flowType,
        services: s.services,
        addresses: s.addresses,
        selectedAddressId: s.selectedAddressId,
        pickup: s.pickup,
        dropoff: s.dropoff,
        driverInstructions: s.driverInstructions,
        orderInstructions: s.orderInstructions,
        payment: s.payment,
        promoCode: s.promoCode,
        tip: s.tip,
        cart: s.cart,
      }),
    }
  )
);