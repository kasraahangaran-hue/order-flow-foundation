import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Pencil, Plus } from "lucide-react";

// Custom illustrative icons for Order Details rows. Multi-color washmen-
// themed SVGs at 32×32. Clock stays Lucide (per Kasra's design preference).
import addressIconUrl from "@/assets/icons/order-address.svg";
import pickupIconUrl from "@/assets/icons/order-pickup.svg";
import dropoffIconUrl from "@/assets/icons/order-dropoff.svg";
import driverInstructionsIconUrl from "@/assets/icons/order-driver-instructions.svg";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { nativeBridge, NativeSheetName } from "@/lib/nativeBridge";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { formatScheduleLines } from "@/lib/dateFormat";
import { PickupSchedulingSheet } from "@/components/order/PickupSchedulingSheet";
import { DropOffSheet } from "@/components/order/DropOffSheet";
import { DriverInstructionsSheet } from "@/components/order/DriverInstructionsSheet";
import { SelectAddressSheet } from "@/components/order/SelectAddressSheet";
import { summarizeAddress } from "@/lib/addressFormatting";
import {
  summarizeDriverInstructions,
  DEFAULT_DRIVER_INSTRUCTIONS,
} from "@/lib/orderInstructionsLabels";

interface DetailCardProps {
  title: string;
  onPress: () => void;
  hasValue: boolean;
  /** Use Plus instead of Pencil in the header (for empty "add" actions). */
  addAction?: boolean;
  titleClassName?: string;
  children?: React.ReactNode;
}

function DetailCard({ title, onPress, hasValue, addAction, titleClassName, children }: DetailCardProps) {
  const ActionIcon = addAction && !hasValue ? Plus : Pencil;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        haptics.light();
        onPress();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          haptics.light();
          onPress();
        }
      }}
      className="press-effect w-full rounded-card bg-card p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm font-normal leading-tight text-washmen-primary", titleClassName)}>{title}</p>
          <ActionIcon className="h-4 w-4 text-washmen-primary" strokeWidth={2} aria-hidden />
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}

/**
 * Wraps a static SVG URL as a React component so it can be passed as
 * ValueRow's `icon` prop. The new icons have multi-color brand fills
 * baked in, so we don't tint via className like we do with Lucide.
 */
function makeImageIcon(src: string): React.ComponentType<{ className?: string }> {
  const Component: React.ComponentType<{ className?: string }> = ({ className }) => (
    <img src={src} alt="" aria-hidden="true" className={className} />
  );
  Component.displayName = `ImageIcon(${src})`;
  return Component;
}

const AddressIcon = makeImageIcon(addressIconUrl);
const PickupIcon = makeImageIcon(pickupIconUrl);
const DropoffIcon = makeImageIcon(dropoffIconUrl);

function ValueRow({
  icon: Icon,
  text,
  muted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        <Icon className="h-7 w-7 text-washmen-primary" />
      </div>
      <p
        className={cn(
          "min-w-0 flex-1 text-sm leading-[20px] tracking-[0.1px]",
          muted ? "italic font-light text-washmen-secondary-400" : "font-normal text-washmen-slate-grey"
        )}
      >
        {text}
      </p>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-sm font-light italic text-washmen-secondary-400">{text}</p>
  );
}

function TimeRow({ day, time }: { day: string; time: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        <Clock className="h-7 w-7 text-washmen-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-normal leading-[20px] tracking-[0.1px] text-washmen-slate-grey">{day}</p>
        <p className="text-sm font-normal leading-[20px] tracking-[0.1px] text-washmen-slate-grey">{time}</p>
      </div>
    </div>
  );
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const addresses = useOrderStore((s) => s.addresses);
  const selectedAddressId = useOrderStore((s) => s.selectedAddressId);
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;
  const pickup = useOrderStore((s) => s.pickup);
  const dropoff = useOrderStore((s) => s.dropoff);
  const driverInstructions = useOrderStore((s) => s.driverInstructions);
  const setPickup = useOrderStore((s) => s.setPickup);
  const setDropoff = useOrderStore((s) => s.setDropoff);
  const setDriverInstructions = useOrderStore((s) => s.setDriverInstructions);

  const [pickupSheetOpen, setPickupSheetOpen] = useState(false);
  const [dropoffSheetOpen, setDropoffSheetOpen] = useState(false);
  const [driverInstructionsSheetOpen, setDriverInstructionsSheetOpen] = useState(false);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);

  // TEMP: seed defaults for UI dev. Remove when bottom sheets are wired up.
  useEffect(() => {
    const today = new Date();
    const dayPlus = (n: number) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    if (!pickup) setPickup({ mode: "door", date: dayPlus(0), slot: "02:00 pm - 04:00 pm" });
    if (!dropoff) setDropoff({ mode: "door", date: dayPlus(2), slot: "Anytime", surcharge: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSheet = (name: NativeSheetName) => {
    nativeBridge.openSheet(name);
  };

  const openDriverInstructions = () => {
    haptics.light();
    setDriverInstructionsSheetOpen(true);
  };

  const ctaEnabled = !!selectedAddressId && !!pickup && !!dropoff;

  const pickupModeLabel =
    pickup?.mode === "in_person" ? "Meet driver in person" : "Pick Up at Door";

  return (
    <OrderLayout
      title="Laundry Order"
      step={2}
      onBack={() => navigate("/laundry/select-service")}
      footerSlot={
        <Button
          className="flex-1 h-[42px] rounded-[8px] text-sm font-semibold"
          disabled={!ctaEnabled}
          onClick={() => {
            haptics.medium();
            navigate("/laundry/order-instructions");
          }}
        >
          Continue to Order
        </Button>
      }
    >
      <div className="flex flex-col gap-2">
        {/* 1. Address */}
        <DetailCard
          title="Address"
          hasValue={!!selectedAddress}
          onPress={() => setAddressSheetOpen(true)}
        >
          {selectedAddress ? (
            <ValueRow
              icon={AddressIcon}
              text={summarizeAddress(selectedAddress)}
            />
          ) : (
            <EmptyRow text="No address selected" />
          )}
        </DetailCard>

        {/* 2. Pick Up */}
        <DetailCard
          title="Pick Up"
          hasValue={!!pickup}
          onPress={() => setPickupSheetOpen(true)}
        >
          {pickup ? (
            <div className="flex flex-col gap-2">
              <ValueRow icon={PickupIcon} text={pickupModeLabel} />
              {(() => {
                const { day, time } = formatScheduleLines(pickup.date, pickup.slot);
                return <TimeRow day={day} time={time} />;
              })()}
            </div>
          ) : (
            <EmptyRow text="Schedule pick up" />
          )}
        </DetailCard>

        {/* 3. Drop Off */}
        <DetailCard
          title="Drop Off"
          hasValue={!!dropoff}
          onPress={() => setDropoffSheetOpen(true)}
        >
          {dropoff ? (
            <div className="flex flex-col gap-2">
              <ValueRow
                icon={DropoffIcon}
                text={dropoff.mode === "in_person" ? "Receive from driver in person" : "Drop off at the Door"}
              />
              {(() => {
                const { day, time } = formatScheduleLines(dropoff.date, dropoff.slot, { showOffset: true });
                return <TimeRow day={day} time={time} />;
              })()}
            </div>
          ) : (
            <EmptyRow text="Schedule delivery" />
          )}
        </DetailCard>

        {/* 4. Driver Instructions */}
        <DetailCard
          title="Driver Instructions"
          hasValue={!!driverInstructions && !summarizeDriverInstructions(driverInstructions).isEmpty}
          onPress={openDriverInstructions}
          addAction
        >
          {driverInstructions && !summarizeDriverInstructions(driverInstructions).isEmpty ? (
            (() => {
              const summary = summarizeDriverInstructions(driverInstructions);
              return (
                <div className="flex items-start gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                    <img
                      src={driverInstructionsIconUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-7 w-7"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm leading-tight text-washmen-slate-grey">
                      <span className="font-semibold">Pick up:</span> <span className="font-normal">{summary.pickupSuffix}</span>
                    </p>
                    <p className="text-sm leading-tight text-washmen-slate-grey">
                      <span className="font-semibold">Drop off:</span> <span className="font-normal">{summary.dropoffSuffix}</span>
                    </p>
                  </div>
                </div>
              );
            })()
          ) : null}
        </DetailCard>
      </div>
      <PickupSchedulingSheet open={pickupSheetOpen} onOpenChange={setPickupSheetOpen} />
      <DropOffSheet open={dropoffSheetOpen} onOpenChange={setDropoffSheetOpen} />
      <SelectAddressSheet open={addressSheetOpen} onOpenChange={setAddressSheetOpen} />
      <DriverInstructionsSheet
        open={driverInstructionsSheetOpen}
        onOpenChange={setDriverInstructionsSheetOpen}
        initialValue={driverInstructions ?? DEFAULT_DRIVER_INSTRUCTIONS}
        pickupMode={pickup?.mode ?? "door"}
        dropoffMode={dropoff?.mode ?? "door"}
        onApply={(value) => setDriverInstructions(value)}
      />
    </OrderLayout>
  );
}