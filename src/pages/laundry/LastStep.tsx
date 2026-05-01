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
import {
  AVAILABLE_PROMOS,
  ALREADY_APPLIED_CODES,
  calculatePromoDiscount,
  type PromoData,
} from "@/data/promos";
import { PromoDetailsSheet } from "@/components/order/PromoDetailsSheet";

// Service-specific bag icons used in the cart row indicator. Each
// service has its own colored bag — visually distinct so users can
// scan their order at a glance. Files live in src/assets/icons/.
import bagWashFoldUrl from "@/assets/icons/bag-wash-fold.svg";
import bagCleanPressUrl from "@/assets/icons/bag-clean-press.svg";
import bagBedBathUrl from "@/assets/icons/bag-bed-bath.svg";
import bagPressOnlyUrl from "@/assets/icons/bag-press-only.svg";
import bagShoeBagUrl from "@/assets/icons/bag-shoe-bag.svg";

const BAG_ICON_BY_SERVICE: Record<CartItem["service"], string> = {
  washAndFold: bagWashFoldUrl,
  cleanAndPress: bagCleanPressUrl,
  bedAndBath: bagBedBathUrl,
  pressOnly: bagPressOnlyUrl,
};
// Reserved for future shoe & bag care service.
void bagShoeBagUrl;

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
  if (services.bedAndBath) items.push({ label: "Bed & Bath", amount: 85 });
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
                i < used - 1 ? "bg-washmen-primary" : "bg-washmen-light-grey"
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
  onViewDetails: () => void;
}

function PromoCard({ promo, selected, onToggle, onViewDetails }: PromoCardProps) {
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
            haptics.light();
            onViewDetails();
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
  { label: string }
> = {
  washAndFold: { label: "Wash & Fold" },
  cleanAndPress: { label: "Clean & Press" },
  bedAndBath: { label: "Bed & Bath" },
  pressOnly: { label: "Press Only" },
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
          <ChevronUp className="h-4 w-4 shrink-0 text-washmen-primary" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-washmen-primary" />
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
      <p className="text-[10px] font-normal leading-relaxed">*Delivery Fee Increase</p>
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
  onViewPromoDetails: (promo: PromoData) => void;
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
  onViewPromoDetails,
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
          <ChevronUp className="h-4 w-4 shrink-0 text-washmen-primary" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-washmen-primary" />
        )}
      </button>
      {expanded && (
        <>
          <div className="space-y-4 border-t border-border px-4 pt-3 pb-4">
            {groups.map(([service, entries]) => {
              const meta = SERVICE_META[service];
              const hasPressing =
                service === "washAndFold" &&
                services.addPressing &&
                !!services.pressingPrefs?.items?.length;
              // No dedicated Folding sub-row exists yet in the cart model.
              const hasFolding = false;
              return (
                <div key={service} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={BAG_ICON_BY_SERVICE[service]}
                      alt=""
                      className="h-5 w-5 select-none shrink-0"
                      draggable={false}
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
                          <p className="text-[13px] leading-[18px] tracking-[0.4px]">
                            {item.discountedPrice !== undefined ? (
                              <>
                                <span className="text-washmen-discount">
                                  AED {item.discountedPrice.toFixed(2)}
                                </span>{" "}
                                <span className="text-washmen-secondary-300 line-through">
                                  AED {item.unitPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-washmen-secondary-700">
                                AED {item.unitPrice.toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(next) => onUpdateQuantity(index, next)}
                          min={0}
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
                  {service === "washAndFold" && (hasPressing || hasFolding) && (
                    // TODO: Make copy dynamic based on which sub-services are actually selected (only Press & Hang vs only Folding vs both)
                    <div className="mt-2 rounded-[8px] bg-washmen-light-aqua p-2">
                      <p className="text-[12px] font-light leading-[18px] tracking-[0.1px] text-washmen-primary">
                        <span className="font-medium">Press & Hang </span>
                        <span>and </span>
                        <span className="font-medium">Folding </span>
                        <span>will be priced per item after we receive your order</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom summary rows — tighter spacing matching PaymentSummaryFlat */}
            <div className="space-y-2">
              {selectedPromoCode && promoDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-washmen-primary">
                    <span>{selectedPromoCode}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        haptics.light();
                        const promo = AVAILABLE_PROMOS.find(
                          (p) => p.code === selectedPromoCode
                        );
                        if (promo) onViewPromoDetails(promo);
                      }}
                      className="press-effect flex h-5 w-5 items-center justify-center rounded-full bg-secondary"
                      aria-label="View promo details"
                    >
                      <Info className="h-3 w-3 text-washmen-primary" strokeWidth={2} />
                    </button>
                  </span>
                  <span className="text-washmen-primary">
                    -AED {promoDiscount.toFixed(2)}
                  </span>
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
              <div className="flex items-center justify-between border-t border-dashed border-border pt-3">
                <span className="text-sm font-bold text-washmen-primary">Estimated Total</span>
                <span className="text-sm font-bold text-washmen-primary">
                  AED {estimatedTotal.toFixed(2)}**
                </span>
              </div>
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
  const [detailsPromo, setDetailsPromo] = useState<PromoData | null>(null);

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

  const ctaIsApplePay = payment?.method === "Apple Pay";
  const ctaLabel = ctaIsApplePay ? "Pay with Apple Pay" : "Place Order";

  const onPay = () => {
    if (!payment) {
      // No payment selected — open the native payment sheet so the user can add one.
      haptics.light();
      nativeBridge.openSheet("payment_method", undefined);
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
      onBack={() => {
        // In pricing-page flow the user enters Last Step directly from
        // the native pricing page — there's no /order-instructions step
        // before it. Go back to the homepage (or the native pricing page
        // when the integration lands).
        if (isPricingFlow) {
          navigate("/");
        } else {
          navigate("/laundry/order-instructions");
        }
      }}
      footerAboveSlot={
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-semibold leading-[21px] tracking-[0.4px] text-washmen-primary">
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
                  "press-effect flex h-8 flex-1 items-center justify-center rounded-[5px] border text-[14px] font-normal text-washmen-primary transition-colors",
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
      }
      footerSlot={
        <Button
          className="flex-1 h-[42px] rounded-[8px] text-sm font-semibold"
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
              <ChevronUp className="h-4 w-4 shrink-0 text-washmen-primary" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-washmen-primary" />
            )}
          </button>
          {promosExpanded && (
            <div className="flex flex-col gap-3 border-t border-washmen-light-grey px-4 pt-1 pb-4">
              {hasAvailablePromos && (
                <div className="no-scrollbar -mx-4 flex items-center gap-4 overflow-x-auto px-4 pt-3">
                  {AVAILABLE_PROMOS.map((promo) => (
                    <PromoCard
                      key={promo.code}
                      promo={promo}
                      selected={selectedPromoCode === promo.code}
                      onToggle={() => togglePromo(promo.code)}
                      onViewDetails={() => setDetailsPromo(promo)}
                    />
                  ))}
                </div>
              )}
              <div>
                <div className="rounded-[6px] border border-washmen-pale-grey bg-white px-4 py-3">
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
                    className="w-full bg-transparent text-left text-[14px] text-washmen-primary placeholder:text-washmen-cloudy-blue focus:outline-none"
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
              <div className="flex items-center gap-8 border-t border-washmen-light-grey pt-4">
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
            onViewPromoDetails={(p) => setDetailsPromo(p)}
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
              className="mt-0.5 h-4 w-4 shrink-0 text-washmen-primary"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        </button>

      </div>
      <PromoDetailsSheet
        open={!!detailsPromo}
        onOpenChange={(open) => !open && setDetailsPromo(null)}
        promo={detailsPromo}
      />
    </OrderLayout>
  );
}
