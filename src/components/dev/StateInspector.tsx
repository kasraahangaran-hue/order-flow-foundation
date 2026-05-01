import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useOrderStore, type OrderState, type FlowType } from "@/stores/orderStore";
import { useUserPrefsStore } from "@/stores/userPrefsStore";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

const FLOW_TYPE_OPTIONS: Array<{
  value: FlowType;
  label: string;
  description: string;
}> = [
  {
    value: "newUser",
    label: "New User",
    description:
      "First-time orderer. Sees How It Works gate, in-person pickup default, FAQ on Select Service, hidden Auto-Approvals.",
  },
  {
    value: "existingUser",
    label: "Existing User",
    description: "Returning customer. Door pickup default, can skip Select Service.",
  },
  {
    value: "pricingPage",
    label: "Pricing Page",
    description:
      "Direct entry to Last Step from the native pricing page. Skips the order-builder steps.",
  },
];

function applyFlowType(store: OrderState, flow: FlowType) {
  store.setFlowType(flow);
}

function StateInspectorInner() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const store = useOrderStore();
  const flowType = store.flowType;
  const hasSavedAddress = store.addresses.length > 0;

  // Pending state for the Reset Flow checkbox. When true, tapping Confirm
  // calls store.reset() (clearing services / pickup / cart / etc.) before
  // navigating. When false, Confirm only navigates and leaves order state
  // intact.
  const [pendingReset, setPendingReset] = useState(false);

  const onPickFlow = (next: FlowType) => {
    applyFlowType(store, next);
  };

  const onToggleSavedAddress = () => {
    store.devSetHasSavedAddress(!hasSavedAddress);
  };

  const onConfirm = () => {
    haptics.medium();
    if (pendingReset) {
      store.reset();
      // For NU, also clear userPrefs so the user re-encounters first-time
      // gates (WF+ terms, folding apply-all prompt, etc.) — true "fresh
      // user" simulation. For RU and pricingPage, preserve userPrefs since
      // those user types are returning customers with existing prefs.
      if (store.flowType === "newUser") {
        useUserPrefsStore.getState().reset();
      }
      setPendingReset(false);
    }
    setOpen(false);

    // Route to the appropriate flow start screen.
    const after = useOrderStore.getState();
    if (after.flowType === "pricingPage") {
      navigate("/laundry/last-step");
      return;
    }
    if (after.flowType === "newUser") {
      if (after.addresses.length === 0) {
        navigate("/laundry/order-details/address/map");
      } else {
        navigate("/laundry/how-it-works");
      }
      return;
    }
    // RU
    navigate("/laundry/select-service");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press-effect fixed bottom-4 right-4 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        aria-label="Open State Inspector"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="no-scrollbar flex w-[340px] flex-col overflow-hidden p-0 sm:max-w-[340px]"
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="space-y-1 border-b border-border px-4 py-4 text-left">
              <h2 className="text-base font-semibold text-foreground">
                State Inspector
              </h2>
              <p className="text-xs text-muted-foreground">
                Stage settings, then tap Confirm to apply and navigate.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Current path: {location.pathname}
              </p>
            </div>

            {/* Settings — scroll area */}
            <div className="no-scrollbar flex-1 overflow-y-auto">
              <div className="px-4 py-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Flow Type
                </p>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Switches the customer journey variant — affects all screens.
                </p>

                <div className="flex flex-col gap-2">
                  {FLOW_TYPE_OPTIONS.map((opt) => {
                    const selected = flowType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onPickFlow(opt.value)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                            selected ? "border-primary" : "border-muted-foreground/40",
                          )}
                          aria-hidden
                        >
                          {selected ? (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          ) : null}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {opt.label}
                          </span>
                          <span className="text-[11px] leading-snug text-muted-foreground">
                            {opt.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border px-4 py-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Saved Address
                </p>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Simulate whether the user has a saved address. Affects the NU start screen on Confirm — no address routes to the map, has address routes to How It Works.
                </p>
                <button
                  type="button"
                  onClick={onToggleSavedAddress}
                  className={cn(
                    "press-effect flex h-[36px] w-full items-center justify-between rounded-md border bg-background px-3 text-sm font-medium transition-colors",
                    hasSavedAddress
                      ? "border-primary text-foreground"
                      : "border-border text-foreground hover:border-primary/40",
                  )}
                  aria-pressed={hasSavedAddress}
                >
                  <span>
                    {hasSavedAddress ? "Has saved address" : "No saved address"}
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-9 items-center rounded-full transition-colors",
                      hasSavedAddress ? "bg-primary" : "bg-muted",
                    )}
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full bg-background shadow transition-transform",
                        hasSavedAddress ? "translate-x-[18px]" : "translate-x-[2px]",
                      )}
                    />
                  </span>
                </button>
              </div>

              <div className="border-t border-border px-4 py-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Reset Flow
                </p>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  When checked, tapping Confirm clears the order state (services, pickup, cart, payment, instructions). Saved Address and Flow Type stay where you set them.
                </p>
                <button
                  type="button"
                  onClick={() => setPendingReset((v) => !v)}
                  className={cn(
                    "press-effect flex h-[36px] w-full items-center justify-between rounded-md border bg-background px-3 text-sm font-medium transition-colors",
                    pendingReset
                      ? "border-primary text-foreground"
                      : "border-border text-foreground hover:border-primary/40",
                  )}
                  aria-pressed={pendingReset}
                >
                  <span>{pendingReset ? "Reset on Confirm" : "Don't reset"}</span>
                  <span
                    className={cn(
                      "flex h-5 w-9 items-center rounded-full transition-colors",
                      pendingReset ? "bg-primary" : "bg-muted",
                    )}
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full bg-background shadow transition-transform",
                        pendingReset ? "translate-x-[18px]" : "translate-x-[2px]",
                      )}
                    />
                  </span>
                </button>
              </div>
            </div>

            {/* Sticky footer with Confirm CTA */}
            <div className="border-t border-border bg-background px-4 py-4">
              <button
                type="button"
                onClick={onConfirm}
                className="press-effect h-[44px] w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground"
              >
                Confirm
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// HANDOFF: The State Inspector is a developer tool that allows switching
// between flow types (New User / Existing User / Pricing Page) in non-prod
// environments. It must NOT render in production. The current allow-list
// blocks washmen.com and any *.washmen.com subdomain. If production runs
// on a different hostname (e.g. an ngrok tunnel, an internal CI domain,
// or a non-washmen.com vanity URL), update the allow-list before shipping.
// A safer pattern would be to gate via an env var like
// import.meta.env.MODE === "production".
export function StateInspector() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isProduction = host === "washmen.com" || host.endsWith(".washmen.com");
    if (isProduction) return null;
  }
  return <StateInspectorInner />;
}

export default StateInspector;
