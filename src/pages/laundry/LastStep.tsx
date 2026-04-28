import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Pencil,
  Tag,
  Apple,
  Check,
  Plus,
  Info,
  Coins,
  Minus,
  ShoppingBag,
} from "lucide-react";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import {
  useOrderStore,
  type ServicesState,
  type CartItem,
} from "@/stores/orderStore";
import { nativeBridge } from "@/lib/nativeBridge";

/**
 * PROMO CODE LOGIC — checkout-stage only ("Available/Selected" state per spec).
 *
 * Backend integration TODO:
 * - Fetch user's eligible promos (replace AVAILABLE_PROMOS const)
 * - Check ALREADY_APPLIED_CODES against in-progress orders (single-use de-dupe)
 * - Validate typed codes server-side for eligibility
 * - On Place Order: commit selected promo (state moves to "Applied")
 * - Handle rollback when card fails / order cancelled / pickup failed
 *
 * Spec: https://www.notion.so/washmen/Promo-Code-Journey-Status-231e9f936ef18071a202ca9a837a7e26
 */

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

const MIN_ORDER_AED = 75; // Minimum order value threshold
const DELIVERY_FEE = 15;
const TIP_OPTIONS: { label: string; value: number }[] = [
  { label: "No", value: 0 },
  { label: "AED 3", value: 3 },
  { label: "AED 5", value: 5 },
  { label: "AED 10", value: 10 },
];

interface PromoData {
  code: string;
  subtitle: string;
  used: number;
  total: number;
  discountAed?: number;
  discountPct?: number;
}

// Mock list of available promos. Replace with backend fetch when available.
const AVAILABLE_PROMOS: PromoData[] = [
  { code: "MYLAUNDRY25", subtitle: "AED 50 off on 3 laundry orders!", used: 1, total: 11, discountAed: 50 },
  { code: "FIRSTORDER10", subtitle: "10% off your first order", used: 0, total: 1, discountPct: 10 },
  { code: "WEEKEND15", subtitle: "AED 15 off weekend orders", used: 1, total: 3, discountAed: 15 },
];

// Codes already applied to in-progress orders (single-use de-dupe).
// TODO: populate from backend when wired up.
const ALREADY_APPLIED_CODES = new Set<string>();

function calculatePromoDiscount(code: string | null, itemsTotal: number): number {
  if (!code) return 0;
  const promo = AVAILABLE_PROMOS.find((p) => p.code === code);
  if (!promo) return 0;
  let amount = 0;
  if (promo.discountAed) amount = promo.discountAed;
  else if (promo.discountPct) amount = (itemsTotal * promo.discountPct) / 100;
  return Math.min(amount, itemsTotal);
}

interface PromoProgressDotsProps {
  used: number;
  total: number;
}

function PromoProgressDots({ used, total }: PromoProgressDotsProps) {
  return (
    <div className="flex h-[9px] items-center overflow-hidden" style={{ width: 139 }}>
      {Array.from({ length: total }).map((_, i) => (
        <Fragment key={i}>
          <div
            className={cn(
              "h-[9px] w-[9px] shrink-0 rounded-full",
              i < used
                ? "bg-washmen-primary"
                : "border border-washmen-primary bg-transparent"
            )}
          />
          {i < total - 1 && (
            <div
              className={cn(
                "h-[2px] w-[4px] shrink-0",
                i < used - 1 ? "bg-washmen-primary" : "bg-[#EFEFF4]"
              )}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

interface PromoCardProps {
  promo: PromoData;
  selected: boolean;
  onToggle: () => void;
}

function PromoCard({ promo, selected, onToggle }: PromoCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "press-effect w-[227px] shrink-0 rounded-[8px] border border-washmen-primary p-2 text-left",
        selected ? "bg-washmen-light-green" : "bg-white"
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-1">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold leading-[18px] tracking-[0.1px] text-washmen-primary">
              {promo.code}
            </p>
            <p className="mt-0.5 text-[10px] font-light leading-[14px] tracking-[0.3px] text-washmen-primary">
              {promo.subtitle}
            </p>
          </div>
          <div
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-washmen-primary",
              selected ? "bg-washmen-primary" : "bg-white"
            )}
          >
            {selected ? (
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            ) : (
              <Plus className="h-3 w-3 text-washmen-primary" strokeWidth={2.5} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <PromoProgressDots used={promo.used} total={promo.total} />
          <span className="text-[8px] font-light tracking-[0.3px] text-washmen-primary">
            {promo.used}/{promo.total}
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            // eslint-disable-next-line no-console
            console.log("View promo details", promo.code);
          }}
        >
          <Info className="h-4 w-4 text-washmen-primary" strokeWidth={2} />
          <span className="text-[10px] font-light tracking-[0.3px] text-washmen-primary underline underline-offset-2">
            View Details
          </span>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Itemized (pricing-page) Payment Summary helpers                     */
/* ------------------------------------------------------------------ */

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

function QuantityStepper({ value, onChange, min = 0, max = 10 }: QuantityStepperProps) {
  const minDisabled = value <= min;
  const maxDisabled = value >= max;
  return (
    <div className="flex h-8 w-20 items-center justify-between rounded-[6px] border border-washmen-primary bg-washmen-light-green px-[10px] py-[3px]">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={minDisabled}
        onClick={() => {
          haptics.light();
          onChange(value - 1);
        }}
        className={cn("press-effect", minDisabled && "opacity-50")}
      >
        <Minus className="h-4 w-4 text-washmen-primary" strokeWidth={2} />
      </button>
      <span className="text-[14px] tracking-[0.1px] text-washmen-primary">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={maxDisabled}
        onClick={() => {
          haptics.light();
          onChange(value + 1);
        }}
        className={cn("press-effect", maxDisabled && "opacity-50")}
      >
        <Plus className="h-4 w-4 text-washmen-primary" strokeWidth={2} />
      </button>
    </div>
  );
}

const SERVICE_META: Record<
  CartItem["service"],
  { label: string; bagColor: string }
> = {
  washAndFold: { label: "Wash & Fold", bagColor: "text-[#02FFF7]" },
  cleanAndPress: { label: "Clean & Press", bagColor: "text-[#A4FF00]" },
  bedAndBath: { label: "Bed & Bath", bagColor: "text-[#FF8CF9]" },
  pressOnly: { label: "Press Only", bagColor: "text-[#E7E7E7]" },
};

interface PaymentSummaryFlatProps {
  lineItems: { label: string; amount: number }[];
  selectedPromoCode: string | null;
  promoDiscount: number;
  selectedTip: number;
  estimatedTotal: number;
  expanded: boolean;
  onToggleExpanded: () => void;
}

function PaymentSummaryFlat({
  lineItems,
  selectedPromoCode,
  promoDiscount,
  selectedTip,
  estimatedTotal,
  expanded,
  onToggleExpanded,
}: PaymentSummaryFlatProps) {
  const hasItems = lineItems.length > 0;
  return (
    <div className="overflow-hidden rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="press-effect flex h-[52px] w-full items-center gap-3 px-3 py-0 text-left"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <CreditCard className="h-4 w-4 text-washmen-primary" />
        </div>
        <p className="flex-1 text-sm font-semibold leading-tight text-washmen-primary">
          Payment Summary
        </p>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <>
          <div className="space-y-2 border-t border-border px-4 pt-3 pb-4">
            {hasItems &&
              lineItems.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground">AED {item.amount.toFixed(2)}</span>
                </div>
              ))}
            {selectedPromoCode && promoDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">Promo Discount ({selectedPromoCode})</span>
                <span className="text-emerald-700">- AED {promoDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-foreground">AED {DELIVERY_FEE.toFixed(2)}*</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Driver Tip</span>
              <span className="text-foreground">AED {selectedTip.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-3">
              <span className="text-sm font-bold text-washmen-primary">Estimated Total</span>
              <span className="text-sm font-bold text-washmen-primary">
                AED {estimatedTotal.toFixed(2)}**
              </span>
            </div>
          </div>
          <PaymentSummaryFootnotes />
        </>
      )}
    </div>
  );
}

function PaymentSummaryFootnotes() {
  return (
    <div className="space-y-3 bg-amber-50 px-4 py-4 text-amber-900">
      <p className="text-xs font-semibold leading-relaxed">*Delivery Fee Increase</p>
      <p className="text-[10px] leading-relaxed">
        Due to the increase of diesel & natural gas prices and its impact on our supply chain,
        delivery fee has increased to AED 15. Once the situation normalizes, we will reduce it
        significantly. Thank you for your support during these times 🙏
      </p>
      <p className="text-[10px] leading-relaxed">
        **The final amount, with discounts, will be determined after sorting and processing at our
        facility. If your total bill is less than AED 75, the difference will be charged to meet
        the minimum order value.
      </p>
    </div>
  );
}

interface PaymentSummaryItemizedProps {
  cart: CartItem[];
  services: ServicesState;
  selectedPromoCode: string | null;
  promoDiscount: number;
  selectedTip: number;
  estimatedTotal: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

function PaymentSummaryItemized({
  cart,
  services,
  selectedPromoCode,
  promoDiscount,
  selectedTip,
  estimatedTotal,
  expanded,
  onToggleExpanded,
  onUpdateQuantity,
}: PaymentSummaryItemizedProps) {
  // Group items by service, preserving original cart index for stepper updates
  const groups = useMemo(() => {
    const map = new Map<CartItem["service"], { item: CartItem; index: number }[]>();
    cart.forEach((item, index) => {
      const arr = map.get(item.service) ?? [];
      arr.push({ item, index });
      map.set(item.service, arr);
    });
    return Array.from(map.entries());
  }, [cart]);

  return (
    <div className="overflow-hidden rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="press-effect flex h-[52px] w-full items-center gap-3 px-3 py-0 text-left"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <CreditCard className="h-4 w-4 text-washmen-primary" />
        </div>
        <p className="flex-1 text-sm font-semibold leading-tight text-washmen-primary">
          Payment Summary
        </p>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <>
          <div className="space-y-4 border-t border-border px-4 pt-3 pb-4">
            {groups.map(([service, entries]) => {
              const meta = SERVICE_META[service];
              return (
                <div key={service} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag
                      className={cn("h-4 w-4", meta.bagColor)}
                      strokeWidth={2}
                    />
                    <span className="text-sm font-semibold text-washmen-primary">
                      {meta.label}
                    </span>
                  </div>
                  <div className="space-y-2 pl-6">
                    {entries.map(({ item, index }) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">{item.itemLabel}</p>
                          <p className="text-xs">
                            {item.discountedPrice !== undefined ? (
                              <>
                                <span className="text-muted-foreground line-through">
                                  AED {item.unitPrice.toFixed(2)}
                                </span>{" "}
                                <span className="font-medium text-emerald-700">
                                  AED {item.discountedPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                AED {item.unitPrice.toFixed(2)} each
                              </span>
                            )}
                          </p>
                        </div>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(next) => onUpdateQuantity(index, next)}
                        />
                      </div>
                    ))}
                    {service === "washAndFold" && services.addPressing &&
                      services.pressingPrefs?.items?.length ? (
                      <p className="text-xs text-muted-foreground">
                        + Press & Hang ({services.pressingPrefs.items.length} items)
                      </p>
                    ) : null}
                    {service === "washAndFold" && services.pressingPrefs ? null : null}
                  </div>
                </div>
              );
            })}

            <div className="rounded-md bg-cyan-50 px-3 py-2 text-[11px] text-cyan-900">
              Items above are priced per item. Final total will be confirmed after sorting at our
              facility.
            </div>

            {selectedPromoCode && promoDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">Promo Discount ({selectedPromoCode})</span>
                <span className="text-emerald-700">- AED {promoDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-foreground">AED {DELIVERY_FEE.toFixed(2)}*</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Driver Tip</span>
              <span className="text-foreground">AED {selectedTip.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-3">
              <span className="text-sm font-bold text-washmen-primary">Estimated Total</span>
              <span className="text-sm font-bold text-washmen-primary">
                AED {estimatedTotal.toFixed(2)}**
              </span>
            </div>
          </div>
          <PaymentSummaryFootnotes />
        </>
      )}
    </div>
  );
}

export default function LastStep() {
  const navigate = useNavigate();
  const services = useOrderStore((s) => s.services);
  const payment = useOrderStore((s) => s.payment);
  const setPayment = useOrderStore((s) => s.setPayment);
  const flowType = useOrderStore((s) => s.flowType);
  const cart = useOrderStore((s) => s.cart);
  const updateCartItemQuantity = useOrderStore((s) => s.updateCartItemQuantity);
  const isPricingFlow = flowType === "pricingPage";

  const [selectedTip, setSelectedTip] = useState(0);
  const [paymentExpanded, setPaymentExpanded] = useState(true);
  const [promosExpanded, setPromosExpanded] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [inputMessage, setInputMessage] = useState<
    { type: "error" | "success"; text: string } | null
  >(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string | null>(null);

  const lineItems = useMemo(() => buildLineItems(services), [services]);
  const flatItemsTotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const cartItemsTotal = useMemo(
    () =>
      cart.reduce(
        (sum, i) => sum + (i.discountedPrice ?? i.unitPrice) * i.quantity,
        0
      ),
    [cart]
  );
  const itemsTotal = isPricingFlow ? cartItemsTotal : flatItemsTotal;
  const promoDiscount = calculatePromoDiscount(selectedPromoCode, itemsTotal);
  const estimatedTotal = Math.max(
    0,
    itemsTotal + DELIVERY_FEE + selectedTip - promoDiscount
  );

  // Seed payment method to Apple Pay if not set
  useEffect(() => {
    if (!payment) setPayment({ method: "Apple Pay" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paymentMethodLabel =
    payment?.method === "Card" && payment.last4
      ? `Card **** ${payment.last4}`
      : payment?.method ?? "Apple Pay";
  const isApplePay = (payment?.method ?? "Apple Pay") === "Apple Pay";
  const PaymentIcon = isApplePay ? Apple : CreditCard;

  const availableCount = AVAILABLE_PROMOS.length;
  const hasAvailablePromos = availableCount > 0;

  const togglePromo = (code: string) => {
    haptics.light();
    setSelectedPromoCode((curr) => (curr === code ? null : code));
    setPromoInput("");
    setInputMessage(null);
  };

  const flashMessage = (msg: { type: "error" | "success"; text: string }, ms = 2500) => {
    setInputMessage(msg);
    window.setTimeout(() => setInputMessage(null), ms);
  };

  const tryApplyTypedCode = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (ALREADY_APPLIED_CODES.has(code)) {
      flashMessage({
        type: "error",
        text: "This promo code has already been applied. Please try another one.",
      }, 3000);
      return;
    }
    const match = AVAILABLE_PROMOS.find((p) => p.code === code);
    if (match) {
      setSelectedPromoCode(match.code);
      setPromoInput("");
      haptics.success();
      flashMessage({ type: "success", text: "✔ Code Applied" }, 2000);
    } else {
      flashMessage({
        type: "error",
        text: "Invalid promo code. Please try a different one.",
      }, 3000);
    }
  };

  const ctaEnabled = !!payment;
  const ctaLabel = payment
    ? payment.method === "Apple Pay"
      ? "Pay with Apple Pay"
      : `Pay AED ${estimatedTotal.toFixed(2)}`
    : "Add Payment Method";

  const onPay = () => {
    if (!ctaEnabled) {
      haptics.light();
      nativeBridge.openSheet("payment_method", payment ?? undefined);
      return;
    }
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
          disabled={!ctaEnabled}
          onClick={onPay}
        >
          {ctaLabel}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* PROMOS */}
        <div className="overflow-hidden rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <button
            type="button"
            onClick={() => toggle(setPromosExpanded, promosExpanded)}
            className="press-effect flex h-[52px] w-full items-center gap-3 px-3 py-0 text-left"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Tag className="h-4 w-4 text-washmen-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight text-washmen-primary">
                Promos
                {hasAvailablePromos && (
                  <span className="text-xs font-light">
                    {" "}({availableCount} codes available)
                  </span>
                )}
              </p>
            </div>
            {promosExpanded ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
          {promosExpanded && (
            <div className="flex flex-col gap-3 border-t border-[#efeff4] px-4 pt-1 pb-4">
              {hasAvailablePromos && (
                <div className="-mx-4 flex items-center gap-4 overflow-x-auto px-4 pt-3">
                  {AVAILABLE_PROMOS.map((promo) => (
                    <PromoCard
                      key={promo.code}
                      promo={promo}
                      selected={selectedPromoCode === promo.code}
                      onToggle={() => togglePromo(promo.code)}
                    />
                  ))}
                </div>
              )}
              <div>
                <div className="rounded-[6px] border border-[#F2F3F8] bg-white px-4 py-3">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        tryApplyTypedCode();
                      }
                    }}
                    onBlur={() => {
                      if (promoInput.trim()) tryApplyTypedCode();
                    }}
                    placeholder="Type your promocode here"
                    className="w-full bg-transparent text-left text-[14px] text-washmen-primary placeholder:text-[#C3C8DB] focus:outline-none"
                  />
                </div>
                <div className="mt-1 h-4 text-left text-[11px]">
                  {inputMessage && (
                    <p
                      className={cn(
                        inputMessage.type === "error"
                          ? "text-red-500"
                          : "text-washmen-success"
                      )}
                    >
                      {inputMessage.text}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-8 border-t border-[#EFEFF4] pt-4">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Coins className="h-4 w-4 text-washmen-primary" />
                  </div>
                  <span className="text-sm text-washmen-primary">Credits</span>
                </div>
                <p className="text-[10px] text-washmen-secondary-700">
                  You have <span className="font-semibold">AED 0 in Credits</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PAYMENT SUMMARY */}
        {isPricingFlow ? (
          <PaymentSummaryItemized
            cart={cart}
            services={services}
            selectedPromoCode={selectedPromoCode}
            promoDiscount={promoDiscount}
            selectedTip={selectedTip}
            estimatedTotal={estimatedTotal}
            expanded={paymentExpanded}
            onToggleExpanded={() => toggle(setPaymentExpanded, paymentExpanded)}
            onUpdateQuantity={updateCartItemQuantity}
          />
        ) : (
          <PaymentSummaryFlat
            lineItems={lineItems}
            selectedPromoCode={selectedPromoCode}
            promoDiscount={promoDiscount}
            selectedTip={selectedTip}
            estimatedTotal={estimatedTotal}
            expanded={paymentExpanded}
            onToggleExpanded={() => toggle(setPaymentExpanded, paymentExpanded)}
          />
        )}

        {/* PAYMENT METHOD */}
        <button
          type="button"
          onClick={() => {
            haptics.light();
            nativeBridge.openSheet("payment_method", payment ?? undefined);
          }}
          className="press-effect w-full rounded-card bg-card px-3 py-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <PaymentIcon className="h-4 w-4 text-washmen-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-washmen-primary">
                {paymentMethodLabel}
              </p>
              {/* TEMP: hardcoded copy. Confirm Strapi key for facility-charge note. */}
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                We will charge your card after receiving your items at our
                facility. AED 15 delivery fee will be applied.
              </p>
            </div>
            <Pencil
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        </button>

        {/* TIP SELECTOR */}
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="w-12 shrink-0 text-center text-sm font-semibold text-foreground">
            Tip?
          </span>
          <div className="flex flex-1 gap-[10px]">
            {TIP_OPTIONS.map((tip) => (
              <button
                key={tip.value}
                type="button"
                onClick={() => {
                  setSelectedTip(tip.value);
                  haptics.light();
                }}
                className={cn(
                  "press-effect flex h-8 w-[60px] items-center justify-center rounded-[5px] border text-[14px] font-normal text-washmen-primary transition-colors",
                  selectedTip === tip.value
                    ? tip.value === 0
                      ? "border-washmen-red bg-washmen-secondary-red"
                      : "border-washmen-primary bg-washmen-light-green"
                    : "border-washmen-secondary-300 bg-white"
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
