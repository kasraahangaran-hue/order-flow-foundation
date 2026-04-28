import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Home, Package, PackageOpen, Pencil, Plus } from "lucide-react";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import type { DriverInstructionsState } from "@/stores/orderStore";
import { nativeBridge, NativeSheetName } from "@/lib/nativeBridge";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { formatScheduleLines } from "@/lib/dateFormat";
import { PickupSchedulingSheet } from "@/components/order/PickupSchedulingSheet";
import { DropOffSheet } from "@/components/order/DropOffSheet";

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
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-semibold leading-tight text-washmen-primary", titleClassName)}>{title}</p>
        <ActionIcon className="h-4 w-4 text-muted-foreground" strokeWidth={2} aria-hidden />
      </div>
      {children ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}

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
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-washmen-primary" />
      </div>
      <p
        className={cn(
          "min-w-0 flex-1 text-sm",
          muted ? "italic font-light text-washmen-secondary-400" : "text-foreground"
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
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Clock className="h-4 w-4 text-washmen-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-tight text-foreground">{day}</p>
        <p className="text-xs leading-tight text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const address = useOrderStore((s) => s.address);
  const pickup = useOrderStore((s) => s.pickup);
  const dropoff = useOrderStore((s) => s.dropoff);
  const driverInstructions = useOrderStore((s) => s.driverInstructions);
  const setAddress = useOrderStore((s) => s.setAddress);
  const setPickup = useOrderStore((s) => s.setPickup);
  const setDropoff = useOrderStore((s) => s.setDropoff);
  const setDriverInstructions = useOrderStore((s) => s.setDriverInstructions);

  const [pickupSheetOpen, setPickupSheetOpen] = useState(false);
  const [dropoffSheetOpen, setDropoffSheetOpen] = useState(false);

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
    if (!address) setAddress({ line1: "108, Azurite tower" });
    if (!pickup) setPickup({ mode: "door", date: dayPlus(0), slot: "02:00 pm - 04:00 pm" });
    if (!dropoff) setDropoff({ mode: "door", date: dayPlus(2), slot: "Anytime during the day", surcharge: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSheet = (name: NativeSheetName) => {
    nativeBridge.openSheet(name);
  };

  // TEMP: tap to toggle dummy driver instructions for UI dev. Replace with nativeBridge.openSheet() when wired up.
  const toggleDriverInstructions = () => {
    haptics.light();
    if (driverInstructions) {
      setDriverInstructions(null);
    } else {
      setDriverInstructions({
        pickup: "At concierge / reception",
        dropoff: "Hang on door handle",
      });
    }
  };

  const ctaEnabled = !!address && !!pickup && !!dropoff;

  const pickupModeLabel =
    pickup?.mode === "in_person" ? "Meet driver in person" : "Pick Up at Door";

  return (
    <OrderLayout
      title="Laundry Order"
      step={2}
      onBack={() => navigate(-1)}
      footerSlot={
        <Button
          className="flex-1 h-12 text-sm font-semibold"
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
          hasValue={!!address}
          onPress={() => openSheet("address")}
        >
          {address ? (
            <ValueRow
              icon={Home}
              text={
                address.apartment
                  ? `${address.line1}, ${address.apartment}`
                  : address.line1
              }
            />
          ) : (
            <EmptyRow text="Add your address" />
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
              <ValueRow icon={Package} text={pickupModeLabel} />
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
                icon={PackageOpen}
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
          hasValue={!!driverInstructions}
          onPress={toggleDriverInstructions}
          addAction
        >
          {driverInstructions ? (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Bell className="h-4 w-4 text-washmen-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight text-foreground">
                  <span className="font-semibold">Pick up:</span> {driverInstructions.pickup}
                </p>
                <p className="mt-0.5 text-sm leading-tight text-foreground">
                  <span className="font-semibold">Drop off:</span> {driverInstructions.dropoff}
                </p>
              </div>
            </div>
          ) : null}
        </DetailCard>
      </div>
      <PickupSchedulingSheet open={pickupSheetOpen} onOpenChange={setPickupSheetOpen} />
      <DropOffSheet open={dropoffSheetOpen} onOpenChange={setDropoffSheetOpen} />
    </OrderLayout>
  );
}