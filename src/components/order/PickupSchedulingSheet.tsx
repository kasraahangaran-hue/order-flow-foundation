import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { DateSlotPicker, type DayOption, type SlotOption } from "./DateSlotPicker";
import doorImg from "@/assets/pickup-at-door.jpg";
import driverImg from "@/assets/pickup-meet-driver.jpg";

interface PickupSchedulingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PickupMode = "door" | "in_person";

// TODO: Replace with API call returning available pickup slots per day per zone.
const PICKUP_SLOTS: SlotOption[] = [
  { time: "03:00 pm - 05:00 pm", variant: "between" },
  { time: "04:00 pm - 06:00 pm", variant: "between" },
  { time: "05:00 pm - 07:00 pm", variant: "between" },
  { time: "06:00 pm - 08:00 pm", variant: "between" },
  { time: "07:00 pm - 09:00 pm", variant: "between" },
  { time: "08:00 pm - 10:00 pm", variant: "between" },
  { time: "09:00 pm - 11:00 pm", variant: "between" },
  { time: "10:00 pm - 12:00 am", variant: "between" },
];

function buildPickupMockDays(): DayOption[] {
  const days: DayOption[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    let label: string;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Tomorrow";
    else label = `+${i} days`;
    const subLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    days.push({ date: iso, label, subLabel, slots: PICKUP_SLOTS });
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
          "whitespace-pre-line px-3 py-3 text-center text-sm font-medium leading-tight transition-colors",
          selected ? "bg-washmen-light-green text-washmen-primary" : "bg-secondary/40 text-foreground"
        )}
      >
        {label}
      </div>
    </button>
  );
}

export function PickupSchedulingSheet({ open, onOpenChange }: PickupSchedulingSheetProps) {
  const storedPickup = useOrderStore((s) => s.pickup);
  const setPickup = useOrderStore((s) => s.setPickup);

  const days = useMemo(() => buildPickupMockDays(), []);

  const [step, setStep] = useState<1 | 2>(1);
  const [pickupMode, setPickupMode] = useState<PickupMode>("door");
  const [selectedDate, setSelectedDate] = useState<string>(days[0].date);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setPickupMode(storedPickup?.mode ?? "door");
      const seedDate = storedPickup?.date ?? days[0].date;
      setSelectedDate(seedDate);
      const day = days.find((d) => d.date === seedDate) ?? days[0];
      const stored = storedPickup?.slot
        ? day.slots.find((s) => s.time === storedPickup.slot)
        : null;
      setSelectedSlot(stored ?? day.slots[0] ?? null);
    }
  }, [open, storedPickup, days]);

  const onDone = () => {
    if (!selectedSlot) return;
    setPickup({ mode: pickupMode, date: selectedDate, slot: selectedSlot.time });
    haptics.medium();
    onOpenChange(false);
  };

  const step2Title = pickupMode === "in_person" ? "Pick Up in Person" : "Pick Up at Door";
  const title = step === 1 ? "Schedule Your Pick Up" : step2Title;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] rounded-t-[24px] border-0 bg-background pb-[env(safe-area-inset-bottom)]">
        <DrawerHeader className="mb-2 flex-shrink-0 px-4 pb-2 pt-2 text-left">
          <DrawerTitle className="text-left text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
            {title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex max-h-[70vh] flex-col overflow-y-auto px-4 pb-2">
          {step === 1 ? (
            <div key="step-1" className="animate-in fade-in-0 duration-200">
              <div className="grid grid-cols-2 gap-3">
                <TypeTile
                  selected={pickupMode === "door"}
                  image={doorImg}
                  label={"Pick Up\nat Door"}
                  onSelect={() => setPickupMode("door")}
                />
                <TypeTile
                  selected={pickupMode === "in_person"}
                  image={driverImg}
                  label={"Meet driver\nin person"}
                  onSelect={() => setPickupMode("in_person")}
                />
              </div>
              <p className="mt-5 px-2 text-center text-sm leading-relaxed text-foreground/80">
                {pickupMode === "door"
                  ? "Leave your bags outside your door for a Washmen driver to collect"
                  : "Meet the Washmen driver in person and hand over your bags"}
              </p>
            </div>
          ) : (
            <div key="step-2" className="animate-in fade-in-0 duration-200">
              <DateSlotPicker
                days={days}
                selectedDate={selectedDate}
                selectedSlotTime={selectedSlot?.time ?? null}
                onSelectDate={setSelectedDate}
                onSelectSlot={setSelectedSlot}
                showOnTimeTip={false}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={() => {
              if (step === 2) setStep(1);
              else onOpenChange(false);
            }}
            className="press-effect flex h-[42px] w-12 items-center justify-center rounded-md border border-border bg-background"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-washmen-primary" />
          </button>
          {step === 1 ? (
            <Button
              onClick={() => {
                haptics.light();
                setStep(2);
              }}
              className="h-[42px] flex-1 text-sm font-semibold"
            >
              Confirm
            </Button>
          ) : (
            <Button
              onClick={onDone}
              disabled={!selectedSlot}
              className="h-[42px] flex-1 text-sm font-semibold"
            >
              Done
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}