import { useEffect, useState } from "react";
// Custom illustrative pickup/dropoff icons (match OrderDetails screen).
// Multi-color washmen-themed SVGs at 32×32. Rendered as <img> elements
// since they have brand fills baked in, not currentColor outlines.
import pickupIconUrl from "@/assets/icons/order-pickup.svg";
import dropoffIconUrl from "@/assets/icons/order-dropoff.svg";
import { BottomSheetShell } from "./BottomSheetShell";
import { RadioRow } from "./RadioRow";
import type {
  DriverInstructionsState,
  DriverPickupChoice,
  DriverDropoffChoice,
} from "@/stores/orderStore";

export type PickupMode = "door" | "in_person";
export type DropoffMode = "door" | "in_person";

interface DriverInstructionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: DriverInstructionsState;
  pickupMode: PickupMode;
  dropoffMode: DropoffMode;
  onApply: (value: DriverInstructionsState) => void;
}

const PICKUP_OPTIONS_DOOR: { value: DriverPickupChoice; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "at_concierge", label: "At concierge / reception" },
  { value: "call_when_arrive", label: "Call me when you arrive" },
];

const PICKUP_OPTIONS_IN_PERSON: { value: DriverPickupChoice; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "ring_doorbell", label: "Ring the doorbell" },
  { value: "knock_door", label: "Knock the door" },
  { value: "do_not_disturb_bags_outside", label: "Do not disturb, bags outside" },
  { value: "call_when_arrive", label: "Call me when you arrive" },
];

const DROPOFF_OPTIONS_DOOR: { value: DriverDropoffChoice; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "hang_door_handle", label: "Hang on door handle" },
  { value: "at_concierge", label: "At concierge / reception" },
  { value: "knock_door", label: "Knock the door" },
  { value: "call_when_arrive", label: "Call me when you arrive" },
];

const DROPOFF_OPTIONS_IN_PERSON: { value: DriverDropoffChoice; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "ring_doorbell", label: "Ring the doorbell" },
  { value: "knock_door", label: "Knock the door" },
  { value: "do_not_disturb_packages_outside", label: "Do not disturb, leave packages outside" },
  { value: "call_when_arrive", label: "Call me when you arrive" },
];

function pickupOptionsFor(mode: PickupMode) {
  return mode === "door" ? PICKUP_OPTIONS_DOOR : PICKUP_OPTIONS_IN_PERSON;
}

function dropoffOptionsFor(mode: DropoffMode) {
  return mode === "door" ? DROPOFF_OPTIONS_DOOR : DROPOFF_OPTIONS_IN_PERSON;
}

export function DriverInstructionsSheet({
  open,
  onOpenChange,
  initialValue,
  pickupMode,
  dropoffMode,
  onApply,
}: DriverInstructionsSheetProps) {
  const pickupOptions = pickupOptionsFor(pickupMode);
  const dropoffOptions = dropoffOptionsFor(dropoffMode);

  const [draft, setDraft] = useState<DriverInstructionsState>(initialValue);

  useEffect(() => {
    if (!open) return;
    const pickupValid = pickupOptions.some((o) => o.value === initialValue.pickup);
    const dropoffValid = dropoffOptions.some((o) => o.value === initialValue.dropoff);
    setDraft({
      pickup: pickupValid ? initialValue.pickup : "no_preference",
      dropoff: dropoffValid ? initialValue.dropoff : "no_preference",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Driver Instructions"
      footer="apply-only"
      primaryLabel="Done"
      onPrimary={() => {
        onApply(draft);
        onOpenChange(false);
      }}
    >
      <div className="flex flex-col gap-4">
        {/* PICK UP SECTION */}
        <div className="flex flex-col gap-4 pb-4 border-b border-washmen-secondary-300/50">
          <div className="flex items-center gap-3">
            <img
              src={pickupIconUrl}
              alt=""
              aria-hidden="true"
              className="h-8 w-8 shrink-0 select-none"
              draggable={false}
            />
            <div className="flex flex-col">
              <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
                Pick Up
              </p>
              <p className="text-[10px] font-normal leading-[14px] tracking-[0.3px] text-muted-foreground">
                Do you have any pickup instructions?
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            {pickupOptions.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                selected={draft.pickup === opt.value}
                onSelect={() => setDraft((d) => ({ ...d, pickup: opt.value }))}
              />
            ))}
          </div>
        </div>

        {/* DROP OFF SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src={dropoffIconUrl}
              alt=""
              aria-hidden="true"
              className="h-8 w-8 shrink-0 select-none"
              draggable={false}
            />
            <div className="flex flex-col">
              <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
                Drop Off
              </p>
              <p className="text-[10px] font-normal leading-[14px] tracking-[0.3px] text-muted-foreground">
                Do you have any delivery instructions?
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            {dropoffOptions.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                selected={draft.dropoff === opt.value}
                onSelect={() => setDraft((d) => ({ ...d, dropoff: opt.value }))}
              />
            ))}
          </div>
        </div>
      </div>
    </BottomSheetShell>
  );
}