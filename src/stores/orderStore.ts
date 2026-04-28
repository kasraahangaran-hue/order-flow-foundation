import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  date: string;
  slot: string;
  surcharge?: number;
}

export interface DriverInstructionsState {
  pickup: string;
  dropoff: string;
}

export interface OrderInstructionsState {
  specialRequests: string;
  photos: string[];
  folding: string | null;
  creases: string | null;
  starch: string | null;
  autoApprovals: boolean;
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
  autoApprovals: false,
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      flowType: "existingUser",
      services: initialServices,
      address: null,
      pickup: null,
      dropoff: null,
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
        set((s) => ({
          cart: s.cart.map((item, i) =>
            i === index ? { ...item, quantity: Math.max(0, quantity) } : item
          ),
        })),
      reset: () =>
        set({
          flowType: "existingUser",
          services: initialServices,
          address: null,
          pickup: null,
          dropoff: null,
          driverInstructions: null,
          orderInstructions: null,
          payment: null,
          promoCode: null,
          tip: 0,
          cart: [],
        }),
    }),
    {
      name: "washmen.laundry-order.v1",
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