import { useEffect, useState } from "react";
import { Droplet, X } from "lucide-react";
import { BottomSheetShell } from "./BottomSheetShell";
import { CheckboxRow } from "./CheckboxRow";
import { STAIN_OPTIONS } from "@/lib/orderInstructionsLabels";
import { haptics } from "@/lib/haptics";
import type { StainType } from "@/stores/orderStore";

interface StainSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: StainType[];
  onApply: (value: StainType[]) => void;
}

export function StainSheet({
  open,
  onOpenChange,
  initialValue,
  onApply,
}: StainSheetProps) {
  const [draft, setDraft] = useState<StainType[]>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (value: StainType) => {
    haptics.light();
    setDraft((d) =>
      d.includes(value) ? d.filter((v) => v !== value) : [...d, value],
    );
  };

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Report Stain"
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
            <Droplet className="h-6 w-6 text-washmen-primary" />
          </div>
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            What type of stain is it?
          </p>
        </div>
        <div className="flex flex-col divide-y divide-washmen-pale-grey">
          {STAIN_OPTIONS.map((opt) => (
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