import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface RadioRowProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  indented?: boolean;
}

export function RadioRow({ label, selected, onSelect, indented = false }: RadioRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => {
        haptics.light();
        onSelect();
      }}
      className={cn(
        "press-effect flex w-full items-center gap-[14px] min-h-[40px] pr-2",
        indented ? "pl-4" : "pl-2"
      )}
    >
      <span
        className={cn(
          "flex-1 text-left text-[14px] leading-[20px] tracking-[0.1px]",
          selected
            ? "font-normal text-washmen-primary"
            : "font-light text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center",
          selected ? "border-washmen-primary" : "border-washmen-secondary-300"
        )}
        aria-hidden
      >
        {selected && <span className="w-[10px] h-[10px] rounded-full bg-washmen-primary" />}
      </span>
    </button>
  );
}