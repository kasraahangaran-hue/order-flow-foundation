import { Check } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface CheckboxRowProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function CheckboxRow({ label, selected, onToggle }: CheckboxRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={() => {
        haptics.light();
        onToggle();
      }}
      className="flex w-full items-center gap-[14px] min-h-[40px] pl-2 pr-2 active:scale-[0.99] transition-transform"
    >
      <span
        className={cn(
          "flex-1 text-left text-[14px] leading-[20px] tracking-[0.1px]",
          selected
            ? "font-normal text-washmen-primary"
            : "font-light text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center",
          selected
            ? "border-washmen-primary bg-washmen-primary"
            : "border-washmen-secondary-300",
        )}
        aria-hidden
      >
        {selected ? (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        ) : null}
      </span>
    </button>
  );
}