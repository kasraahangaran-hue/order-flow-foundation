import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FoldingSelection } from "./orderStore";

export interface UserPrefsState {
  // Folding is the only sheet that supports "Apply on All Future Orders".
  // When set, this preference is applied to new orders unless overridden per-order.
  folding: FoldingSelection | null;

  // HANDOFF: In production this flag is account-level server-side state.
  // The web layer reads it and writes it via the same API used by iOS.
  // Persisted to localStorage here only for prototype purposes.
  //
  // The dev panel's Reset Flow ONLY clears this in NU mode (since NU
  // simulates a brand-new user with no prior preferences). For RU and
  // pricingPage, userPrefs persists across resets — those flows assume
  // a returning user with existing accepted terms.
  wfPlusTermsAccepted: boolean;
  setWfPlusTermsAccepted: (accepted: boolean) => void;

  setFolding: (folding: FoldingSelection | null) => void;
  reset: () => void;
}

export const useUserPrefsStore = create<UserPrefsState>()(
  persist(
    (set) => ({
      folding: null,
      wfPlusTermsAccepted: false,
      setWfPlusTermsAccepted: (accepted) => set({ wfPlusTermsAccepted: accepted }),
      setFolding: (folding) => set({ folding }),
      reset: () => set({ folding: null, wfPlusTermsAccepted: false }),
    }),
    {
      name: "washmen.user-prefs.v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);