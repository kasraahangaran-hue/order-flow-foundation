import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import doorImg from "@/assets/pickup-at-door.jpg";
import meetImg from "@/assets/pickup-meet-driver.jpg";

interface PickupSchedulingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PickupMode = "door" | "in_person";

interface DaySlots {
  date: string;
  label: string;
  subLabel: string;
  slots: string[];
}

function toIso(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// TODO: Replace with API call returning available slots per day per zone.
const baseSlots = [
  "03:00 pm - 05:00 pm",
  "04:00 pm - 06:00 pm",
  "05:00 pm - 07:00 pm",
  "06:00 pm - 08:00 pm",
  "07:00 pm - 09:00 pm",
  "08:00 pm - 10:00 pm",
  "09:00 pm - 11:00 pm",
  "10:00 pm - 12:00 am",
];

function buildMockDays(): DaySlots[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: DaySlots[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    let label: string;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Tomorrow";
    else label = d.toLocaleDateString("en-US", { weekday: "long" });
    const subLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days.push({ date: toIso(d), label, subLabel, slots: baseSlots });
  }
  return days;
}

interface TypeTileProps {
  selected: boolean;
  image: string;
  label: string;
  onSelect: () => void;
}

function TypeTile({ selected, image, label, onSelect }: TypeTileProps) {
  return (
    <button
      type="button"
      onClick={() => {
        haptics.light();
        onSelect();
      }}
      className={cn(
        "press-effect flex flex-col overflow-hidden rounded-2xl text-left transition-all",
        selected ? "border-2 border-primary" : "border-2 border-transparent"
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary/40">
        <img
          src={image}
          alt={label}
          loading="lazy"
          width={512}
          height={384}
          className={cn(
            "h-full w-full object-cover transition-all",
            selected ? "" : "opacity-70 grayscale"
          )}
        />
      </div>
      <div
        className={cn(
          "px-3 py-3 text-center text-sm font-medium leading-tight transition-colors",
          selected ? "bg-washmen-light-green text-washmen-primary" : "bg-secondary/40 text-foreground"
        )}
      >
        {label.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </button>
  );
}

export function PickupSchedulingSheet({ open, onOpenChange }: PickupSchedulingSheetProps) {
  const storedPickup = useOrderStore((s) => s.pickup);
  const setPickup = useOrderStore((s) => s.setPickup);

  const days = useMemo(() => buildMockDays(), []);

  const [step, setStep] = useState<1 | 2>(1);
  const [pickupMode, setPickupMode] = useState<PickupMode>("door");
  const [selectedDate, setSelectedDate] = useState<string>(days[0].date);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Reset internal state from store each time sheet opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setPickupMode(storedPickup?.mode ?? "door");
      setSelectedDate(storedPickup?.date ?? days[0].date);
      setSelectedSlot(storedPickup?.slot ?? null);
    }
  }, [open, storedPickup, days]);

  const activeDay = days.find((d) => d.date === selectedDate) ?? days[0];

  const onConfirmStep1 = () => {
    haptics.light();
    setStep(2);
  };

  const onDone = () => {
    if (!selectedSlot) return;
    setPickup({ mode: pickupMode, date: selectedDate, slot: selectedSlot });
    haptics.medium();
    onOpenChange(false);
  };

  const step2Title = pickupMode === "in_person" ? "Pick Up in Person" : "Pick Up at Door";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] rounded-t-[24px] border-0 bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-full max-h-[calc(90vh-1rem)] flex-col px-4 pt-2">
          {step === 1 ? (
            <div key="step-1" className="flex flex-1 flex-col animate-in fade-in-0 duration-200">
              <h2 className="mt-2 text-center text-lg font-semibold text-washmen-primary">
                Schedule Your Pick Up
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <TypeTile
                  selected={pickupMode === "door"}
                  image={doorImg}
                  label={"Pick Up\nat Door"}
                  onSelect={() => setPickupMode("door")}
                />
                <TypeTile
                  selected={pickupMode === "in_person"}
                  image={meetImg}
                  label={"Meet driver\nin person"}
                  onSelect={() => setPickupMode("in_person")}
                />
              </div>
              <p className="mt-5 text-center text-sm text-foreground/80">
                {pickupMode === "door"
                  ? "Leave your bags outside your door for a Washmen driver to collect"
                  : "Meet the Washmen driver in person and hand over your bags"}
              </p>
              <div className="mt-auto flex items-center gap-3 pb-4 pt-6">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="press-effect flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background"
                  aria-label="Close"
                >
                  <ArrowLeft className="h-5 w-5 text-washmen-primary" />
                </button>
                <Button onClick={onConfirmStep1} className="h-12 flex-1 text-sm font-semibold">
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <div key="step-2" className="flex flex-1 flex-col animate-in fade-in-0 duration-200">
              <h2 className="mt-2 text-center text-lg font-semibold text-washmen-primary">
                {step2Title}
              </h2>
              <div className="mt-4 grid min-h-[360px] flex-1 grid-cols-[120px_1fr] gap-3 overflow-hidden">
                <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                  {days.map((d) => {
                    const isSel = d.date === selectedDate;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => {
                          haptics.light();
                          setSelectedDate(d.date);
                          setSelectedSlot(null);
                        }}
                        className={cn(
                          "press-effect rounded-xl border px-3 py-2.5 text-left",
                          isSel
                            ? "border-washmen-primary bg-washmen-light-green"
                            : "border-border/60 bg-background"
                        )}
                      >
                        <p className="text-sm font-medium leading-tight text-foreground">{d.label}</p>
                        <p className="mt-0.5 text-xs font-light text-muted-foreground">{d.subLabel}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                  {activeDay.slots.map((slot) => {
                    const isSel = slot === selectedSlot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          haptics.light();
                          setSelectedSlot(slot);
                        }}
                        className={cn(
                          "press-effect whitespace-pre-line rounded-xl border px-3 py-2.5 text-left",
                          isSel
                            ? "border-washmen-primary bg-washmen-light-green"
                            : "border-border/60 bg-background"
                        )}
                      >
                        <p className="text-xs font-light text-muted-foreground">between</p>
                        <p className="text-sm font-medium text-foreground">{slot}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 pb-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="press-effect flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5 text-washmen-primary" />
                </button>
                <Button
                  onClick={onDone}
                  disabled={!selectedSlot}
                  className="h-12 flex-1 text-sm font-semibold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}