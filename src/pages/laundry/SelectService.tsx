import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { OrderLayout } from "@/components/order/OrderLayout";
import { ServiceSelector } from "@/components/order/ServiceSelector";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { useIsFirstOrder } from "@/lib/userType";
import { cn } from "@/lib/utils";

export default function SelectService() {
  const navigate = useNavigate();
  const services = useOrderStore((s) => s.services);
  const isFirstOrder = useIsFirstOrder();

  const hasSelection =
    services.washAndFold ||
    services.addPressing ||
    services.cleanAndPress ||
    services.bedAndBath ||
    services.pressOnly;

  // NU rule: must select at least one service. CTA is always "Continue to
  // Order" and disabled until selection is made — Skip is not allowed.
  // RU rule (unchanged): can Skip without selecting anything.
  const ctaLabel = isFirstOrder
    ? "Continue to Order"
    : hasSelection
      ? "Continue to Order"
      : "Skip";
  const ctaDisabled = isFirstOrder && !hasSelection;

  return (
    <OrderLayout
      title="Select Service(s)"
      step={1}
      // Flow root — no in-flow predecessor, so fall back to browser history.
      onBack={() => navigate(-1)}
      footerSlot={
        <Button
          className="flex-1 h-[42px] rounded-[8px] text-sm font-semibold"
          disabled={ctaDisabled}
          onClick={() => {
            haptics.medium();
            navigate("/laundry/order-details");
          }}
        >
          {ctaLabel}
        </Button>
      }
    >
      <ServiceSelector
        variant="screen"
        entryPoint="laundry"
        onLearnMoreWashAndFold={() => navigate("/laundry/wash-and-fold-info")}
      />

      {/* NU-only FAQ section. Scrolls with the service list per Figma. */}
      {isFirstOrder && (
        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-washmen-primary">
            FAQ
          </h2>
          <div className="flex flex-col gap-2">
            <FaqItem question="How much will it cost?">
              <p className="text-sm font-light leading-relaxed text-washmen-primary">
                The final bill is calculated once we count your items at our
                facility. To estimate your bill, visit the{" "}
                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    // Pricing page is native — placeholder for now. Wire to
                    // the native bridge once the pricing page integration
                    // lands.
                  }}
                  className="press-effect inline underline underline-offset-2 font-medium"
                >
                  pricing section.
                </button>
              </p>
            </FaqItem>
            <FaqItem question="Do I need to wait for the driver?">
              <div className="flex flex-col gap-2 text-sm font-light leading-relaxed text-washmen-primary">
                <p>Not necessarily.</p>
                <p>
                  For each service selected, put your laundry in separate bags
                  and leave them outside your door.
                </p>
                <p>You can use any bag you have at home.</p>
              </div>
            </FaqItem>
          </div>
        </section>
      )}
    </OrderLayout>
  );
}

interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

function FaqItem({ question, children }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-[12px] bg-white">
      <button
        type="button"
        onClick={() => {
          haptics.light();
          setOpen((o) => !o);
        }}
        className="press-effect flex w-full items-center justify-between gap-3 px-4 py-[14px] text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-normal text-washmen-primary">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-washmen-primary transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}