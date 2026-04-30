import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { BottomSheetShell } from "./BottomSheetShell";
import { CheckboxRow } from "./CheckboxRow";
import { OTHER_FLAG_OPTIONS } from "@/lib/orderInstructionsLabels";
import { haptics } from "@/lib/haptics";
import type { OtherFlag } from "@/stores/orderStore";

interface OthersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: OtherFlag[];
  onApply: (value: OtherFlag[]) => void;
}

export function OthersSheet({
  open,
  onOpenChange,
  initialValue,
  onApply,
}: OthersSheetProps) {
  const [draft, setDraft] = useState<OtherFlag[]>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (value: OtherFlag) => {
    haptics.light();
    setDraft((d) =>
      d.includes(value) ? d.filter((v) => v !== value) : [...d, value],
    );
  };

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Others"
      titleSlot={
        <button
          type="button"
          onClick={() => {
            haptics.light();
            onOpenChange(false);
          }}
          aria-label="Close"
          className="press-effect flex h-6 w-6 items-center justify-center"
        >
          <X className="h-5 w-5 text-washmen-primary" />
        </button>
      }
      footer="apply-only"
      primaryLabel="Update"
      onPrimary={() => {
        onApply(draft);
        onOpenChange(false);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <MessageCircle className="h-6 w-6 text-washmen-primary" />
          </div>
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            Any additional information?
          </p>
        </div>
        <div className="flex flex-col divide-y divide-washmen-pale-grey">
          {OTHER_FLAG_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              selected={draft.includes(opt.value)}
              onToggle={() => toggle(opt.value)}
            />
          ))}
        </div>
      </div>
    </BottomSheetShell>
  );
}