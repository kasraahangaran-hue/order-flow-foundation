import { ArrowLeft, Check, X, HelpCircle, ChevronDown, ChevronRight, CircleCheck, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUserPrefsStore } from "@/stores/userPrefsStore";
import { useOrderStore } from "@/stores/orderStore";
import { AutoApprovalsSheet } from "@/components/order/AutoApprovalsSheet";
import { DEFAULT_AUTO_APPROVALS } from "@/lib/orderInstructionsLabels";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface LocationState {
  mode?: "gate" | "view";
  /** Where to navigate after I UNDERSTAND in gate mode */
  returnTo?: string;
}

const SUITABLE_BULLETS = [
  "Any clothing or home items applicable for machine wash at 35°C",
  "Items that can tolerate tumble drying",
  "Materials: cotton, polyester, nylon, linen, modal, tencel, spandex and heat resistant materials",
];

const NOT_SUITABLE_BULLETS = [
  "Delicate or expensive items you love",
  "Items that require expert stain removal",
  "Items for dry cleaning or hand wash",
  "Items that require air dry (no tumble dry)",
  "Suits, dresses, formal and traditional wear",
  "Materials: silk, cashmere, wool, leather, velvet, exotic furs & leathers, embroidery and other delicate items",
];

export default function WashAndFoldTerms() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const mode = state.mode ?? "view";
  const returnTo = state.returnTo ?? "/laundry/select-service";

  const setWfPlusTermsAccepted = useUserPrefsStore((s) => s.setWfPlusTermsAccepted);
  const [faqOpen, setFaqOpen] = useState(false);
  const [autoApprovalsSheetOpen, setAutoApprovalsSheetOpen] = useState(false);
  const orderInstructions = useOrderStore((s) => s.orderInstructions);
  const setOrderInstructions = useOrderStore((s) => s.setOrderInstructions);
  const autoApprovals = orderInstructions?.autoApprovals ?? null;

  const handleAcknowledge = () => {
    haptics.medium();
    if (mode === "gate") {
      setWfPlusTermsAccepted(true);
    }
    navigate(returnTo, { replace: mode === "gate" });
  };

  const handleBack = () => {
    haptics.light();
    navigate(-1);
  };

  return (
    <div className="flex h-full min-h-screen flex-col bg-subtle-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-subtle-bg px-6 pt-6 pb-0">
        <div className="flex items-center gap-3">
          {mode === "view" && (
            <button
              type="button"
              aria-label="Go back"
              onClick={handleBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-primary bg-background text-primary transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-[22px] font-bold text-washmen-primary">
            Wash & Fold+ Terms
          </h1>
        </div>
      </header>

      {/* Body */}
      <main className="no-scrollbar flex-1 overflow-y-auto px-6 pt-[26px] pb-4">
        <div className="flex flex-col gap-3">
          {/* Card 1 — Suitable */}
          <div className="rounded-card border border-washmen-secondary-100 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-washmen-primary-green text-washmen-primary">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
              <p className="text-base font-semibold text-washmen-secondary-900">
                ONLY Suitable for:
              </p>
            </div>
            <ul className="mt-3 list-disc pl-5 text-sm text-washmen-secondary-700 flex flex-col gap-1">
              {SUITABLE_BULLETS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Card 2 — Not Suitable */}
          <div className="rounded-card border border-washmen-secondary-100 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-washmen-primary-red text-white">
                <X className="h-4 w-4" strokeWidth={3} />
              </div>
              <p className="text-base font-semibold text-washmen-secondary-900">
                NOT Suitable for:
              </p>
            </div>
            <ul className="mt-3 list-disc pl-5 text-sm text-washmen-secondary-700 flex flex-col gap-2">
              {NOT_SUITABLE_BULLETS.map((b) => (
                <li key={b}>
                  {b},
                  <ul className="mt-1 list-disc pl-5 marker:text-washmen-secondary-900">
                    <li className="text-sm font-bold text-washmen-secondary-900">
                      use Clean & Press instead
                    </li>
                  </ul>
                </li>
              ))}
              <li className="mt-2 text-sm font-semibold text-washmen-secondary-900 underline">
                Damage compensation will be limited to AED 200 an item
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <Collapsible open={faqOpen} onOpenChange={setFaqOpen}>
            <div className="rounded-card bg-washmen-light-red px-4 py-3">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left leading-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-washmen-primary text-white">
                    <HelpCircle className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-medium text-washmen-secondary-900">
                    What if I send an unsuitable item?
                  </p>
                </div>
                {faqOpen ? (
                  <ChevronDown className="h-5 w-5 text-washmen-primary shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-washmen-primary shrink-0" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 pb-2 flex flex-col gap-3">
                  <p className="text-sm text-washmen-secondary-700">
                    Our team will identify it during sorting and contact you. Unsuitable items can be returned unwashed or transferred to Clean & Press at standard pricing.
                  </p>
                  <p className="text-sm text-washmen-secondary-700">
                    You can also set automatic approvals on what we should do:
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptics.light();
                      setAutoApprovalsSheetOpen(true);
                    }}
                    className="press-effect flex w-full items-center justify-between gap-3 rounded-card bg-card px-4 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <CircleCheck className="h-5 w-5 text-washmen-primary" strokeWidth={2} />
                      <span className="text-sm font-medium text-washmen-secondary-900">
                        Auto-Approvals
                      </span>
                    </div>
                    <Plus className="h-5 w-5 text-washmen-secondary-700" />
                  </button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 z-10 bg-washmen-secondary-express pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="flex items-center gap-2 px-6 pt-3 pb-4">
          {mode === "view" && (
            <button
              type="button"
              aria-label="Go back"
              onClick={handleBack}
              className="flex w-12 h-[42px] shrink-0 items-center justify-center rounded-[8px] border border-primary bg-background text-primary transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Button
            className={cn("flex-1 h-[42px] rounded-[8px] text-sm font-semibold uppercase tracking-wide")}
            onClick={handleAcknowledge}
          >
            I UNDERSTAND
          </Button>
        </div>
      </footer>
      <AutoApprovalsSheet
        open={autoApprovalsSheetOpen}
        onOpenChange={setAutoApprovalsSheetOpen}
        initialValue={autoApprovals ?? DEFAULT_AUTO_APPROVALS}
        onApply={(value) => setOrderInstructions({ autoApprovals: value })}
        sections="wash_and_fold_only"
      />
    </div>
  );
}