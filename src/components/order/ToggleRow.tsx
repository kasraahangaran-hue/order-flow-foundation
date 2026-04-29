import type { ComponentType } from "react";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  /** When true, label uses the medium/semibold weight used for primary list items. */
  labelMedium?: boolean;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export function ToggleRow({
  label,
  checked,
  onCheckedChange,
  labelMedium = false,
  icon: Icon,
  disabled = false,
}: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        haptics.light();
        onCheckedChange(!checked);
      }}
      className={cn(
        "press-effect flex w-full items-center justify-between gap-3 py-3 text-left",
        disabled && "opacity-50",
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        {Icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Icon className="h-4 w-4 text-washmen-primary" />
          </span>
        ) : null}
        <span
          className={cn(
            "truncate text-[15px] leading-tight text-washmen-primary",
            labelMedium ? "font-semibold" : "font-normal",
          )}
        >
          {label}
        </span>
      </span>
      <span
        className={cn(
          "relative inline-flex h-[28px] w-[46px] shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-washmen-primary" : "bg-washmen-secondary-200",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[21px]" : "translate-x-[3px]",
          )}
        />
      </span>
    </button>
  );
}