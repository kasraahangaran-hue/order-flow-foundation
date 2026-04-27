import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";

const PRESSING_OPTIONS: { id: string; label: string; price: string }[] = [
  { id: "tshirts_polos", label: "All T-Shirts / Polos", price: "+ AED 9 /item" },
  { id: "tank_crop", label: "All Tank / Crop Tops", price: "+ AED 9 /item" },
  { id: "shirts_blouses", label: "All Shirts / Blouses", price: "+ AED 10 /item" },
];

export default function WashAndFoldInfo() {
  const navigate = useNavigate();
  const pressingPrefs = useOrderStore((s) => s.services.pressingPrefs);
  const setPressingPrefs = useOrderStore((s) => s.setPressingPrefs);

  const [items, setItems] = useState<string[]>(pressingPrefs?.items ?? []);

  const toggle = (id: string) => {
    haptics.light();
    setItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    haptics.medium();
    setPressingPrefs(
      items.length > 0 ? { items, pricePerItem: 9 } : null
    );
    navigate("/laundry/select-service");
  };

  return (
    <OrderLayout
      title="Add Pressing"
      onBack={() => navigate(-1)}
      footerSlot={
        <Button
          className="flex-1 h-12 text-sm font-semibold"
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
          {PRESSING_OPTIONS.map((opt, idx) => {
            const checked = items.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={
                  "flex items-center justify-between gap-3 px-4 py-4 " +
                  (idx !== PRESSING_OPTIONS.length - 1
                    ? "border-b border-washmen-secondary-100"
                    : "")
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-washmen-secondary-900">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-sm text-washmen-primary">
                    {opt.price}
                  </p>
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