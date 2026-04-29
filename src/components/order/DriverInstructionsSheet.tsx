import { useEffect, useState } from "react";
import { Package, Truck, Shirt, Phone } from "lucide-react";
import { BottomSheetShell } from "./BottomSheetShell";
import { RadioRow } from "./RadioRow";
import { ToggleRow } from "./ToggleRow";
import type {
  DriverInstructionsState,
  DriverPickupChoice,
  DriverDropoffChoice,
  HangingInstructionChoice,
} from "@/stores/orderStore";

interface DriverInstructionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: DriverInstructionsState;
  onApply: (value: DriverInstructionsState) => void;
}

const PICKUP_OPTIONS: { value: DriverPickupChoice; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "ring_doorbell", label: "Ring the doorbell" },
  { value: "knock_door", label: "Knock the door" },
  { value: "do_not_disturb_outside", label: "Do not disturb, bags outside" },
];

const DROPOFF_OPTIONS: { value: DriverDropoffChoice; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "ring_doorbell", label: "Ring the doorbell" },
  { value: "knock_door", label: "Knock the door" },
  { value: "do_not_disturb_outside", label: "Do not disturb, leave packages outside" },
];

const HANGING_OPTIONS: { value: HangingInstructionChoice; label: string }[] = [
  { value: "door_handle", label: "Hang on the door handle" },
  { value: "door_frame", label: "Hang on the door frame" },
  { value: "none", label: "None" },
];

const phoneIcon = <Phone className="h-5 w-5 text-washmen-primary" />;

export function DriverInstructionsSheet({
  open,
  onOpenChange,
  initialValue,
  onApply,
}: DriverInstructionsSheetProps) {
  const [draft, setDraft] = useState<DriverInstructionsState>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <BottomSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Driver Instructions"
      footer="back-and-apply"
      primaryLabel="Apply"
      onBack={() => onOpenChange(false)}
      onPrimary={() => {
        onApply(draft);
        onOpenChange(false);
      }}
    >
      <div className="flex flex-col gap-4">
        {/* PICK UP SECTION */}
        <div className="flex flex-col gap-4 pb-6 border-b border-washmen-secondary-300/50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Package className="h-6 w-6 text-washmen-primary" />
            </div>
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
            {PICKUP_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                selected={draft.pickup === opt.value}
                onSelect={() => setDraft((d) => ({ ...d, pickup: opt.value }))}
              />
            ))}
          </div>

          <div className="border-t border-washmen-secondary-300/50 pt-4">
            <ToggleRow
              label="Call on arrival"
              checked={draft.pickupCallOnArrival}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, pickupCallOnArrival: v }))}
              icon={phoneIcon}
            />
          </div>
        </div>

        {/* DROP OFF SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Truck className="h-6 w-6 text-washmen-primary" />
            </div>
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
            {DROPOFF_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                selected={draft.dropoff === opt.value}
                onSelect={() => setDraft((d) => ({ ...d, dropoff: opt.value }))}
              />
            ))}
          </div>

          {/* Hanging Instructions sub-section */}
          <div className="border-t border-washmen-secondary-300/50 pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <Shirt className="h-6 w-6 text-washmen-primary" />
              </div>
              <p className="text-[14px] font-normal leading-[20px] text-washmen-primary">
                Hanging Instructions
              </p>
            </div>
            <div className="flex flex-col">
              {HANGING_OPTIONS.map((opt) => (
                <RadioRow
                  key={opt.value}
                  label={opt.label}
                  selected={draft.hanging === opt.value}
                  onSelect={() => setDraft((d) => ({ ...d, hanging: opt.value }))}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-washmen-secondary-300/50 pt-4">
            <ToggleRow
              label="Call on arrival"
              checked={draft.dropoffCallOnArrival}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, dropoffCallOnArrival: v }))}
              icon={phoneIcon}
            />
          </div>
        </div>
      </div>
    </BottomSheetShell>
  );
}