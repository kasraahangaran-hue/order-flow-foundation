import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface ChipPillProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ChipPill({ label, selected, onToggle, disabled = false }: ChipPillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        haptics.light();
        onToggle();
      }}
      className={cn(
        "press-effect inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-medium leading-none transition-colors",
        selected
          ? "border-washmen-primary bg-washmen-primary-light text-washmen-primary"
          : "border-washmen-secondary-200 bg-background text-washmen-secondary-700",
        disabled && "opacity-50",
      )}
    >
      {label}
    </button>
  );
}