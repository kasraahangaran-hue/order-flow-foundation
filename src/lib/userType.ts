import { useOrderStore } from "@/stores/orderStore";

/**
 * Returns true when the active flow is for a brand-new user with zero
 * completed orders. In production, this comes from the user account state
 * (order_count === 0 per Jira GC-1116). In the prototype it reads the
 * orderStore's flowType.
 *
 * HANDOFF: Wire to the real customer profile API. The first-order flag is
 * authoritative server-side and persists across reinstall — it can only flip
 * from true → false via a successfully completed order.
 */
export function useIsFirstOrder(): boolean {
  return useOrderStore((s) => s.flowType === "newUser");
}

/**
 * Imperative variant for non-React contexts (helpers, default-value
 * computations). Reads the same store snapshot.
 */
export function getIsFirstOrder(): boolean {
  return useOrderStore.getState().flowType === "newUser";
}