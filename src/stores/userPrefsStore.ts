import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FoldingSelection } from "./orderStore";

export interface UserPrefsState {
  // Folding is the only sheet that supports "Apply on All Future Orders".
  // When set, this preference is applied to new orders unless overridden per-order.
  folding: FoldingSelection | null;

  setFolding: (folding: FoldingSelection | null) => void;
  reset: () => void;
}

export const useUserPrefsStore = create<UserPrefsState>()(
  persist(
    (set) => ({
      folding: null,
      setFolding: (folding) => set({ folding }),
      reset: () => set({ folding: null }),
    }),
    {
      name: "washmen.user-prefs.v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);