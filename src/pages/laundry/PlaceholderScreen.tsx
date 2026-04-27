import { useNavigate } from "react-router-dom";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ServiceCard } from "@/components/order/ServiceCard";
import { BottomSheet } from "@/components/order/BottomSheet";
import { Shirt, LifeBuoy } from "lucide-react";
import { nativeBridge } from "@/lib/nativeBridge";
import { haptics } from "@/lib/haptics";

interface PlaceholderScreenProps {
  title: string;
  step?: 1 | 2 | 3;
  backTo?: string | -1;
  nextTo?: string;
  ctaLabel?: string;
  /** Show a sample ServiceCard + BottomSheet harness (used on the first route to verify). */
  showSamples?: boolean;
  showSupport?: boolean;
}

export default function PlaceholderScreen({
  title,
  step,
  backTo,
  nextTo,
  ctaLabel = "Continue",
  showSamples,
  showSupport,
}: PlaceholderScreenProps) {
  const navigate = useNavigate();
  const [sampleSelected, setSampleSelected] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <OrderLayout
      title={title}
      step={step}
      onBack={
        backTo === undefined
          ? undefined
          : () => {
              if (backTo === -1) navigate(-1);
              else navigate(backTo as string);
            }
      }
      supportSlot={
        showSupport ? (
          <button
            type="button"
            className="press-effect inline-flex items-center gap-1 rounded-full bg-washmen-primary-light px-3 py-1.5 text-sm font-medium text-washmen-primary"
          >
            <LifeBuoy className="h-4 w-4" />
            Support
          </button>
        ) : undefined
      }
      footerSlot={
        nextTo ? (
          <Button
            className="flex-1 h-12 text-sm font-semibold"
            onClick={() => {
              haptics.medium();
              navigate(nextTo);
            }}
          >
            {ctaLabel}
          </Button>
        ) : (
          <Button disabled className="flex-1 h-12 text-sm font-semibold">
            {ctaLabel}
          </Button>
        )
      }
    >
      <div className="space-y-3 pt-2">
        <div className="rounded-card bg-subtle-bg p-4 text-sm text-washmen-secondary-600">
          Screen content goes here.
        </div>

        {showSamples && (
          <>
            <p className="pt-2 text-xs font-medium uppercase tracking-wide text-washmen-secondary-400">
              Component samples
            </p>
            <ServiceCard
              icon={Shirt}
              title="Wash &amp; Fold"
              badge="NEW"
              priceLabel="AED 75 per bag"
              selected={sampleSelected}
              onPress={() => setSampleSelected((v) => !v)}
              pricingLink={{ label: "Learn More", onPress: () => setSheetOpen(true) }}
            />

            <button
              type="button"
              onClick={() => {
                nativeBridge.openSheet("address");
                setSheetOpen(true);
              }}
              className="press-effect w-full rounded-btn border-2 border-washmen-primary bg-background px-4 py-3 text-sm font-semibold text-washmen-primary"
            >
              Open sample bottom sheet (also pings native bridge)
            </button>
          </>
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Sample sheet"
      >
        <p className="text-sm text-washmen-secondary-600">
          This is a sample bottom sheet. Real sheets will host service detail
          views, in-web pickers, etc. Native sheets (address, schedule,
          payment) are launched via the native bridge.
        </p>
      </BottomSheet>
    </OrderLayout>
  );
}