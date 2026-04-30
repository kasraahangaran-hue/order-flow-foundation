import { Check, Plus, WashingMachine, Shirt, BedDouble, Footprints, Pencil } from "lucide-react";
import { ComponentType, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { ServiceCard } from "./ServiceCard";
import { PricingLink } from "./PricingLink";
import { useOrderStore, ServicesState } from "@/stores/orderStore";
import { PRESSING_CATEGORIES } from "@/data/pressingCategories";

export type SelectedServicesSnapshot = ServicesState;

interface ServiceSelectorProps {
  variant: "screen" | "sheet";
  entryPoint: "laundry" | "quick-checkout";
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
  onLearnMoreWashAndFold,
}: ServiceSelectorProps) {
  const navigate = useNavigate();
  const services = useOrderStore((s) => s.services);
  const setServices = useOrderStore((s) => s.setServices);

  const goToWashAndFoldInfo = () => navigate("/laundry/wash-and-fold-info");
  const learnMoreWF = onLearnMoreWashAndFold ?? goToWashAndFoldInfo;

  const showExtras = entryPoint === "quick-checkout";
  const pressActive = services.addPressing && services.washAndFold;

  return (
    <div className={cn("flex flex-col gap-2")}>
      {/* Wash & Fold + Add Pressing combo card */}
      <div className="rounded-card bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <ComboRow
          icon={WashingMachine}
          iconBgClass="bg-washmen-secondary-aqua"
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
          paddingClass={services.addPressing ? "pt-4 px-4 pb-4" : "pt-4 px-4 pb-2"}
        />

        {!services.addPressing && (
          /* Plus separator — sits in the icon column, only when inactive */
          <div className="flex items-center px-4 py-1">
            <div className="flex h-4 w-12 shrink-0 items-center justify-center">
              <Plus
                className="h-4 w-4 text-washmen-primary"
                strokeWidth={2}
              />
            </div>
          </div>
        )}

        {services.addPressing ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              haptics.light();
              goToWashAndFoldInfo();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                haptics.light();
                goToWashAndFoldInfo();
              }
            }}
            className="press-effect flex flex-col text-left"
          >
            <div className="flex items-start gap-3 px-4 pt-3 pb-2">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                  pressActive ? "bg-washmen-secondary-aqua" : "bg-washmen-secondary-100"
                )}
              >
                <Shirt
                  className={cn(
                    "h-6 w-6 transition-colors",
                    pressActive ? "text-washmen-primary" : "text-washmen-secondary-400"
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-base font-semibold leading-tight transition-colors",
                      pressActive ? "text-washmen-secondary-900" : "text-washmen-secondary-400"
                    )}
                  >
                    Press & Hang
                  </p>
                  <span className="rounded-md bg-washmen-warning/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-washmen-secondary-800">
                    NEW
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-0.5 truncate text-sm leading-tight transition-colors",
                    pressActive ? "text-washmen-secondary-500" : "text-washmen-secondary-400"
                  )}
                >
                  Press tops after washing
                </p>
              </div>
              <button
                type="button"
                aria-label="Edit pressing selections"
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.light();
                  goToWashAndFoldInfo();
                }}
                className={cn(
                  "press-effect mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center transition-colors",
                  pressActive ? "text-washmen-primary" : "text-washmen-secondary-400"
                )}
              >
                <Pencil className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
            <div className="px-4 pb-4 pl-[76px]">
              <div className="flex flex-col gap-1">
                {(() => {
                  const selectedIds = services.pressingPrefs?.items ?? [];
                  const displayCats = selectedIds.length > 0
                    ? PRESSING_CATEGORIES.filter((c) => selectedIds.includes(c.id))
                    : PRESSING_CATEGORIES.slice(0, 3);
                  return displayCats.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex-1 text-[12px] font-light leading-[18px] transition-colors",
                          pressActive ? "text-washmen-secondary-700" : "text-washmen-secondary-400"
                        )}
                      >
                        {cat.label}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-normal leading-[18px] transition-colors",
                          pressActive
                            ? "bg-washmen-light-aqua text-washmen-primary"
                            : "bg-washmen-secondary-100 text-washmen-secondary-400"
                        )}
                      >
                        + AED {cat.ratePlus} /item
                      </span>
                    </div>
                  ));
                })()}
              </div>
              {services.pressingPrefs && services.pressingPrefs.items.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.light();
                    navigate("/laundry/wash-and-fold-info/terms", {
                      state: { mode: "view" },
                    });
                  }}
                  className={cn(
                    "press-effect mt-2 inline-flex text-xs font-normal underline underline-offset-2 transition-colors",
                    pressActive ? "text-washmen-primary" : "text-washmen-secondary-400"
                  )}
                >
                  View Terms & Conditions
                </button>
              )}
            </div>
          </div>
        ) : (
          <ComboRow
            icon={Shirt}
            iconBgClass={
                  services.washAndFold ? "bg-washmen-secondary-aqua" : "bg-washmen-secondary-100"
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
        iconBgClass="bg-washmen-light-green"
        iconFgClass="text-washmen-primary-green"
        title="Clean & Press"
        pricingLink={{ label: "View Pricing", onPress: () => {} }}
        selected={services.cleanAndPress}
        onPress={() => setServices({ cleanAndPress: !services.cleanAndPress })}
      />

      <ServiceCard
        icon={BedDouble}
        iconBgClass="bg-washmen-light-pink"
        iconFgClass="text-washmen-pink"
        title="Bed & Bath"
        pricingLink={{ label: "View Pricing", onPress: () => {} }}
        selected={services.bedAndBath}
        onPress={() => setServices({ bedAndBath: !services.bedAndBath })}
      />

      <ServiceCard
        icon={IronIcon}
        iconBgClass="bg-washmen-light-grey"
        iconFgClass="text-washmen-primary"
        title="Press Only"
        pricingLink={{ label: "View Pricing", onPress: () => {} }}
        selected={services.pressOnly}
        onPress={() => setServices({ pressOnly: !services.pressOnly })}
      />

      {showExtras && (
        <>
          <ServiceCard
            icon={Footprints}
            iconBgClass="bg-washmen-light-orange"
            iconFgClass="text-washmen-primary-orange"
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
        <PricingLink label="View Pricing" onPress={() => {}} />
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
              "truncate text-base font-semibold leading-tight transition-colors",
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
            <span className="rounded-md bg-washmen-secondary-aqua px-2 py-0.5 text-[12px] font-medium text-washmen-primary">
              {priceLabel}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            className={cn(
              "mt-0.5 truncate text-sm leading-tight transition-colors",
              subtitleClass ?? "text-washmen-secondary-500"
            )}
          >
            {subtitle}
          </p>
        )}
        {pricingLink && (
          <PricingLink label={pricingLink.label} onPress={pricingLink.onPress} />
        )}
        {children}
      </div>
      {rightSlot ? (
        <div className="shrink-0 self-start">{rightSlot}</div>
      ) : showSelectionIndicator ? (
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border-[1.5px] transition-colors",
          selected
              ? "border-washmen-primary-green bg-washmen-primary-green text-washmen-primary"
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