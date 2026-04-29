import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface ClearAllButtonProps {
  /** Whether there is anything to clear. When false the button is muted/inert. */
  active: boolean;
  onClear: () => void;
  label?: string;
}

export function ClearAllButton({ active, onClear, label = "Clear all" }: ClearAllButtonProps) {
  return (
    <button
      type="button"
      disabled={!active}
      onClick={() => {
        if (!active) return;
        haptics.light();
        onClear();
      }}
      className={cn(
        "press-effect inline-flex h-8 items-center rounded-full px-3 text-[13px] font-medium transition-colors",
        active
          ? "text-washmen-primary hover:bg-washmen-primary-light"
          : "cursor-not-allowed text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}