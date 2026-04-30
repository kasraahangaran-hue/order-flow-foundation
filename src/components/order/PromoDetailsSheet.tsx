import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { PromoData } from "@/data/promos";

// TODO: Replace hardcoded terms with promo-specific T&Cs from backend when wired up.
const PROMO_TERMS = [
  "Promo can be used only on new orders placed after the date of issue.",
  "Discount applies to the total before delivery fee and tip.",
  "One promo code can be applied per order.",
  "Promo cannot be combined with other offers or credits.",
  "Promo expires 30 days from the date of issue unless otherwise stated.",
  "Washmen reserves the right to modify or revoke the promo at any time.",
];

interface PromoDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promo: PromoData | null;
}

export function PromoDetailsSheet({ open, onOpenChange, promo }: PromoDetailsSheetProps) {
  if (!promo) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[90vh] rounded-t-[24px] border-0 bg-washmen-bg pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <div className="px-6 pt-4 pb-8">
          <div className="mt-6">
            <h2 className="text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
              {promo.subtitle}
            </h2>
          </div>
          <div className="mt-6">
            <h3 className="text-[14px] font-semibold leading-[20px] text-washmen-primary">
              Terms & Conditions
            </h3>
            <ul className="mt-1 list-disc pl-5">
              {PROMO_TERMS.map((term, i) => (
                <li
                  key={i}
                  className="text-[14px] font-normal leading-[20px] text-washmen-primary"
                >
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}