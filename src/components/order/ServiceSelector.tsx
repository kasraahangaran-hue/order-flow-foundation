import { Check, Plus, WashingMachine, Shirt, BedDouble, Wind, Footprints } from "lucide-react";
import { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { ServiceCard } from "./ServiceCard";
import { useOrderStore, ServicesState } from "@/stores/orderStore";

export type SelectedServicesSnapshot = ServicesState;

interface ServiceSelectorProps {
  variant: "screen" | "sheet";
  onContinue?: (selected: SelectedServicesSnapshot) => void;
  onSkip?: () => void;
  onLearnMoreWashAndFold?: () => void;
}

export function ServiceSelector({
  variant,
  onLearnMoreWashAndFold,
}: ServiceSelectorProps) {
  const services = useOrderStore((s) => s.services);
  const setServices = useOrderStore((s) => s.setServices);

  const padding = variant === "screen" ? "px-4" : "px-0";

  return (
    <div className={cn("space-y-3 pt-2", padding)}>
      {/* Wash & Fold + Add Pressing combo card */}
      <div className="rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <ComboRow
          icon={WashingMachine}
          iconBgClass="bg-[#E0F7FA]"
          iconFgClass="text-washmen-primary"
          title="Wash & Fold"
          subtitle="Everyday laundry, washed & folded"
          selected={services.washAndFold}
          onPress={() =>
            setServices({
              washAndFold: !services.washAndFold,
              // If turning off, also clear addPressing
              ...(services.washAndFold ? { addPressing: false } : {}),
            })
          }
          learnMoreText="Learn more"
          onLearnMore={onLearnMoreWashAndFold}
        />

        {/* Plus separator */}
        <div className="relative px-4">
          <div className="border-t border-washmen-secondary-100" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
            <Plus
              className={cn(
                "h-4 w-4",
                services.washAndFold
                  ? "text-washmen-secondary-400"
                  : "text-washmen-secondary-200"
              )}
            />
          </div>
        </div>

        <ComboRow
          icon={Shirt}
          iconBgClass="bg-washmen-secondary-100"
          iconFgClass="text-washmen-secondary-500"
          title="Add Pressing"
          subtitle="Press tops after washing"
          badge="NEW"
          selected={services.addPressing}
          disabled={!services.washAndFold}
          onPress={() =>
            services.washAndFold &&
            setServices({ addPressing: !services.addPressing })
          }
        />
      </div>

      <ServiceCard
        icon={Shirt}
        iconBgClass="bg-[#E8F5E9]"
        iconFgClass="text-[#22C55E]"
        title="Clean & Press"
        subtitle="Dry cleaning & pressing"
        selected={services.cleanAndPress}
        onPress={() => setServices({ cleanAndPress: !services.cleanAndPress })}
      />

      <ServiceCard
        icon={BedDouble}
        iconBgClass="bg-[#FCE4EC]"
        iconFgClass="text-[#EC407A]"
        title="Bed & Bath"
        subtitle="Bedding, towels & linens"
        selected={services.bedAndBath}
        onPress={() => setServices({ bedAndBath: !services.bedAndBath })}
      />

      <ServiceCard
        icon={Wind}
        iconBgClass="bg-washmen-secondary-100"
        iconFgClass="text-washmen-secondary-700"
        title="Press Only"
        subtitle="Pressing without washing"
        selected={services.pressOnly}
        onPress={() => setServices({ pressOnly: !services.pressOnly })}
      />

      <ServiceCard
        icon={Footprints}
        iconBgClass="bg-[#FFF3E0]"
        iconFgClass="text-[#FB923C]"
        title="Shoe & Bag Care"
        subtitle="Cleaning & restoration"
      />

      <FineryCard />
    </div>
  );
}

function FineryCard() {
  return (
    <div
      className={cn(
        "press-effect flex w-full items-center gap-3 rounded-card bg-card p-4 text-left",
        "shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-washmen-primary">
        <span className="font-serif text-base font-bold text-white">TF</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-washmen-secondary-900">
          The Finery
        </p>
        <p className="mt-0.5 truncate text-sm text-washmen-secondary-500">
          Premium garment care
        </p>
      </div>
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-washmen-secondary-300"
        aria-hidden
      >
        <Plus className="h-3.5 w-3.5 text-washmen-secondary-300" strokeWidth={2.5} />
      </div>
    </div>
  );
}

interface ComboRowProps {
  icon: ComponentType<{ className?: string }>;
  iconBgClass: string;
  iconFgClass: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  learnMoreText?: string;
  onLearnMore?: () => void;
}

function ComboRow({
  icon: Icon,
  iconBgClass,
  iconFgClass,
  title,
  subtitle,
  badge,
  selected,
  disabled,
  onPress,
  learnMoreText,
  onLearnMore,
}: ComboRowProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={!!selected}
      aria-disabled={!!disabled}
      onClick={() => {
        if (disabled) return;
        haptics.light();
        onPress?.();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          haptics.light();
          onPress?.();
        }
      }}
      className={cn(
        "flex w-full items-center gap-3 p-4 text-left",
        !disabled && "press-effect",
        disabled && "opacity-50"
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
          <p className="truncate text-base font-semibold text-washmen-secondary-900">
            {title}
          </p>
          {badge && (
            <span className="rounded-md bg-washmen-warning/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-washmen-secondary-800">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-washmen-secondary-500">
            {subtitle}
          </p>
        )}
        {learnMoreText && onLearnMore && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              haptics.light();
              onLearnMore();
            }}
            className="press-effect mt-1 inline-flex text-sm font-medium text-washmen-primary"
          >
            {learnMoreText}
          </button>
        )}
      </div>
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-washmen-success bg-washmen-success text-white"
            : "border-washmen-secondary-300 bg-transparent"
        )}
        aria-hidden
      >
        {selected ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          <Plus className="h-3.5 w-3.5 text-washmen-secondary-300" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}