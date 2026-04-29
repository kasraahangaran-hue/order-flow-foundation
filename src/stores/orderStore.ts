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

export interface AddressState {
  line1: string;
  apartment?: string;
  lat?: number;
  lng?: number;
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

// Folding selection: keys are item type ids; value is true when selected.
export type FoldingSelection = Record<string, boolean>;

export interface OrderInstructionsState {
  specialRequests: string;
  photos: string[];
  folding: FoldingSelection | null;
  creases: CreasesState | null;
  starch: StarchChoice | null;
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
  address: AddressState | null;
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
  setAddress: (a: AddressState | null) => void;
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
  photos: [],
  folding: null,
  creases: null,
  starch: null,
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      flowType: "existingUser",
      services: initialServices,
      address: null,
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
      setFlowType: (flowType) => set({ flowType }),
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
      setAddress: (address) => set({ address }),
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
        set({
          flowType: "existingUser",
          services: initialServices,
          address: null,
          pickup: getDefaultPickup(),
          dropoff: getDefaultDropoff(),
          driverInstructions: null,
          orderInstructions: null,
          payment: null,
          promoCode: null,
          tip: 0,
          cart: [],
        }),
    }),
    {
      // v2: bumped from v1 to invalidate old locale-formatted date strings.
      // Old persisted state had pickup.date like "Tue, Apr 28" which broke formatRelativeDay.
      name: "washmen.laundry-order.v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        flowType: s.flowType,
        services: s.services,
        address: s.address,
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