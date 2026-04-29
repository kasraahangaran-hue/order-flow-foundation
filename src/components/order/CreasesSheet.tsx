import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { BottomSheetShell } from "./BottomSheetShell";
import { RadioRow } from "./RadioRow";
import { ToggleRow } from "./ToggleRow";
import type { CreasesState, CreaseChoice } from "@/stores/orderStore";

interface CreasesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: CreasesState;
  onApply: (value: CreasesState) => void;
}

const CREASE_OPTIONS: { value: CreaseChoice; label: string }[] = [
  { value: "no_preference", label: "No preference" },
  { value: "full_crease", label: "Full crease" },
  { value: "fold_top_only", label: "Fold the top only" },
];

export function CreasesSheet({ open, onOpenChange, initialValue, onApply }: CreasesSheetProps) {
  const [draft, setDraft] = useState<CreasesState>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setShirtsSleeveCreases = (v: boolean) =>
    setDraft((d) => ({ ...d, shirtsSleeveCreases: v }));
  const setPantsFrontCreases = (v: boolean) =>
    setDraft((d) => ({ ...d, pantsFrontCreases: v }));
  const setKandura = (v: CreaseChoice) => setDraft((d) => ({ ...d, kandura: v }));
  const setGathra = (v: CreaseChoice) => setDraft((d) => ({ ...d, gathra: v }));

  const dividerClass = "pb-4 border-b border-washmen-secondary-300/50";

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Creases"
      footer="apply-only"
      primaryLabel="Apply"
      onPrimary={() => {
        onApply(draft);
        onOpenChange(false);
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Sub-question header */}
        <div className={`flex items-center gap-3 ${dividerClass}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Layers className="h-6 w-6 text-washmen-primary" />
          </div>
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            How should we crease your items?
          </p>
        </div>

        {/* Shirts toggle */}
        <div className={dividerClass}>
          <ToggleRow
            label="Shirts Sleeve Creases"
            checked={draft.shirtsSleeveCreases}
            onCheckedChange={setShirtsSleeveCreases}
            labelMedium
          />
        </div>

        {/* Pants toggle */}
        <div className={dividerClass}>
          <ToggleRow
            label="Pants Front Creases"
            checked={draft.pantsFrontCreases}
            onCheckedChange={setPantsFrontCreases}
            labelMedium
          />
        </div>

        {/* Kandura */}
        <div className={`flex flex-col gap-2 ${dividerClass}`}>
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            Kandura
          </p>
          <div className="flex flex-col">
            {CREASE_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                selected={draft.kandura === opt.value}
                onSelect={() => setKandura(opt.value)}
                indented
              />
            ))}
          </div>
        </div>

        {/* Gathra (no border) */}
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            Gathra
          </p>
          <div className="flex flex-col">
            {CREASE_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                selected={draft.gathra === opt.value}
                onSelect={() => setGathra(opt.value)}
                indented
              />
            ))}
          </div>
        </div>
      </div>
    </BottomSheetShell>
  );
}