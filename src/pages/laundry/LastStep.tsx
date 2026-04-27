import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Pencil,
  Tag,
} from "lucide-react";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { useOrderStore, type ServicesState } from "@/stores/orderStore";
import { nativeBridge } from "@/lib/nativeBridge";

interface LineItem {
  label: string;
  amount: number;
}

function buildLineItems(services: ServicesState): LineItem[] {
  const items: LineItem[] = [];
  if (services.washAndFold) items.push({ label: "Wash & Fold", amount: 75 });
  if (services.addPressing && services.pressingPrefs?.items?.length) {
    const pressingTotal = services.pressingPrefs.items.reduce((sum, name) => {
      if (name.includes("Shirts") || name.includes("Blouses")) return sum + 10;
      return sum + 9;
    }, 0);
    items.push({ label: "Press & Hang", amount: pressingTotal });
  }
  if (services.cleanAndPress) items.push({ label: "Clean & Press", amount: 25 });
  if (services.bedAndBath) items.push({ label: "Bed & Bath", amount: 30 });
  if (services.pressOnly) items.push({ label: "Press Only", amount: 20 });
  return items;
}

const DELIVERY_FEE = 15;
const TIP_OPTIONS: { label: string; value: number }[] = [
  { label: "No", value: 0 },
  { label: "AED 3", value: 3 },
  { label: "AED 5", value: 5 },
  { label: "AED 10", value: 10 },
];

export default function LastStep() {
  const navigate = useNavigate();
  const services = useOrderStore((s) => s.services);
  const payment = useOrderStore((s) => s.payment);
  const setPayment = useOrderStore((s) => s.setPayment);

  const [selectedTip, setSelectedTip] = useState(0);
  const [paymentExpanded, setPaymentExpanded] = useState(true);
  const [promosExpanded, setPromosExpanded] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const lineItems = useMemo(() => buildLineItems(services), [services]);
  const itemsTotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const estimatedTotal = itemsTotal + DELIVERY_FEE + selectedTip;
  const hasItems = lineItems.length > 0;

  // Seed payment method to Apple Pay if not set
  useEffect(() => {
    if (!payment) setPayment({ method: "Apple Pay" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paymentMethodLabel = payment?.method ?? "Apple Pay";

  const onPay = () => {
    if (!hasItems) return;
    haptics.medium();
    navigate("/order-confirmation");
  };

  const toggle = (setter: (v: boolean) => void, current: boolean) => {
    haptics.light();
    setter(!current);
  };

  return (
    <OrderLayout
      title="Last Step"
      step={4}
      onBack={() => navigate(-1)}
      footerSlot={
        <Button
          className="flex-1 h-12 text-sm font-semibold"
          disabled={!hasItems}
          onClick={onPay}
        >
          Pay with Apple Pay
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {!hasItems && (
          <div className="rounded-card bg-card p-4 text-sm text-muted-foreground">
            Add at least one service to continue.
          </div>
        )}

        {/* PROMOS */}
        <div className="rounded-card bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <button
            type="button"
            onClick={() => toggle(setPromosExpanded, promosExpanded)}
            className="press-effect flex w-full items-center gap-3 text-left"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Tag className="h-4 w-4 text-washmen-primary" />
            </div>
            <p className="flex-1 text-sm font-semibold leading-tight text-washmen-primary">
              Promos
            </p>
            {appliedPromo && !promosExpanded ? (
              <span className="rounded-md bg-washmen-secondary-aqua px-2 py-0.5 text-[11px] font-semibold text-washmen-primary">
                Applied
              </span>
            ) : promosExpanded ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
          {promosExpanded && (
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter promo code"
                  className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <Button
                  type="button"
                  className="h-10 px-4 text-sm font-semibold"
                  disabled={
                    !promoInput.trim() ||
                    appliedPromo === promoInput.trim().toUpperCase()
                  }
                  onClick={() => {
                    setAppliedPromo(promoInput.trim().toUpperCase());
                    setPromoInput("");
                    haptics.success();
                  }}
                >
                  Apply
                </Button>
              </div>
              {appliedPromo && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-washmen-primary">
                    Applied: {appliedPromo}
                  </p>
                  <button
                    type="button"
                    className="press-effect text-xs text-muted-foreground underline"
                    onClick={() => {
                      haptics.light();
                      setAppliedPromo(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PAYMENT SUMMARY */}
        <div className="overflow-hidden rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <button
            type="button"
            onClick={() => toggle(setPaymentExpanded, paymentExpanded)}
            className="press-effect flex w-full items-center gap-3 p-4 text-left"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <CreditCard className="h-4 w-4 text-washmen-primary" />
            </div>
            <p className="flex-1 text-sm font-semibold leading-tight text-washmen-primary">
              Payment Summary
            </p>
            {paymentExpanded ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
          {paymentExpanded && (
            <>
              <div className="space-y-2 border-t border-border px-4 pt-3 pb-4">
                {hasItems ? (
                  lineItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground">
                        AED {item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    No services selected
                  </p>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground">
                    AED {DELIVERY_FEE.toFixed(2)}*
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Driver Tip</span>
                  <span className="text-foreground">
                    AED {selectedTip.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-3">
                  <span className="text-sm font-bold text-washmen-primary">
                    Estimated Total
                  </span>
                  <span className="text-sm font-bold text-washmen-primary">
                    AED {estimatedTotal.toFixed(2)}**
                  </span>
                </div>
              </div>
              {/* Amber notes footer attached to Payment Summary */}
              {/* TEMP: hardcoded copy. Replace with Strapi fetch when keys are confirmed. */}
              <div className="space-y-3 bg-amber-50 px-4 py-4 text-amber-900">
                <p className="text-xs font-semibold leading-relaxed">
                  *Delivery Fee Increase
                </p>
                <p className="text-xs leading-relaxed">
                  Due to the increase of diesel & natural gas prices and its
                  impact on our supply chain, delivery fee has increased to
                  AED 15. Once the situation normalizes, we will reduce it
                  significantly. Thank you for your support during these times
                  🙏
                </p>
                <p className="text-xs leading-relaxed">
                  **The final amount, with discounts, will be determined after
                  sorting and processing at our facility. If your total bill
                  is less than AED 75, the difference will be charged to meet
                  the minimum order value.
                </p>
              </div>
            </>
          )}
        </div>

        {/* PAYMENT METHOD */}
        <button
          type="button"
          onClick={() => {
            haptics.light();
            nativeBridge.openSheet("payment_method", payment ?? undefined);
          }}
          className="press-effect w-full rounded-card bg-card p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <CreditCard className="h-4 w-4 text-washmen-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-washmen-primary">
                {paymentMethodLabel}
              </p>
              <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                Tap to change
              </p>
            </div>
            <Pencil
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        </button>

        {/* TIP SELECTOR */}
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="w-12 flex-shrink-0 text-center text-sm font-semibold text-foreground">
            Tip?
          </span>
          <div className="flex flex-1 gap-2">
            {TIP_OPTIONS.map((tip) => (
              <button
                key={tip.value}
                type="button"
                onClick={() => {
                  setSelectedTip(tip.value);
                  haptics.light();
                }}
                className={cn(
                  "press-effect flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                  selectedTip === tip.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {tip.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </OrderLayout>
  );
}
