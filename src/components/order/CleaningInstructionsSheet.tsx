import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { BottomSheetShell } from "./BottomSheetShell";
import { RadioRow } from "./RadioRow";
import { CLEANING_INSTRUCTION_OPTIONS } from "@/lib/orderInstructionsLabels";
import { haptics } from "@/lib/haptics";
import type { CleaningInstruction } from "@/stores/orderStore";
import cleaningIconUrl from "@/assets/icons/instruction-cleaning.svg";

interface CleaningInstructionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: CleaningInstruction;
  onApply: (value: CleaningInstruction) => void;
}

export function CleaningInstructionsSheet({
  open,
  onOpenChange,
  initialValue,
  onApply,
}: CleaningInstructionsSheetProps) {
  const [draft, setDraft] = useState<CleaningInstruction>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Cleaning Instructions"
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
          <img
            src={cleaningIconUrl}
            alt=""
            className="h-8 w-8 shrink-0 select-none"
            draggable={false}
          />
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            What are the instructions?
          </p>
        </div>
        <div className="flex flex-col">
          {CLEANING_INSTRUCTION_OPTIONS.map((opt) => (
            <RadioRow
              key={opt.value}
              label={opt.label}
              selected={draft === opt.value}
              onSelect={() => setDraft(opt.value)}
            />
          ))}
        </div>
      </div>
    </BottomSheetShell>
  );
}