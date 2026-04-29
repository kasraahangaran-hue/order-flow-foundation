import { useEffect, useState } from "react";
import { Check, Droplet, X } from "lucide-react";
import { BottomSheetShell } from "./BottomSheetShell";
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
          onClick={() => onOpenChange(false)}
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
        <div className="flex flex-col">
          {STAIN_OPTIONS.map((opt) => {
            const selected = draft.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="press-effect flex h-[52px] items-center justify-between border-t border-[#f2f3f8] px-2"
              >
                <span className="text-[14px] font-light leading-[20px] tracking-[0.1px] text-washmen-primary">
                  {opt.label}
                </span>
                <CheckboxIcon selected={selected} />
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheetShell>
  );
}

function CheckboxIcon({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] bg-[#A4FF00]">
        <Check className="h-3 w-3 text-washmen-primary" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="h-[18px] w-[18px] rounded-[4px] border-2 border-washmen-secondary-300" />
  );
}