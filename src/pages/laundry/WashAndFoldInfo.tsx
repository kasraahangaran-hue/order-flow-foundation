import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { useUserPrefsStore } from "@/stores/userPrefsStore";
import { PRESSING_CATEGORIES, KIDS_UNIFORM_NOTE } from "@/data/pressingCategories";
import { haptics } from "@/lib/haptics";

export default function WashAndFoldInfo() {
  const navigate = useNavigate();
  const pressingPrefs = useOrderStore((s) => s.services.pressingPrefs);
  const setPressingPrefs = useOrderStore((s) => s.setPressingPrefs);
  const setServices = useOrderStore((s) => s.setServices);
  const wfPlusTermsAccepted = useUserPrefsStore((s) => s.wfPlusTermsAccepted);

  const [items, setItems] = useState<string[]>(pressingPrefs?.items ?? []);

  const toggle = (id: string) => {
    haptics.light();
    setItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    haptics.medium();
    const prefsToSave = items.length > 0 ? { items, pricePerItem: 9 } : null;
    setPressingPrefs(prefsToSave);
    // Edge cases 2 & 4: any prefs added → WF auto-activates
    if (prefsToSave) {
      setServices({ washAndFold: true });
    }
    // First-time T&Cs gate
    if (prefsToSave && !wfPlusTermsAccepted) {
      navigate("/laundry/wash-and-fold-info/terms", {
        state: { mode: "gate", returnTo: "/laundry/select-service" },
        replace: true,
      });
      return;
    }
    navigate("/laundry/select-service");
  };

  return (
    <OrderLayout
      title="Add Pressing"
      onBack={handleContinue}
      footerSlot={
        <Button
          className="flex-1 h-[42px] rounded-[8px] text-sm font-semibold"
          onClick={handleContinue}
        >
          {items.length > 0 ? "Continue to Order" : "Skip"}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-washmen-secondary-700">
          Choose which items you'd like pressed and hung after washing. Pricing is
          per item.
        </p>

        <div className="rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          {PRESSING_CATEGORIES.map((opt, idx) => {
            const checked = items.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={
                  "flex items-center justify-between gap-3 px-4 py-4 " +
                  (idx !== PRESSING_CATEGORIES.length - 1
                    ? "border-b border-washmen-secondary-100"
                    : "")
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-washmen-secondary-900">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-sm">
                    <span className="text-washmen-primary">
                      + AED {opt.ratePlus} /item
                    </span>
                    <span className="ml-2 text-washmen-secondary-400 line-through">
                      AED {opt.rateStrikethrough}
                    </span>
                  </p>
                  {opt.id === "kids_uniform" && (
                    <p className="mt-0.5 text-[11px] text-washmen-secondary-500">
                      {KIDS_UNIFORM_NOTE}
                    </p>
                  )}
                </div>
                <Switch
                  checked={checked}
                  onCheckedChange={() => toggle(opt.id)}
                  aria-label={`Toggle ${opt.label}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </OrderLayout>
  );
}