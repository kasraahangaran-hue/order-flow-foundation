import { Check, Plus } from "lucide-react";
import { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

interface ServiceCardProps {
  icon: ComponentType<{ className?: string }>;
  iconBgClass?: string; // tailwind bg color for icon circle, e.g. "bg-washmen-primary-light"
  iconFgClass?: string; // tailwind text color for icon, e.g. "text-washmen-primary"
  title: string;
  badge?: ReactNode;
  priceLabel?: string;
  pricingLink?: { label: string; onPress: () => void };
  selected?: boolean;
  onPress?: () => void;
}

export function ServiceCard({
  icon: Icon,
  iconBgClass = "bg-washmen-primary-light",
  iconFgClass = "text-washmen-primary",
  title,
  badge,
  priceLabel,
  pricingLink,
  selected,
  onPress,
}: ServiceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={!!selected}
      onClick={() => {
        haptics.light();
        onPress?.();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          haptics.light();
          onPress?.();
        }
      }}
      className={cn(
        "press-effect flex w-full items-center gap-3 rounded-card bg-card p-4 text-left",
        "shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          iconBgClass
        )}
      >
        <Icon className={cn("h-6 w-6", iconFgClass)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-semibold leading-tight text-washmen-secondary-900">
            {title}
          </p>
          {badge && (
            <span className="rounded-md bg-washmen-warning/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-washmen-secondary-800">
              {badge}
            </span>
          )}
          {priceLabel && (
            <span className="rounded-md bg-washmen-secondary-aqua px-2 py-0.5 text-[12px] font-medium text-washmen-primary">
              {priceLabel}
            </span>
          )}
        </div>
        {pricingLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              haptics.light();
              pricingLink.onPress();
            }}
            className="press-effect mt-0.5 inline-flex text-xs font-normal leading-tight text-washmen-primary underline underline-offset-2"
          >
            {pricingLink.label}
          </button>
        )}
      </div>

      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
          selected
            ? "border-[#A4FF00] bg-[#A4FF00] text-washmen-primary"
            : "border-washmen-primary bg-transparent text-washmen-primary"
        )}
        aria-hidden
      >
        {selected ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}