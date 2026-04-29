import { useEffect, useMemo, useState } from "react";
import { BottomSheetShell } from "./BottomSheetShell";
import { ChipPill } from "./ChipPill";
import { ClearAllButton } from "./ClearAllButton";
import { FOLDING_CATEGORIES } from "@/lib/orderInstructionsLabels";
import type { FoldingCategory } from "@/lib/orderInstructionsLabels";
import type { FoldingSelection } from "@/stores/orderStore";

interface FoldingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The current order's folding selection, or null if nothing has been set on this order yet. */
  initialOrderValue: FoldingSelection | null;
  /** The user's saved cross-order folding preference, or null if no preference saved. */
  userPrefValue: FoldingSelection | null;
  /** Called with the draft when user taps "Apply on this Order Only". Saves to order state only. */
  onApplyToOrder: (value: FoldingSelection) => void;
  /** Called with the draft when user taps "Apply on All Future Orders". Saves to BOTH order state and userPrefs. */
  onApplyToFuture: (value: FoldingSelection) => void;
}

function isCategoryAllSelected(category: FoldingCategory, draft: FoldingSelection): boolean {
  return category.items.every((item) => draft[item.id] === true);
}

function setCategoryAll(category: FoldingCategory, draft: FoldingSelection, target: boolean): FoldingSelection {
  const next = { ...draft };
  for (const item of category.items) {
    if (target) {
      next[item.id] = true;
    } else {
      delete next[item.id];
    }
  }
  return next;
}

function toggleItem(itemId: string, draft: FoldingSelection): FoldingSelection {
  const next = { ...draft };
  if (next[itemId]) {
    delete next[itemId];
  } else {
    next[itemId] = true;
  }
  return next;
}

export function FoldingSheet({
  open,
  onOpenChange,
  initialOrderValue,
  userPrefValue,
  onApplyToOrder,
  onApplyToFuture,
}: FoldingSheetProps) {
  const computeInitial = (): FoldingSelection => {
    if (initialOrderValue && Object.keys(initialOrderValue).length > 0) {
      return { ...initialOrderValue };
    }
    if (userPrefValue && Object.keys(userPrefValue).length > 0) {
      return { ...userPrefValue };
    }
    return {};
  };

  const [draft, setDraft] = useState<FoldingSelection>(computeInitial);

  useEffect(() => {
    if (open) setDraft(computeInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedCount = useMemo(
    () => Object.values(draft).filter(Boolean).length,
    [draft],
  );

  const hasAnySelection = selectedCount > 0;

  const handleClearAll = () => {
    setDraft({});
  };

  const handleAllChip = (category: FoldingCategory) => {
    const allSelected = isCategoryAllSelected(category, draft);
    setDraft((d) => setCategoryAll(category, d, !allSelected));
  };

  const handleItemChip = (itemId: string) => {
    setDraft((d) => toggleItem(itemId, d));
  };

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Folding"
      titleSlot={<ClearAllButton active={hasAnySelection} onClear={handleClearAll} />}
      footer="dual-apply"
      primaryLabel="Apply on this Order Only"
      secondaryLabel="Apply on All Future Orders"
      primaryDisabled={!hasAnySelection}
      onPrimary={() => {
        onApplyToOrder(draft);
        onOpenChange(false);
      }}
      onSecondary={() => {
        onApplyToFuture(draft);
        onOpenChange(false);
      }}
    >
      <div className="flex flex-col gap-4">
        {FOLDING_CATEGORIES.map((category) => {
          const allSelected = isCategoryAllSelected(category, draft);
          return (
            <div key={category.id} className="flex flex-col gap-2">
              <p className="text-[13px] font-light leading-[18px] tracking-[0.2px] text-washmen-primary">
                {category.label}
              </p>
              <div className="flex flex-wrap gap-2">
                <ChipPill
                  label="All"
                  selected={allSelected}
                  onToggle={() => handleAllChip(category)}
                />
                {category.items.map((item) => (
                  <ChipPill
                    key={item.id}
                    label={item.label}
                    selected={draft[item.id] === true}
                    onToggle={() => handleItemChip(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </BottomSheetShell>
  );
}