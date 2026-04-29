import { Check } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface RadioRowProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Indents the row to indicate a nested/child option. */
  indented?: boolean;
  disabled?: boolean;
}

export function RadioRow({
  label,
  selected,
  onSelect,
  indented = false,
  disabled = false,
}: RadioRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        haptics.light();
        onSelect();
      }}
      className={cn(
        "press-effect flex w-full items-center justify-between gap-3 py-3 text-left",
        indented && "pl-6",
        disabled && "opacity-50",
      )}
    >
      <span
        className={cn(
          "text-[15px] leading-tight",
          selected
            ? "font-semibold text-washmen-primary"
            : "font-normal text-washmen-secondary-700",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-washmen-primary bg-washmen-primary text-primary-foreground"
            : "border-washmen-secondary-300 bg-background",
        )}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}