import { useEffect, useState } from "react";
import { SprayCan } from "lucide-react";
import { BottomSheetShell } from "./BottomSheetShell";
import { RadioRow } from "./RadioRow";
import type { StarchChoice } from "@/stores/orderStore";

interface StarchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: StarchChoice;
  onApply: (value: StarchChoice) => void;
}

const OPTIONS: { value: StarchChoice; label: string }[] = [
  { value: "none", label: "None" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function StarchSheet({ open, onOpenChange, initialValue, onApply }: StarchSheetProps) {
  const [draft, setDraft] = useState<StarchChoice>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Starch"
      footer="apply-only"
      primaryLabel="Apply"
      onPrimary={() => {
        onApply(draft);
        onOpenChange(false);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <SprayCan className="h-6 w-6 text-washmen-primary" />
          </div>
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            How should we starch your shirts?
          </p>
        </div>
        <div className="flex flex-col">
          {OPTIONS.map((opt) => (
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