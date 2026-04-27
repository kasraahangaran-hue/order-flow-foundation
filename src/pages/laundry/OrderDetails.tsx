import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Home, Package, PackageOpen, Pencil, Plus } from "lucide-react";
import { OrderLayout } from "@/components/order/OrderLayout";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { nativeBridge, NativeSheetName } from "@/lib/nativeBridge";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { formatScheduleLines } from "@/lib/dateFormat";

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
  const actionColor = "text-washmen-primary";
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
        <p className={cn("text-base font-semibold text-washmen-secondary-900", titleClassName)}>{title}</p>
        <ActionIcon className={cn("h-5 w-5", actionColor)} strokeWidth={2} aria-hidden />
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-washmen-secondary-aqua">
        <Icon className="h-4 w-4 text-washmen-primary" />
      </div>
      <p
        className={cn(
          "min-w-0 flex-1 text-base",
          muted ? "italic font-light text-washmen-secondary-400" : "text-washmen-secondary-900"
        )}
      >
        {text}
      </p>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-base font-light italic text-washmen-secondary-400">{text}</p>
  );
}

function TimeRow({ day, time }: { day: string; time: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-washmen-secondary-aqua">
        <Clock className="h-4 w-4 text-washmen-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base leading-tight text-washmen-secondary-900">{day}</p>
        <p className="text-base leading-tight text-washmen-secondary-900">{time}</p>
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
    if (!dropoff) setDropoff({ date: dayPlus(2), slot: "Anytime during the day", surcharge: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSheet = (name: NativeSheetName | "driver_instructions") => {
    // driver_instructions is not yet a typed native sheet — fall through to the bridge stub.
    nativeBridge.openSheet(name as NativeSheetName);
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
          onPress={() => openSheet("pickup_schedule")}
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
          onPress={() => openSheet("dropoff_schedule")}
        >
          {dropoff ? (
            <div className="flex flex-col gap-2">
              <ValueRow icon={PackageOpen} text="Drop off at the Door" />
              {(() => {
                const { day, time } = formatScheduleLines(dropoff.date, dropoff.slot);
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
          onPress={() => openSheet("driver_instructions")}
        >
          {driverInstructions ? (
            <ValueRow
              icon={Bell}
              text={
                [driverInstructions.pickup, driverInstructions.dropoff]
                  .filter(Boolean)
                  .join(" / ") || "No Preference"
              }
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-washmen-secondary-aqua">
                <Bell className="h-4 w-4 text-washmen-primary" />
              </div>
              <p className="min-w-0 flex-1 text-base text-washmen-secondary-500">No Preference</p>
            </div>
          )}
        </DetailCard>
      </div>
    </OrderLayout>
  );
}