/**
 * Native Bridge stub.
 *
 * Placeholder interface — Fawad will define the real one. For now, all calls
 * are logged and results are never delivered. When the iOS side exposes
 * `window.WashmenBridge`, swap implementations here.
 */

export type NativeSheetName =
  | "address"        // -> { address, apartment }
  // "pickup_schedule" and "dropoff_schedule" are now handled on web via
  // PickupSchedulingSheet and DropOffSheet. Per Fawad (2026-04-28), these moved
  // from native to web. Bridge stub kept for sheets still on native side.
  | "pickup_schedule" // -> { mode: 'door' | 'in_person', date, slot }
  | "dropoff_schedule" // -> { date, slot, surcharge }
  | "payment_method" // -> { method, last4 }
  | "driver_instructions" // -> { pickup, dropoff }
  | "folding"
  | "creases"
  | "starch"
  | "auto_approvals"
  | "photo_upload";

type Listener = (result: unknown) => void;
const listeners = new Map<NativeSheetName, Set<Listener>>();

export const nativeBridge = {
  openSheet(sheetName: NativeSheetName, currentValue?: unknown) {
    console.log("[NativeBridge stub] openSheet", sheetName, currentValue);
    // TODO: replace with window.WashmenBridge.openSheet when native side is ready
    if (typeof window !== "undefined" && window.WashmenBridge?.openSheet) {
      window.WashmenBridge.openSheet(sheetName, currentValue);
    }
  },

  onSheetResult(sheetName: NativeSheetName, callback: Listener) {
    console.log("[NativeBridge stub] onSheetResult listener for", sheetName);
    if (!listeners.has(sheetName)) listeners.set(sheetName, new Set());
    listeners.get(sheetName)!.add(callback);
    // TODO: wire to native callback. Returns an unsubscribe.
    return () => listeners.get(sheetName)?.delete(callback);
  },

  /** Internal — invoked by native shell (or test harness) to deliver a result. */
  _deliver(sheetName: NativeSheetName, result: unknown) {
    listeners.get(sheetName)?.forEach((cb) => cb(result));
  },
};

// Expose deliver hook so the native shell can call back into JS.
if (typeof window !== "undefined") {
  (window as unknown as { __washmenDeliver?: typeof nativeBridge._deliver }).__washmenDeliver =
    nativeBridge._deliver;
}