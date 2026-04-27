import { Check, Plus, WashingMachine, Shirt, BedDouble, Wind, Footprints, Pencil } from "lucide-react";
import { ComponentType, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { ServiceCard } from "./ServiceCard";
import { useOrderStore, ServicesState } from "@/stores/orderStore";

export type SelectedServicesSnapshot = ServicesState;

interface ServiceSelectorProps {
  variant: "screen" | "sheet";
  entryPoint: "laundry" | "quick-checkout";
  onContinue?: (selected: SelectedServicesSnapshot) => void;
  onSkip?: () => void;
  onLearnMoreWashAndFold?: () => void;
}

export function ServiceSelector({
  variant,
  entryPoint,
  onLearnMoreWashAndFold,
}: ServiceSelectorProps) {
  const navigate = useNavigate();
  const services = useOrderStore((s) => s.services);
  const setServices = useOrderStore((s) => s.setServices);

  const padding = variant === "screen" ? "px-0" : "px-0";

  const goToWashAndFoldInfo = () => navigate("/laundry/wash-and-fold-info");
  const learnMoreWF = onLearnMoreWashAndFold ?? goToWashAndFoldInfo;

  const showExtras = entryPoint === "quick-checkout";

  return (
    <div className={cn("flex flex-col gap-2", padding)}>
      {/* Wash & Fold + Add Pressing combo card */}
      <div className="rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <ComboRow
          icon={WashingMachine}
          iconBgClass="bg-[#E0F7FA]"
          iconFgClass="text-washmen-primary"
          title="Wash & Fold"
          priceLabel="AED 75 per bag"
          selected={services.washAndFold}
          showSelectionIndicator
          onPress={() =>
            setServices({
              washAndFold: !services.washAndFold,
            })
          }
          pricingLink={{ label: "Learn More", onPress: learnMoreWF }}
        />

        {/* Plus separator */}
        <div className="relative px-4 py-3">
          <div className="border-t border-washmen-secondary-100" />
          <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-washmen-secondary-50">
            <Plus className="h-6 w-6 text-washmen-primary" strokeWidth={2.5} />
          </div>
        </div>

        {services.addPressing ? (
          <ComboRow
            icon={Shirt}
            iconBgClass="bg-washmen-secondary-100"
            iconFgClass="text-washmen-secondary-700"
            title="Press & Hang"
            rightSlot={
              <button
                type="button"
                aria-label="Edit pressing selections"
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.light();
                  goToWashAndFoldInfo();
                }}
                className="press-effect flex h-8 w-8 items-center justify-center rounded-full text-washmen-primary"
              >
                <Pencil className="h-4 w-4" strokeWidth={2.5} />
              </button>
            }
            onPress={goToWashAndFoldInfo}
          >
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="truncate text-sm text-washmen-secondary-700">
                All T-Shirts / Polos
              </p>
              <span className="shrink-0 rounded-md bg-washmen-primary-light px-2 py-1 text-[12px] font-medium text-washmen-primary">
                + AED 9 /item
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="press-effect mt-1 inline-flex text-sm font-medium text-washmen-primary underline underline-offset-2"
            >
              View Terms & Conditions
            </button>
          </ComboRow>
        ) : (
          <ComboRow
            icon={Shirt}
            iconBgClass="bg-washmen-secondary-100"
            iconFgClass="text-washmen-secondary-500"
            title="Add Pressing"
            subtitle="Press tops after washing"
            badge="NEW"
            rightSlot={
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-washmen-secondary-300"
                aria-hidden
              >
                <Plus className="h-3.5 w-3.5 text-washmen-secondary-300" strokeWidth={2.5} />
              </div>
            }
            onPress={goToWashAndFoldInfo}
          />
        )}
      </div>

      <ServiceCard
        icon={Shirt}
        iconBgClass="bg-[#E8F5E9]"
        iconFgClass="text-[#22C55E]"
        title="Clean & Press"
        pricingLink={{ label: "View Pricing", onPress: () => {} }}
        selected={services.cleanAndPress}
        onPress={() => setServices({ cleanAndPress: !services.cleanAndPress })}
      />

      <ServiceCard
        icon={BedDouble}
        iconBgClass="bg-[#FCE4EC]"
        iconFgClass="text-[#EC407A]"
        title="Bed & Bath"
        pricingLink={{ label: "View Pricing", onPress: () => {} }}
        selected={services.bedAndBath}
        onPress={() => setServices({ bedAndBath: !services.bedAndBath })}
      />

      <ServiceCard
        icon={Wind}
        iconBgClass="bg-washmen-secondary-100"
        iconFgClass="text-washmen-secondary-700"
        title="Press Only"
        pricingLink={{ label: "View Pricing", onPress: () => {} }}
        selected={services.pressOnly}
        onPress={() => setServices({ pressOnly: !services.pressOnly })}
      />

      {showExtras && (
        <>
          <ServiceCard
            icon={Footprints}
            iconBgClass="bg-[#FFF3E0]"
            iconFgClass="text-[#FB923C]"
            title="Shoe & Bag Care"
            pricingLink={{ label: "View Pricing", onPress: () => {} }}
          />
          <FineryCard />
        </>
      )}
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
        <button
          type="button"
          className="press-effect mt-1 inline-flex text-sm font-medium text-washmen-primary underline underline-offset-2"
        >
          View Pricing
        </button>
      </div>
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-washmen-secondary-300"
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
  priceLabel?: string;
  pricingLink?: { label: string; onPress: () => void };
  selected?: boolean;
  showSelectionIndicator?: boolean;
  rightSlot?: ReactNode;
  onPress?: () => void;
  children?: ReactNode;
}

function ComboRow({
  icon: Icon,
  iconBgClass,
  iconFgClass,
  title,
  subtitle,
  badge,
  priceLabel,
  pricingLink,
  selected,
  showSelectionIndicator,
  rightSlot,
  onPress,
  children,
}: ComboRowProps) {
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
      className={cn("press-effect flex w-full items-start gap-3 p-4 text-left")}
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
          {priceLabel && (
            <span className="rounded-md bg-washmen-primary-light px-2 py-0.5 text-[12px] font-medium text-washmen-primary">
              {priceLabel}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-washmen-secondary-500">
            {subtitle}
          </p>
        )}
        {pricingLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              haptics.light();
              pricingLink.onPress();
            }}
            className="press-effect mt-1 inline-flex text-sm font-medium text-washmen-primary underline decoration-2 underline-offset-2"
          >
            {pricingLink.label}
          </button>
        )}
        {children}
      </div>
      {rightSlot ? (
        <div className="shrink-0 self-center">{rightSlot}</div>
      ) : showSelectionIndicator ? (
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border-[1.5px] transition-colors",
            selected
              ? "border-washmen-success bg-washmen-success text-white"
              : "border-washmen-secondary-300 bg-transparent text-washmen-secondary-300"
          )}
          aria-hidden
        >
          {selected ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : (
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
        </div>
      ) : null}
    </div>
  );
}