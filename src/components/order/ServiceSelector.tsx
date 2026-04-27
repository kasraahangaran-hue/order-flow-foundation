import { Check, Plus, WashingMachine, Shirt, BedDouble, Footprints, Pencil } from "lucide-react";
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
  userType?: "new" | "returning";
  onContinue?: (selected: SelectedServicesSnapshot) => void;
  onSkip?: () => void;
  onLearnMoreWashAndFold?: () => void;
}

function HangerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 4a2 2 0 1 0-2 2" />
      <path d="M12 6v2" />
      <path d="m12 8-9 8a1 1 0 0 0 .6 1.8h16.8a1 1 0 0 0 .6-1.8L12 8z" />
    </svg>
  );
}

function IronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 18h20" />
      <path d="M4 18a8 6 0 0 1 16 0" />
      <path d="M16 8h2a2 2 0 0 1 2 2v2" />
      <circle cx="8" cy="14" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function ServiceSelector({
  variant,
  entryPoint,
  userType = "returning",
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
          priceLabel={userType === "returning" ? "AED 75 per bag" : undefined}
          selected={services.washAndFold}
          showSelectionIndicator
          onPress={() =>
            setServices({
              washAndFold: !services.washAndFold,
            })
          }
          pricingLink={{ label: "Learn More", onPress: learnMoreWF }}
          paddingClass="pt-4 px-4 pb-2"
        />

        {/* Plus separator — small grey + sitting in the icon column */}
        <div className="flex items-center px-4 py-1">
          <div className="flex h-4 w-12 shrink-0 items-center justify-center">
            <Plus
              className="h-4 w-4 text-washmen-primary"
              strokeWidth={2}
            />
          </div>
        </div>

        {services.addPressing ? (
          <ComboRow
            icon={Shirt}
            iconBgClass="bg-washmen-secondary-100"
            iconFgClass="text-washmen-secondary-700"
            title="Press & Hang"
            paddingClass="pt-2 px-4 pb-4"
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
            iconBgClass={
              services.washAndFold ? "bg-[#E0F7FA]" : "bg-washmen-secondary-100"
            }
            iconFgClass={
              services.washAndFold
                ? "text-washmen-primary"
                : "text-washmen-secondary-400"
            }
            title="Add Pressing"
            titleClass={
              services.washAndFold
                ? "text-washmen-secondary-900"
                : "text-washmen-secondary-400"
            }
            subtitle="Press tops after washing"
            subtitleClass={
              services.washAndFold
                ? "text-washmen-secondary-500"
                : "text-washmen-secondary-400"
            }
            badge="NEW"
            paddingClass="pt-2 px-4 pb-4"
            rightSlot={
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-[1.5px]",
                  services.washAndFold
                    ? "border-washmen-primary"
                    : "border-washmen-secondary-300"
                )}
                aria-hidden
              >
                <Plus
                  className={cn(
                    "h-3.5 w-3.5",
                    services.washAndFold
                      ? "text-washmen-primary"
                      : "text-washmen-secondary-300"
                  )}
                  strokeWidth={2.5}
                />
              </div>
            }
            onPress={goToWashAndFoldInfo}
          />
        )}
      </div>

      <ServiceCard
        icon={HangerIcon}
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
        icon={IronIcon}
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
  titleClass?: string;
  subtitle?: string;
  subtitleClass?: string;
  badge?: ReactNode;
  priceLabel?: string;
  pricingLink?: { label: string; onPress: () => void };
  selected?: boolean;
  showSelectionIndicator?: boolean;
  rightSlot?: ReactNode;
  onPress?: () => void;
  children?: ReactNode;
  paddingClass?: string;
}

function ComboRow({
  icon: Icon,
  iconBgClass,
  iconFgClass,
  title,
  titleClass,
  subtitle,
  subtitleClass,
  badge,
  priceLabel,
  pricingLink,
  selected,
  showSelectionIndicator,
  rightSlot,
  onPress,
  children,
  paddingClass,
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
      className={cn(
        "press-effect flex w-full items-start gap-3 text-left",
        paddingClass ?? "p-4"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
          iconBgClass
        )}
      >
        <Icon className={cn("h-6 w-6 transition-colors", iconFgClass)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-base font-semibold transition-colors",
              titleClass ?? "text-washmen-secondary-900"
            )}
          >
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
          <p
            className={cn(
              "mt-0.5 truncate text-sm transition-colors",
              subtitleClass ?? "text-washmen-secondary-500"
            )}
          >
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
      ) : null}
    </div>
  );
}