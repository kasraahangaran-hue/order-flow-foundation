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
    // Send the user to the start of the flow so they see the reset state
    // immediately. Don't override pricingPage flowType — that's not its
    // start.
    if (store.flowType !== "pricingPage") {
      navigate("/laundry/select-service");
    }
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
                Quick Nav
              </p>
              <p className="mb-3 text-[11px] text-muted-foreground">
                Jump to specific screens for testing without walking the whole flow.
              </p>
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
