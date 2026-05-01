import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useOrderStore, type OrderState, type FlowType } from "@/stores/orderStore";
import { cn } from "@/lib/utils";

const FLOW_TYPE_OPTIONS: { label: string; value: FlowType; description: string }[] = [
  {
    label: "New User",
    value: "newUser",
    description:
      "First-time user — gated to add an address before reaching services (gating logic TBD).",
  },
  {
    label: "Existing User",
    value: "existingUser",
    description: "Returning user with a saved address — default flow.",
  },
  {
    label: "Pricing Page",
    value: "pricingPage",
    description:
      "Skips Select Service / Order Details / Order Instructions and goes straight to Last Step with an itemized cart.",
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

  const onPickFlow = (next: FlowType) => {
    applyFlowType(store, next);
    // Re-initialize order defaults under the new flowType. Since reset()
    // preserves flowType, the just-set value is honoured and getDefaultPickup()
    // returns the right mode (in_person for NU, door for RU).
    store.reset();
    if (next === "pricingPage") {
      navigate("/laundry/last-step");
    }
  };

  const onResetFlow = () => {
    store.reset();
    setOpen(false);
    // Route to the appropriate flow start screen for the current mode.
    // - NU + no saved address: address map (NU enters address-add flow)
    // - NU + has saved address: How It Works (educational gate before order)
    // - RU: Select Service (skips the NU intro screens)
    // - pricingPage: stays where it is — caller (onPickFlow) handles routing
    const after = useOrderStore.getState();
    if (after.flowType === "pricingPage") return;
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

  const hasSavedAddress = store.addresses.length > 0;
  const onToggleSavedAddress = () => {
    store.devSetHasSavedAddress(!hasSavedAddress);
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
          className="no-scrollbar w-[340px] overflow-y-auto p-0 sm:max-w-[340px]"
        >
          <div className="flex flex-col">
            <SheetHeader className="space-y-1 border-b border-border px-4 py-4 text-left">
              <SheetTitle className="text-base">State Inspector</SheetTitle>
              <SheetDescription className="text-xs">
                {location.pathname}
              </SheetDescription>
            </SheetHeader>

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
                Reset Flow
              </p>
              <p className="mb-3 text-[11px] text-muted-foreground">
                Clears cart, services, schedule, payment, promo, tip, instructions. Preserves your saved address and the current flow type.
              </p>
              <button
                type="button"
                onClick={onResetFlow}
                className="press-effect h-[36px] w-full rounded-md border border-border bg-background text-sm font-medium text-foreground hover:border-primary/40"
              >
                Reset Flow
              </button>
            </div>

            <div className="border-t border-border px-4 py-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Saved Address
              </p>
              <p className="mb-3 text-[11px] text-muted-foreground">
                Simulate whether the user has a saved address. Affects the NU Reset Flow start screen (map vs. How It Works).
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
                  {hasSavedAddress
                    ? "Has saved address"
                    : "No saved address"}
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
                Quick Nav
              </p>
              <p className="mb-3 text-[11px] text-muted-foreground">
                Jump to specific screens for testing without walking the whole flow.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/laundry/how-it-works");
                  }}
                  className="press-effect h-[36px] w-full rounded-md border border-border bg-background text-sm font-medium text-foreground hover:border-primary/40"
                >
                  How It Works
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/laundry/prepare-your-bags");
                  }}
                  className="press-effect h-[36px] w-full rounded-md border border-border bg-background text-sm font-medium text-foreground hover:border-primary/40"
                >
                  Prepare Your Bags
                </button>
              </div>
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
