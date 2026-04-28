import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useOrderStore, type OrderState } from "@/stores/orderStore";
import { cn } from "@/lib/utils";

type StoreApi = OrderState;

type ToggleVariant = {
  type: "toggle";
  label: string;
  read: (s: StoreApi) => boolean;
  write: (s: StoreApi, val: boolean) => void;
  disabled?: boolean;
  comment?: string;
};

type SelectVariant = {
  type: "select";
  label: string;
  options: string[];
  read: (s: StoreApi) => string;
  write: (s: StoreApi, val: string) => void;
  disabled?: boolean;
  comment?: string;
};

type MultiSelectVariant = {
  type: "multi-select";
  label: string;
  options: string[];
  read: (s: StoreApi) => string[];
  write: (s: StoreApi, val: string[]) => void;
  disabled?: boolean;
  comment?: string;
};

type Variant = ToggleVariant | SelectVariant | MultiSelectVariant;

const DUMMY_PHOTOS = [
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200",
  "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=200",
];

const ROUTE_VARIANTS: Record<string, Variant[]> = {
  "/laundry/select-service": [
    {
      type: "toggle",
      label: "Wash & Fold",
      read: (s) => s.services.washAndFold,
      write: (s, v) => s.setServices({ washAndFold: v }),
    },
    {
      type: "toggle",
      label: "Add Pressing",
      read: (s) => s.services.addPressing,
      write: (s, v) => s.setServices({ addPressing: v }),
    },
    {
      type: "multi-select",
      label: "Pressing items",
      options: ["T-Shirts/Polos", "Tank/Crop", "Shirts/Blouses"],
      read: (s) => s.services.pressingPrefs?.items ?? [],
      write: (s, v) =>
        s.setPressingPrefs(
          v.length ? { items: v, pricePerItem: 9 } : null
        ),
    },
    {
      type: "toggle",
      label: "Clean & Press",
      read: (s) => s.services.cleanAndPress,
      write: (s, v) => s.setServices({ cleanAndPress: v }),
    },
    {
      type: "toggle",
      label: "Bed & Bath",
      read: (s) => s.services.bedAndBath,
      write: (s, v) => s.setServices({ bedAndBath: v }),
    },
    {
      type: "toggle",
      label: "Press Only",
      read: (s) => s.services.pressOnly,
      write: (s, v) => s.setServices({ pressOnly: v }),
    },
  ],
  "/laundry/order-details": [
    {
      type: "toggle",
      label: "Address",
      read: (s) => !!s.address,
      write: (s, v) =>
        v
          ? s.setAddress({ line1: "108, Azurite tower", apartment: "Apt 4B" })
          : s.setAddress(null),
    },
    {
      type: "toggle",
      label: "Pickup",
      read: (s) => !!s.pickup,
      write: (s, v) =>
        v
          ? s.setPickup({ mode: "door", date: "Tomorrow", slot: "9:00 - 11:00 AM" })
          : s.setPickup(null),
    },
    {
      type: "toggle",
      label: "Dropoff",
      read: (s) => !!s.dropoff,
      write: (s, v) =>
        v
          ? s.setDropoff({ date: "In 2 days", slot: "6:00 - 8:00 PM" })
          : s.setDropoff(null),
    },
    {
      type: "toggle",
      label: "Driver Instructions",
      read: (s) => !!s.driverInstructions,
      write: (s, v) =>
        v
          ? s.setDriverInstructions({
              pickup: "Ring the bell twice",
              dropoff: "Leave at door",
            })
          : s.setDriverInstructions(null),
    },
  ],
  "/laundry/order-instructions": [
    {
      type: "toggle",
      label: "Special Requests",
      read: (s) => !!s.orderInstructions?.specialRequests,
      write: (s, v) =>
        s.setOrderInstructions(
          v ? { specialRequests: "Please use gentle cycle and low heat." } : { specialRequests: "" }
        ),
    },
    {
      type: "select",
      label: "Photo count",
      options: ["0", "1", "2", "3"],
      read: (s) => String(s.orderInstructions?.photos?.length ?? 0),
      write: (s, v) =>
        s.setOrderInstructions({
          photos: Array.from({ length: Number(v) }, (_, i) => DUMMY_PHOTOS[i % 4]),
        }),
    },
    {
      type: "toggle",
      label: "Folding",
      read: (s) => !!s.orderInstructions?.folding,
      write: (s, v) => s.setOrderInstructions({ folding: v ? "Standard" : null }),
    },
    {
      type: "toggle",
      label: "Creases",
      read: (s) => !!s.orderInstructions?.creases,
      write: (s, v) => s.setOrderInstructions({ creases: v ? "Yes" : null }),
    },
    {
      type: "toggle",
      label: "Starch",
      read: (s) => !!s.orderInstructions?.starch,
      write: (s, v) => s.setOrderInstructions({ starch: v ? "Light" : null }),
    },
    {
      type: "toggle",
      label: "Auto-Approvals",
      read: (s) => !!s.orderInstructions?.autoApprovals,
      write: (s, v) => s.setOrderInstructions({ autoApprovals: v }),
    },
  ],
  "/laundry/last-step": [
    {
      type: "select",
      label: "Payment Method",
      options: ["None", "Apple Pay", "Credit Card"],
      read: (s) => s.payment?.method ?? "None",
      write: (s, v) =>
        v === "None"
          ? s.setPayment(null)
          : s.setPayment({
              method: v === "Credit Card" ? "Card" : v,
              last4: v === "Credit Card" ? "1234" : undefined,
            }),
    },
    {
      type: "select",
      label: "Tip Amount",
      options: ["0", "3", "5", "10"],
      read: (s) => String(s.tip ?? 0),
      write: (s, v) => s.setTip(Number(v) as 0 | 3 | 5 | 10),
    },
    {
      type: "select",
      label: "Applied Promo",
      options: ["None", "FIRST10", "SUMMER25", "VIP15"],
      read: (s) => s.promoCode ?? "None",
      write: (s, v) => s.setPromoCode(v === "None" ? null : v),
    },
    {
      type: "toggle",
      label: "Minimum Order Met",
      read: () => false,
      write: () => {},
      disabled: true,
      comment: "TODO: requires threshold",
    },
  ],
};

const QUICK_NAV: { label: string; path: string }[] = [
  { label: "Select Service", path: "/laundry/select-service" },
  { label: "Order Details", path: "/laundry/order-details" },
  { label: "Order Instructions", path: "/laundry/order-instructions" },
  { label: "Last Step", path: "/laundry/last-step" },
];

function VariantRow({ variant }: { variant: Variant }) {
  // Subscribe to entire store for live updates; we only need re-renders.
  const store = useOrderStore();

  let control: React.ReactNode = null;

  if (variant.type === "toggle") {
    const checked = variant.read(store);
    control = (
      <Switch
        checked={checked}
        disabled={variant.disabled}
        onCheckedChange={(v) => variant.write(store, v)}
      />
    );
  } else if (variant.type === "select") {
    const value = variant.read(store);
    control = (
      <Select
        value={value}
        disabled={variant.disabled}
        onValueChange={(v) => variant.write(store, v)}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {variant.options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-xs">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  } else {
    const selected = variant.read(store);
    control = (
      <div className="flex flex-col gap-1.5">
        {variant.options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label
              key={opt}
              className="flex items-center gap-2 text-xs text-foreground"
            >
              <Checkbox
                checked={checked}
                disabled={variant.disabled}
                onCheckedChange={(v) => {
                  const next = v
                    ? [...selected, opt]
                    : selected.filter((o) => o !== opt);
                  variant.write(store, next);
                }}
              />
              {opt}
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-border py-3 last:border-0",
        variant.disabled && "opacity-50"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{variant.label}</p>
        {variant.comment && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {variant.comment}
          </p>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function StateInspector() {
  if (!import.meta.env.DEV) return null;

  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const reset = useOrderStore((s) => s.reset);

  const variants = ROUTE_VARIANTS[location.pathname];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
        aria-label="Open State Inspector"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-[340px] overflow-y-auto p-0 sm:max-w-[340px]"
        >
          <div className="flex flex-col">
            <SheetHeader className="space-y-1 border-b border-border px-4 py-4 text-left">
              <SheetTitle className="text-base">State Inspector</SheetTitle>
              <SheetDescription className="text-xs">
                {location.pathname}
              </SheetDescription>
            </SheetHeader>

            <div className="border-b border-border px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Quick nav
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {QUICK_NAV.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Variants
              </p>
              {variants ? (
                <div className="flex flex-col">
                  {variants.map((v) => (
                    <VariantRow key={v.label} variant={v} />
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No variants registered for this route.
                </p>
              )}
            </div>

            <div className="mt-auto border-t border-border px-4 py-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  reset();
                }}
              >
                Reset all state
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default StateInspector;