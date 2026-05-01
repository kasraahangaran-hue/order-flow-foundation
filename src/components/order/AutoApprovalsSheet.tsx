import { useEffect, useState } from "react";
import approveIconUrl from "@/assets/icons/instruction-approve.svg";
import { BottomSheetShell } from "./BottomSheetShell";
import { RadioRow } from "./RadioRow";
import { Switch } from "@/components/ui/switch";
import type { AutoApprovalsState, WashAndFoldApprovalChoice } from "@/stores/orderStore";
import bagCleanPressUrl from "@/assets/icons/bag-clean-press.svg";
import bagWashFoldUrl from "@/assets/icons/bag-wash-fold.svg";

interface AutoApprovalsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: AutoApprovalsState;
  onApply: (value: AutoApprovalsState) => void;
  /**
   * Which approval sections to render.
   * - "all" (default): both Stain & Damage and Wash & Fold
   * - "wash_and_fold_only": only the Wash & Fold Approval section.
   */
  sections?: "all" | "wash_and_fold_only";
}

const WASH_AND_FOLD_OPTIONS: { value: WashAndFoldApprovalChoice; label: string }[] = [
  {
    value: "notify_me",
    label: "Always notify me of the items in question so I can decide (default)",
  },
  {
    value: "transfer_clean_press",
    label: "Automatically transfer items to the clean & press service and notify me",
  },
  {
    value: "always_wash",
    label:
      "Always wash any items I send in the wash & fold bag, regardless of the risk involved and notify me",
  },
  {
    value: "do_not_wash",
    label: "Do not wash and return unprocessed",
  },
];

export function AutoApprovalsSheet({
  open,
  onOpenChange,
  initialValue,
  onApply,
  sections = "all",
}: AutoApprovalsSheetProps) {
  const [draft, setDraft] = useState<AutoApprovalsState>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Auto-Approvals"
      footer="back-and-apply"
      primaryLabel="Done"
      onBack={() => onOpenChange(false)}
      onPrimary={() => {
        onApply(draft);
        onOpenChange(false);
      }}
    >
      <div className="flex flex-col">
        {/* Section 1 — Stain and Damage Approval */}
        {sections === "all" && (
        <div className="flex flex-col gap-4 pb-6 mb-6 border-b border-washmen-pale-grey">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <img src={bagCleanPressUrl} alt="" className="h-6 w-6 select-none" draggable={false} />
            </div>
            <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
              Stain and Damage Approval
            </p>
          </div>
          <p className="text-[13px] font-light leading-[18px] tracking-[0.2px] text-washmen-primary">
            By activating &ldquo;Auto-approve&rdquo; our laundry team will process all items with stains or damages without seeking your consent.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={approveIconUrl}
                alt=""
                className="h-6 w-6 shrink-0 select-none"
                draggable={false}
              />
              <p className="text-[14px] font-light leading-[20px] tracking-[0.1px] text-washmen-slate-grey">
                Auto-Approve
              </p>
            </div>
            <Switch
              checked={draft.stainDamageAutoApprove}
              onCheckedChange={(checked) =>
                setDraft((d) => ({ ...d, stainDamageAutoApprove: checked }))
              }
            />
          </div>
        </div>
        )}

        {/* Section 2 — Wash and Fold Approval */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <img src={bagWashFoldUrl} alt="" className="h-6 w-6 select-none" draggable={false} />
            </div>
            <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
              Wash and Fold Approval
            </p>
          </div>
          <p className="text-[13px] font-light leading-[18px] tracking-[0.2px] text-washmen-primary">
            In order to protect your delicate &amp; expensive items, our team will flag items that we believe might not be suitable to Wash &amp; Fold and will require your approval on how to proceed
          </p>
          <div className="flex flex-col gap-2">
            {WASH_AND_FOLD_OPTIONS.map((option) => (
              <RadioRow
                key={option.value}
                label={option.label}
                selected={draft.washAndFold === option.value}
                onSelect={() =>
                  setDraft((d) => ({ ...d, washAndFold: option.value }))
                }
              />
            ))}
          </div>
        </div>
      </div>
    </BottomSheetShell>
  );
}
