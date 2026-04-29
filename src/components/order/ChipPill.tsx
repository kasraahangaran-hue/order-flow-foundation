import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface ChipPillProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function ChipPill({ label, selected, onToggle }: ChipPillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        haptics.light();
        onToggle();
      }}
      className={cn(
        "h-[33px] rounded-[20px] px-[10px] flex items-center justify-center transition-colors active:scale-[0.97] active:duration-75",
        "text-[13px] font-light leading-[18px] tracking-[0.2px] text-washmen-primary text-center whitespace-nowrap",
        selected
          ? "bg-washmen-secondary-express border border-washmen-primary"
          : "bg-white border border-washmen-secondary-300"
      )}
    >
      {label}
    </button>
  );
}