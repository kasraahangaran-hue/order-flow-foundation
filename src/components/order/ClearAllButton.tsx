import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface ClearAllButtonProps {
  active: boolean;
  onClear: () => void;
}

export function ClearAllButton({ active, onClear }: ClearAllButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!active) return;
        haptics.light();
        onClear();
      }}
      className={cn(
        "w-[85px] h-[29px] rounded-[8px] px-[10px] py-[9px] flex items-center justify-center transition-colors",
        "text-[13px] font-medium leading-[18px] tracking-[0.4px] whitespace-nowrap",
        active
          ? "bg-washmen-secondary-red text-washmen-red"
          : "bg-washmen-light-grey text-washmen-secondary-300"
      )}
    >
      Clear All
    </button>
  );
}